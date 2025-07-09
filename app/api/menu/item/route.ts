import { NextRequest, NextResponse } from 'next/server';

/**
 * API per gestire i piatti del menu
 */

// Crea un nuovo piatto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/menu/item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('Errore nella creazione piatto:', error);
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

// Aggiornamento prezzi in blocco
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation } = body;
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    let endpoint = '';
    if (operation === 'bulk-price-update') {
      endpoint = '/api/menu/items/bulk-price-update';
    } else if (operation === 'reorder-categories') {
      endpoint = '/api/menu/categories/reorder';
    } else {
      return NextResponse.json(
        { success: false, error: 'Operazione non valida' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('Errore nell\'operazione bulk:', error);
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