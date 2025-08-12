import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;
    const menuId = formData.get('menuId') as string;
    const languageCode = formData.get('languageCode') as string || 'it';
    const restaurantName = formData.get('restaurantName') as string || 'restaurant';

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'Solo file PDF sono accettati'
      }, { status: 400 });
    }

    console.log('📄 Frontend: Inoltro upload PDF al backend:', {
      fileName: file.name,
      size: file.size,
      restaurantId,
      menuId,
      languageCode
    });

    // Prepara FormData per il backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('restaurantId', restaurantId || '');
    backendFormData.append('menuId', menuId || '');
    backendFormData.append('languageCode', languageCode);
    backendFormData.append('restaurantName', restaurantName);

    // Chiama il backend che gestisce ImageKit
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/upload/menu-pdf`, {
      method: 'POST',
      body: backendFormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore backend' }));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Frontend: Upload PDF completato tramite backend');
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Frontend: Errore durante l\'upload PDF:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload del PDF menu',
      details: error.message
    }, { status: 500 });
  }
} 