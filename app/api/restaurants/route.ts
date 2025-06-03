import { NextRequest, NextResponse } from 'next/server';

/**
 * API per gestire la creazione e il recupero dei ristoranti
 * L'API inoltra la richiesta al backend
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log("Received restaurant setup data:", formData);

    // Prepara i dati: assicurarsi che menuPdfUrl sia dentro menuLanguages
    if (formData.menuPdfUrl && formData.menuLanguages && formData.menuLanguages.length > 0) {
      // Aggiungi il menuPdfUrl all'interno di ogni oggetto lingua in menuLanguages
      formData.menuLanguages = formData.menuLanguages.map((lang: any) => ({
        ...lang,
        menuPdfUrl: formData.menuPdfUrl,
        menuPdfName: formData.menuPdfName || ''
      }));
      
      // Mantieni i campi anche a livello principale per compatibilità
    }

    // Invia i dati al backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    console.log("Using backend URL:", backendUrl);

    try {
      // Crea un controller per gestire il timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minuti di timeout

      const response = await fetch(`${backendUrl}/api/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log("Backend API response status:", response.status);

      // Controlla la risposta del backend
      if (!response.ok) {
        let errorMessage = 'Errore del server';
        let errorDetails = '';
        
        try {
          // Prova prima a leggere come JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error("Backend API error details:", errorData);
            errorMessage = errorData.error || errorMessage;
            errorDetails = errorData.details || '';
          } else {
            // Se non è JSON, leggi come testo
            const errorText = await response.text();
            console.error("Backend API error text:", errorText);
            errorMessage = response.status === 504 ? 'Il server ha impiegato troppo tempo per rispondere. Riprova tra qualche minuto.' : 'Errore del server';
            errorDetails = errorText.substring(0, 200); // Limita la lunghezza
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorMessage = response.status === 504 ? 'Timeout del server. Riprova tra qualche minuto.' : 'Errore del server';
        }

        return NextResponse.json(
          { 
            success: false, 
            error: errorMessage,
            details: errorDetails
          },
          { status: response.status }
        );
      }

      // Restituisci la risposta del backend
      try {
        const data = await response.json();
        console.log("Backend API success response:", data);
        return NextResponse.json(data);
      } catch (jsonError) {
        console.error("Failed to parse success response as JSON:", jsonError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Risposta del server non valida',
            details: 'Il server ha restituito una risposta non in formato JSON'
          },
          { status: 502 }
        );
      }
    } catch (fetchError: any) {
      console.error("Fetch error during backend API call:", fetchError);
      
      let errorMessage = 'Errore di connessione al server backend';
      if (fetchError.name === 'AbortError') {
        errorMessage = 'Il server ha impiegato troppo tempo per rispondere. Riprova tra qualche minuto.';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
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