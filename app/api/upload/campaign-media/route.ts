import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [VERCEL] Inizio upload campaign-media');
    
    const formData = await request.formData();
    console.log('📝 [VERCEL] FormData estratto');
    
    const file = formData.get('file') as File;
    const campaignType = formData.get('campaignType') as string || 'campaign';
    const optimizeForWhatsApp = formData.get('optimizeForWhatsApp') === 'true';

    if (!file) {
      console.log('❌ [VERCEL] Nessun file nella richiesta');
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    console.log('📤 [VERCEL] Dati file:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      campaignType,
      optimizeForWhatsApp
    });

    // Prepara FormData per il backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('campaignType', campaignType);
    backendFormData.append('optimizeForWhatsApp', optimizeForWhatsApp.toString());
    console.log('📦 [VERCEL] FormData backend preparato');

    // Chiama il backend che gestisce ImageKit
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log('🌐 [VERCEL] Backend URL:', backendUrl);
    
    console.log('📡 [VERCEL] Inizio chiamata al backend...');
    const response = await fetch(`${backendUrl}/api/upload/campaign-media`, {
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
    console.log('✅ [VERCEL] Upload completato:', result.success);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('💥 [VERCEL] ERRORE CRITICO:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload del media',
      details: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 