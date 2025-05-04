import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verifica che menuType sia presente
    if (!body.menuType || !['pdf', 'url'].includes(body.menuType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Menu type must be either "pdf" or "url"' 
        },
        { status: 400 }
      );
    }
    
    // Inoltra la richiesta al backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/setup/generate-welcome-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Errore nella generazione del messaggio');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in welcome API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      },
      { status: 500 }
    );
  }
} 