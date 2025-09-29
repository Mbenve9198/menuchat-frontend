import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * API per generare immagini AI in bulk per tutti i piatti di una categoria
 */

// Genera immagini AI per tutti i piatti selezionati di una categoria
export async function POST(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    // Verifica autenticazione
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { categoryId } = params;
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    console.log(`🎨 [CATEGORY AI] Generando immagini per categoria ${categoryId}`);
    console.log(`📝 Piatti selezionati: ${body.dishIds?.length || 0}`);
    
    const response = await fetch(`${backendUrl}/api/menu/category/${categoryId}/generate-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Errore del server nella generazione immagini categoria' 
      }));
      
      console.error(`❌ [CATEGORY AI] Errore backend (${response.status}):`, errorData);
      
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore del server' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ [CATEGORY AI] Task avviato con successo: ${data.taskId}`);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ [CATEGORY AI] Errore nella generazione immagini categoria:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server nella generazione immagini categoria',
        details: error.message,
        type: 'generation_error'
      },
      { status: 500 }
    );
  }
} 