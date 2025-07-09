import { NextRequest, NextResponse } from 'next/server';

/**
 * API per gestire i dati del menu digitale
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    
    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'ID ristorante mancante' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/menu/${restaurantId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
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
    console.error('Errore nel recupero dati menu:', error);
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