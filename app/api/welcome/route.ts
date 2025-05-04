import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, restaurantName, restaurantDetails, modelId } = body;
    
    // Verifica che i dati necessari siano presenti
    if (!restaurantDetails) {
      return NextResponse.json({
        success: false,
        error: 'I dettagli del ristorante sono obbligatori'
      }, { status: 400 });
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
    
    // Tenta di inoltrare la richiesta al backend se esiste
    try {
      if (process.env.BACKEND_URL) {
        // Invia la richiesta in background senza aspettare la risposta
        axios.post(`${process.env.BACKEND_URL}/api/setup/generate-welcome-message`, body)
          .catch(e => console.error('Errore nella richiesta al backend:', e.message));
      }
    } catch (bgError) {
      console.error('Errore nell\'invio della richiesta al backend:', bgError);
      // Non interrompiamo il flusso in caso di errore nella chiamata di background
    }
    
    // Rispondi immediatamente con il messaggio generato
    return NextResponse.json({ 
      success: true, 
      message: welcomeMessage,
      isSimplified: true
    });
  } catch (error) {
    console.error('Error in welcome API route:', error);
    
    // Fornisci un messaggio di fallback in caso di errore
    const fallbackMessage = `Ciao {customerName}! Benvenuto nel nostro ristorante 🍽️\n\nGuarda il nostro menu qui:\n(menu_link)`;
    
    return NextResponse.json({ 
      success: true, 
      message: fallbackMessage,
      isSimplified: true,
      hadError: true
    }, { status: 200 }); // Restituiamo 200 anche in caso di errore per non bloccare l'interfaccia
  }
} 