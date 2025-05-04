import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantName, restaurantDetails, reviewLink, modelId } = body;
    
    // Verifica che i dati necessari siano presenti
    if (!restaurantDetails) {
      return NextResponse.json({
        success: false,
        error: 'I dettagli del ristorante sono obbligatori'
      }, { status: 400 });
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
    
    // Tenta di inoltrare la richiesta al backend se esiste
    try {
      if (process.env.BACKEND_URL) {
        // Invia la richiesta in background senza aspettare la risposta
        axios.post(`${process.env.BACKEND_URL}/api/setup/generate-review-templates`, body)
          .catch(e => console.error('Errore nella richiesta al backend:', e.message));
      }
    } catch (bgError) {
      console.error('Errore nell\'invio della richiesta al backend:', bgError);
      // Non interrompiamo il flusso in caso di errore nella chiamata di background
    }
    
    // Rispondi immediatamente con i template generati
    return NextResponse.json({ 
      success: true, 
      templates: templates,
      isSimplified: true
    });
  } catch (error) {
    console.error('Error in review API route:', error);
    
    // Fornisci template di fallback in caso di errore
    const fallbackTemplates = [
      "Ti è piaciuta la tua esperienza? Ci farebbe piacere ricevere una tua recensione!",
      "Grazie per averci scelto! Ti dispiacerebbe dedicare un momento per una recensione?",
      "Il tuo feedback è importante per noi. Come è stata la tua esperienza oggi?"
    ];
    
    // Rispondi con template di fallback ma comunica che c'è stato un errore
    return NextResponse.json({ 
      success: true, 
      templates: fallbackTemplates,
      isSimplified: true,
      hadError: true
    }, { status: 200 }); // Restituiamo 200 anche in caso di errore per non bloccare l'interfaccia
  }
} 