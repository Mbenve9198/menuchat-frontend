import { NextRequest, NextResponse } from 'next/server';

/**
 * API per duplicare un piatto del menu
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/menu/item/${itemId}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Errore nella duplicazione piatto:', error);
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