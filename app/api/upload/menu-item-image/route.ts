import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🍽️ [VERCEL] Inizio upload immagine piatto menu');
    
    const formData = await request.formData();
    console.log('📝 [VERCEL] FormData estratto');
    
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;
    const itemId = formData.get('itemId') as string;
    const itemName = formData.get('itemName') as string;

    if (!file) {
      console.log('❌ [VERCEL] Nessun file nella richiesta');
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
      console.log('❌ [VERCEL] File non è un\'immagine');
      return NextResponse.json({
        success: false,
        error: 'Solo immagini sono accettate per i piatti del menu'
      }, { status: 400 });
    }

    console.log('🍽️ [VERCEL] Dati immagine piatto:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      restaurantId,
      itemId,
      itemName
    });

    // Prepara FormData per il backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('restaurantId', restaurantId || '');
    backendFormData.append('itemId', itemId || '');
    backendFormData.append('itemName', itemName || '');
    console.log('📦 [VERCEL] FormData backend preparato');

    // Chiama il backend che gestisce ImageKit
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log('🌐 [VERCEL] Backend URL:', backendUrl);
    
    console.log('📡 [VERCEL] Inizio chiamata al backend per immagine piatto...');
    const response = await fetch(`${backendUrl}/api/upload/menu-item-image`, {
      method: 'POST',
      body: backendFormData,
      // Aggiungi timeout esplicito
      signal: AbortSignal.timeout(30000) // 30 secondi
    });
    
    console.log('📡 [VERCEL] Risposta backend ricevuta:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      console.log('❌ [VERCEL] Errore risposta backend');
      let errorData;
      try {
        errorData = await response.json();
        console.log('📄 [VERCEL] Dettagli errore:', errorData);
      } catch (jsonError) {
        console.log('⚠️ [VERCEL] Impossibile parsare errore JSON:', jsonError);
        errorData = { error: 'Errore backend senza dettagli' };
      }
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    console.log('📄 [VERCEL] Parsing risposta backend...');
    const result = await response.json();
    console.log('✅ [VERCEL] Upload immagine piatto completato:', result.success);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('💥 [VERCEL] ERRORE CRITICO upload immagine piatto:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload dell\'immagine piatto',
      details: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 