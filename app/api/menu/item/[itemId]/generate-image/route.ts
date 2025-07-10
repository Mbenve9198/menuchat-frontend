import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * API per generare immagini dei piatti con Imagen 4 Ultra
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    // Verifica autenticazione
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const itemId = params.itemId;
    const body = await request.json();
    const { prompt, useAutoPrompt, customPrompt } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'ID piatto richiesto' },
        { status: 400 }
      );
    }

    if (!useAutoPrompt && !customPrompt && !prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt richiesto per la generazione' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Chiamata al backend per generare l'immagine
    const response = await fetch(`${backendUrl}/api/menu/item/${itemId}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        dishId: itemId,
        prompt,
        useAutoPrompt,
        customPrompt
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella generazione dell\'immagine' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Errore nella generazione immagine:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 