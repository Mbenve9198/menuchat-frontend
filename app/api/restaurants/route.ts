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
    console.log("Using backend URL:", backendUrl);

    try {
      const response = await fetch(`${backendUrl}/api/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        cache: 'no-store'
      });

      console.log("Backend API response status:", response.status);

      // Controlla la risposta del backend
      if (!response.ok) {
        let errorMessage = 'Errore del server';
        try {
          const errorData = await response.json();
          console.error("Backend API error details:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          // Se non riusciamo a leggere il JSON, usiamo il testo
          errorMessage = await response.text().catch(() => errorMessage);
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: response.status }
        );
      }

      // Restituisci la risposta del backend
      const data = await response.json();
      console.log("Backend API success response:", data);
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error("Fetch error during backend API call:", fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Errore di connessione al server backend',
          details: fetchError.message || String(fetchError)
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Server error in restaurant creation:", error);
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