import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const campaignType = formData.get('campaignType') as string || 'campaign';
    const optimizeForWhatsApp = formData.get('optimizeForWhatsApp') === 'true';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    console.log('📤 Frontend: Inoltro upload al backend:', {
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

    // Chiama il backend che gestisce ImageKit
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/upload/campaign-media`, {
      method: 'POST',
      body: backendFormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore backend' }));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Frontend: Upload completato tramite backend');
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Frontend: Errore durante l\'upload:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload del media',
      details: error.message
    }, { status: 500 });
  }
} 