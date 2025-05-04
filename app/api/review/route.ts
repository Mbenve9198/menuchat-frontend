import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  let requestBody: any = {};
  
  try {
    requestBody = await request.json();
    const { restaurantName, restaurantDetails, reviewLink, modelId } = requestBody;
    
    // Verifica che i dati necessari siano presenti
    if (!restaurantDetails) {
      return NextResponse.json({
        success: false,
        error: 'I dettagli del ristorante sono obbligatori'
      }, { status: 400 });
    }
    
    console.log('Generazione template di recensione per:', restaurantName);
    
    // Verifica che sia configurata la variabile d'ambiente BACKEND_URL
    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL non configurato. Impossibile contattare il servizio di generazione.');
    }
    
    // Invia la richiesta al backend e attende la risposta
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/setup/generate-review-templates`, 
      requestBody
    );
    
    // Controlla se la risposta è valida
    if (response.data && response.data.success) {
      console.log('Template generati con successo tramite Claude 3.7');
      
      return NextResponse.json({ 
        success: true, 
        templates: response.data.templates,
        isGenerated: true
      });
    } else {
      // Gestisci il caso in cui il backend risponde ma non ha avuto successo
      throw new Error(response.data?.error || 'Errore nella generazione dei template');
    }
  } catch (error: any) {
    console.error('Errore nella generazione dei template di recensione:', error);
    
    // Template di fallback in caso di errore
    const fallbackTemplates = [
      `Grazie per aver ordinato da ${requestBody?.restaurantDetails?.name || 'noi'}! Ti è piaciuto il tuo cibo? Ci piacerebbe ricevere il tuo feedback.`,
      `Il tuo parere è importante per noi! Ti andrebbe di condividere la tua esperienza in una breve recensione?`,
      `Grazie per averci scelto oggi! Ti saremmo grati se potessi dedicare un momento per lasciare una recensione sulla tua esperienza.`
    ];
    
    return NextResponse.json({ 
      success: true,  // Restituiamo success:true per non bloccare l'interfaccia
      templates: fallbackTemplates,
      isGenerated: false,
      error: error.message,
      errorDetails: 'Si è verificato un errore durante la comunicazione con il servizio di AI. Sono stati forniti template di fallback.'
    });
  }
} 