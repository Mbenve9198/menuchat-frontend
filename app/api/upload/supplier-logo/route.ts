import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚛 [VERCEL] Inizio upload logo fornitore');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const supplierId = formData.get('supplierId') as string;
    const supplierName = formData.get('supplierName') as string;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'Nessun file trovato nella richiesta'
      }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Solo immagini sono accettate per i logo fornitori'
      }, { status: 400 });
    }

    console.log('🚛 [VERCEL] Dati logo fornitore:', {
      fileName: file.name,
      size: file.size,
      type: file.type,
      supplierId,
      supplierName
    });

    const backendFormData = new FormData();
    backendFormData.append('file', file);
    backendFormData.append('supplierId', supplierId || '');
    backendFormData.append('supplierName', supplierName || '');

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/upload/supplier-logo`, {
      method: 'POST',
      body: backendFormData,
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore backend' }));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [VERCEL] Upload logo fornitore completato');
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('💥 [VERCEL] ERRORE upload logo fornitore:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante l\'upload del logo fornitore',
      details: error.message
    }, { status: 500 });
  }
} 