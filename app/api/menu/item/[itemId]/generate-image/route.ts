import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * API per generare immagini AI per singoli piatti usando Google Imagen 4 Ultra
 */

// Genera un'immagine professionale per un piatto usando AI
export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
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

    const { itemId } = params;
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    console.log(`🎨 Generando immagine AI per piatto ${itemId}`);
    console.log(`📝 Parametri: useAutoPrompt=${body.useAutoPrompt}, customPrompt="${body.customPrompt || 'none'}"`);
    
    const response = await fetch(`${backendUrl}/api/menu/item/${itemId}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }));
      
      // Gestione errori specifici per la generazione di immagini
      if (response.status === 400 && errorData.type === 'safety_error') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Il contenuto del piatto non è appropriato per la generazione di immagini. Modifica nome o descrizione.',
            type: 'safety_error'
          },
          { status: 400 }
        );
      }
      
      if (response.status === 429 && errorData.type === 'quota_error') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Limite di generazione immagini raggiunto per oggi. Riprova domani.',
            type: 'quota_error'
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore del server' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Immagine generata con successo per piatto ${itemId}`);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Errore nella generazione immagine AI:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server nella generazione immagine',
        details: error.message,
        type: 'generation_error'
      },
      { status: 500 }
    );
  }
} 