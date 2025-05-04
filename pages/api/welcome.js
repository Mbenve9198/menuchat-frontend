// Importiamo la libreria Axios per effettuare richieste HTTP
import axios from 'axios';

export default async function handler(req, res) {
  // Accetta solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metodo non consentito' });
  }

  try {
    // Estrai i dati dalla richiesta
    const { restaurantId, restaurantName, restaurantDetails, modelId } = req.body;
    
    // Verifica che i dati necessari siano presenti
    if (!restaurantDetails) {
      return res.status(400).json({
        success: false,
        error: 'I dettagli del ristorante sono obbligatori'
      });
    }
    
    console.log('Generazione messaggio di benvenuto per:', restaurantName);
    console.log('Dettagli del ristorante:', JSON.stringify(restaurantDetails).slice(0, 200) + '...');
    
    // Implementazione di una versione semplificata che non dipende da Claude
    // Questa versione genererà un messaggio di benvenuto generico basato sui dati del ristorante
    
    // Cerca di estrarre informazioni utili dai dettagli del ristorante
    const name = restaurantDetails.name || restaurantName || 'ristorante';
    const cuisine = restaurantDetails.cuisineTypes?.[0] || '';
    const rating = restaurantDetails.rating || 0;
    
    // Scegli gli emoji appropriati in base al tipo di cucina
    let foodEmoji = '🍽️';
    if (cuisine) {
      if (cuisine.toLowerCase().includes('italian') || cuisine.toLowerCase().includes('italiana')) foodEmoji = '🍝';
      else if (cuisine.toLowerCase().includes('pizza')) foodEmoji = '🍕';
      else if (cuisine.toLowerCase().includes('sushi') || cuisine.toLowerCase().includes('japan')) foodEmoji = '🍣';
      else if (cuisine.toLowerCase().includes('burger') || cuisine.toLowerCase().includes('american')) foodEmoji = '🍔';
      else if (cuisine.toLowerCase().includes('mexican') || cuisine.toLowerCase().includes('messic')) foodEmoji = '🌮';
      else if (cuisine.toLowerCase().includes('indian') || cuisine.toLowerCase().includes('india')) foodEmoji = '🍛';
      else if (cuisine.toLowerCase().includes('chinese') || cuisine.toLowerCase().includes('cines')) foodEmoji = '🥡';
      else if (cuisine.toLowerCase().includes('bbq') || cuisine.toLowerCase().includes('grill')) foodEmoji = '🍖';
      else if (cuisine.toLowerCase().includes('vegan') || cuisine.toLowerCase().includes('vegetarian')) foodEmoji = '🥗';
      else if (cuisine.toLowerCase().includes('dessert') || cuisine.toLowerCase().includes('bakery')) foodEmoji = '🧁';
    }
    
    // Genera il messaggio di benvenuto
    let welcomeMessage = `Ciao {customerName}! Benvenuto da ${name} ${foodEmoji}\n\nSiamo felici di servirti oggi! Dai un'occhiata al nostro menu:\n(menu_link)`;
    
    // Aggiungi informazioni sul rating se disponibili
    if (rating > 4.5) {
      welcomeMessage = `Ciao {customerName}! Benvenuto da ${name} ${foodEmoji}\n\nIl nostro ristorante ha una valutazione di ${rating}⭐! Dai un'occhiata al nostro menu:\n(menu_link)`;
    }
    
    // Se è un ristorante italiano, aggiungi un tocco italiano
    if (cuisine.toLowerCase().includes('italian') || cuisine.toLowerCase().includes('italiana')) {
      welcomeMessage += '\nBuon appetito! 🇮🇹';
    }
    
    // Log del messaggio generato
    console.log('Messaggio generato:', welcomeMessage);
    
    // Tenta di chiamare Claude in background senza aspettare la risposta
    // La chiamata viene effettuata ma la risposta non viene aspettata per evitare timeout
    try {
      // Se l'API di backend è configurata e disponibile
      if (process.env.BACKEND_URL) {
        // Invia la richiesta in background
        axios.post(`${process.env.BACKEND_URL}/api/generate-welcome-message`, {
          restaurantId, 
          restaurantName, 
          restaurantDetails,
          modelId
        }).catch(e => console.error('Errore nella richiesta di background a Claude:', e.message));
      }
    } catch (bgError) {
      console.error('Errore nell\'invio della richiesta di background:', bgError);
      // Non interrompiamo il flusso in caso di errore nella chiamata di background
    }
    
    // Rispondi immediatamente con il messaggio generato
    return res.status(200).json({ 
      success: true, 
      message: welcomeMessage,
      isSimplified: true
    });
  } catch (error) {
    console.error('Errore durante la generazione del messaggio di benvenuto:', error);
    
    // Fornisci un messaggio di fallback in caso di errore
    const fallbackMessage = `Ciao {customerName}! Benvenuto nel nostro ristorante 🍽️\n\nGuarda il nostro menu qui:\n(menu_link)`;
    
    // Rispondi con un messaggio di fallback ma comunica che c'è stato un errore
    return res.status(200).json({ 
      success: true, 
      message: fallbackMessage,
      isSimplified: true,
      hadError: true
    });
  }
} 