import { NextRequest, NextResponse } from 'next/server';

/**
 * API per gestire la creazione di un nuovo ristorante
 * L'API inoltra la richiesta al backend
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log("Received restaurant setup data:", formData);

    // Invia i dati al backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // Controlla la risposta del backend
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend API error:", errorData);
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore del server' },
        { status: response.status }
      );
    }

    // Restituisci la risposta del backend
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error in restaurant creation:", error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 