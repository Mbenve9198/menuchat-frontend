import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * API per generare contenuto AI per singoli piatti
 */

// Genera descrizione e/o ingredienti per un piatto usando AI
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
    
    // Validate required parameters
    if (!body.type || !['description', 'ingredients', 'both'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Parametro "type" richiesto (description, ingredients, o both)' },
        { status: 400 }
      );
    }

    console.log(`Generando ${body.type} per piatto ${itemId}`);
    
    const response = await fetch(`${backendUrl}/api/menu/item/${itemId}/generate-content`, {
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
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore del server' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Errore nella generazione contenuto AI:', error);
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