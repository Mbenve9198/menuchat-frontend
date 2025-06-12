import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // URL dell'API backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Chiamata pubblica senza autenticazione per ottenere solo info base
    const response = await fetch(`${backendUrl}/api/restaurants/${id}/public`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Ristorante non trovato' }));
      return NextResponse.json(
        { success: false, error: errorData.error || 'Ristorante non trovato' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Server error in public restaurant retrieval:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
} 