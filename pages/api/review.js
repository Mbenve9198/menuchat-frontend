// Importiamo la libreria Axios per effettuare richieste HTTP
import axios from 'axios';

export default async function handler(req, res) {
  // Accetta solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metodo non consentito' });
  }

  try {
    // Estrai i dati dalla richiesta
    const { restaurantName, restaurantDetails, reviewLink, modelId } = req.body;
    
    // Verifica che i dati necessari siano presenti
    if (!restaurantDetails) {
      return res.status(400).json({
        success: false,
        error: 'I dettagli del ristorante sono obbligatori'
      });
    }
    
    console.log('Generazione template di recensione per:', restaurantName);
    
    // Implementazione di una versione semplificata che non dipende da Claude
    // Questa versione genererà template di recensione generici
    
    // Cerca di estrarre informazioni utili dai dettagli del ristorante
    const name = restaurantDetails.name || restaurantName || 'nostro ristorante';
    const cuisine = restaurantDetails.cuisineTypes?.[0] || '';
    
    // Array di template predefiniti
    const templates = [
      `Ciao! Ti è piaciuto il tuo pasto da ${name}? Ci farebbe molto piacere ricevere una tua recensione.`,
      
      `Grazie per aver scelto ${name}! Apprezzeremmo molto se potessi dedicare un momento a lasciarci una recensione.`,
      
      `La tua esperienza da ${name} è importante per noi. Ti dispiacerebbe condividere il tuo feedback con una breve recensione?`
    ];

    // Varianti italiane se il ristorante serve cucina italiana
    if (cuisine.toLowerCase().includes('italian') || cuisine.toLowerCase().includes('italiana')) {
      templates[0] = `Ciao! Ti è piaciuta la tua esperienza da ${name}? Ci farebbe molto piacere leggere una tua recensione. Grazie mille!`;
      templates[1] = `Grazie per aver scelto ${name}! Il tuo feedback è prezioso per noi. Ti dispiacerebbe dedicare un momento per una recensione?`;
      templates[2] = `La tua opinione è importante per noi. Come è stata la tua esperienza da ${name}? Lasciaci una recensione!`;
    }
    
    // Tenta di chiamare Claude in background senza aspettare la risposta
    try {
      // Se l'API di backend è configurata e disponibile
      if (process.env.BACKEND_URL) {
        // Invia la richiesta in background
        axios.post(`${process.env.BACKEND_URL}/api/generate-review-templates`, {
          restaurantName, 
          restaurantDetails,
          reviewLink,
          modelId
        }).catch(e => console.error('Errore nella richiesta di background a Claude:', e.message));
      }
    } catch (bgError) {
      console.error('Errore nell\'invio della richiesta di background:', bgError);
      // Non interrompiamo il flusso in caso di errore nella chiamata di background
    }
    
    // Rispondi immediatamente con i template generati
    return res.status(200).json({ 
      success: true, 
      templates: templates,
      isSimplified: true
    });
  } catch (error) {
    console.error('Errore durante la generazione dei template di recensione:', error);
    
    // Fornisci template di fallback in caso di errore
    const fallbackTemplates = [
      "Ti è piaciuta la tua esperienza? Ci farebbe piacere ricevere una tua recensione!",
      "Grazie per averci scelto! Ti dispiacerebbe dedicare un momento per una recensione?",
      "Il tuo feedback è importante per noi. Come è stata la tua esperienza oggi?"
    ];
    
    // Rispondi con template di fallback ma comunica che c'è stato un errore
    return res.status(200).json({ 
      success: true, 
      templates: fallbackTemplates,
      isSimplified: true,
      hadError: true
    });
  }
} 