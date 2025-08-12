import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ [VERCEL] Inizio upload copertina brand');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Solo immagini sono accettate per le copertine brand'
      }, { status: 400 });
    }

    console.log('🖼️ [VERCEL] Dati copertina brand:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      restaurantId
    });

    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('restaurantId', restaurantId || '');

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/upload/brand-cover`, {
      method: 'POST',
      body: backendFormData,
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore backend' }));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [VERCEL] Upload copertina brand completato');
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('💥 [VERCEL] ERRORE upload copertina brand:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload della copertina brand',
      details: error.message
    }, { status: 500 });
  }
} 