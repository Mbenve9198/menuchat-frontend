import { NextRequest, NextResponse } from 'next/server';

/**
 * API per gestire la creazione e il recupero dei ristoranti
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

/**
 * API per recuperare i dati di un ristorante, inclusa l'immagine del profilo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const profileImage = searchParams.get('profileImage') === 'true';

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'ID ristorante mancante' },
        { status: 400 }
      );
    }

    // URL dell'API backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Se è richiesta solo l'immagine del profilo
    if (profileImage) {
      const response = await fetch(`${backendUrl}/api/restaurants/${restaurantId}/profile-image`, {
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
    }
    
    // Altrimenti, ottieni i dati completi del ristorante
    const response = await fetch(`${backendUrl}/api/restaurants/${restaurantId}`, {
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
    console.error("Server error in restaurant retrieval:", error);
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