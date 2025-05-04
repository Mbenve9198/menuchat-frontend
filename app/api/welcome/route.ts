import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verifica che BACKEND_URL sia configurato
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error('BACKEND_URL environment variable is not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error' 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Inoltra la richiesta al backend - corretto il path per matchare la route del backend
    const response = await fetch(`${backendUrl}/generate-welcome-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Se la risposta non è JSON, gestisci l'errore
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Backend returned non-JSON response:', await response.text());
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid server response' 
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Errore nella generazione del messaggio');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in welcome API route:', error);
    
    // Se l'errore è di tipo SyntaxError, significa che la risposta non era JSON valido
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid server response format'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      },
      { status: 500 }
    );
  }
} 