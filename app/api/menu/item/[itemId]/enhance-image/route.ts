import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * API per migliorare immagini esistenti di piatti usando Nano Banana AI
 */

// Migliora un'immagine esistente di un piatto usando AI
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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    console.log(`✨ Migliorando immagine AI per piatto ${itemId}`);
    
    const response = await fetch(`${backendUrl}/api/menu/item/${itemId}/enhance-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }));
      
      // Gestione errori specifici per il miglioramento di immagini
      if (response.status === 400 && errorData.type === 'safety_error') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'L\'immagine contiene contenuti non appropriati per il miglioramento.',
            type: 'safety_error'
          },
          { status: 400 }
        );
      }
      
      if (response.status === 429 && errorData.type === 'quota_error') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Limite di miglioramento immagini raggiunto per oggi. Riprova domani.',
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
    console.log(`✅ Immagine migliorata con successo per piatto ${itemId}`);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Errore nel miglioramento immagine AI:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server nel miglioramento immagine',
        details: error.message,
        type: 'enhancement_error'
      },
      { status: 500 }
    );
  }
}










