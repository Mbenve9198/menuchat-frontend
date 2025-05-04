import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  let requestBody: any = {};
  
  try {
    requestBody = await request.json();
    const { restaurantId, restaurantName, restaurantDetails, modelId } = requestBody;
    
    // Verifica che i dati necessari siano presenti
    if (!restaurantDetails) {
      return NextResponse.json({
        success: false,
        error: 'I dettagli del ristorante sono obbligatori'
      }, { status: 400 });
    }
    
    console.log('Generazione messaggio di benvenuto per:', restaurantName);
    
    // Verifica che sia configurata la variabile d'ambiente BACKEND_URL
    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL non configurato. Impossibile contattare il servizio di generazione.');
    }
    
    // Invia la richiesta al backend e attende la risposta
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/setup/generate-welcome-message`, 
      requestBody
    );
    
    // Controlla se la risposta è valida
    if (response.data && response.data.success) {
      console.log('Messaggio generato con successo tramite Claude 3.7');
      
      return NextResponse.json({ 
        success: true, 
        message: response.data.message,
        isGenerated: true
      });
    } else {
      // Gestisci il caso in cui il backend risponde ma non ha avuto successo
      throw new Error(response.data?.error || 'Errore nella generazione del messaggio');
    }
  } catch (error: any) {
    console.error('Errore nella generazione del messaggio di benvenuto:', error);
    
    // Messaggio di fallback in caso di errore di connessione o altri problemi
    const fallbackMessage = `Ciao {customerName}! Benvenuto da ${requestBody?.restaurantDetails?.name || 'noi'} 🍽️\n\nConsulta il nostro menu qui:\n(menu_link)\n\nBuon appetito!`;
    
    return NextResponse.json({ 
      success: true,  // Restituiamo success:true per non bloccare l'interfaccia
      message: fallbackMessage,
      isGenerated: false,
      error: error.message,
      errorDetails: 'Si è verificato un errore durante la comunicazione con il servizio di AI. È stato fornito un messaggio di fallback.'
    });
  }
} 