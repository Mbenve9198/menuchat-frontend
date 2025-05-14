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

    // Verifica che i dettagli del ristorante siano completi
    if (!body.restaurantDetails || !body.restaurantDetails.name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Restaurant details are required' 
        },
        { status: 400 }
      );
    }

    // Assicura che i campi necessari siano presenti nei dettagli del ristorante
    if (!body.restaurantDetails.reviews) {
      console.warn("Missing reviews in restaurant details, adding placeholder data");
      body.restaurantDetails.reviews = [];
    }

    if (!body.restaurantDetails.rating) {
      console.warn("Missing rating in restaurant details, adding default value");
      body.restaurantDetails.rating = 4.5; // Valore di default 
    }

    if (!body.restaurantDetails.ratingsTotal) {
      console.warn("Missing ratingsTotal in restaurant details, adding default value");
      body.restaurantDetails.ratingsTotal = 0;
    }

    if (!body.restaurantDetails.cuisineTypes) {
      console.warn("Missing cuisineTypes in restaurant details, adding placeholder");
      body.restaurantDetails.cuisineTypes = ["restaurant"];
    }
    
    // Imposta una lingua predefinita se non specificata
    if (!body.language) {
      body.language = "en";
    }
    
    // Log per debug
    console.log("Welcome request body:", {
      restaurantId: body.restaurantId,
      language: body.language,
      forceLanguage: body.forceLanguage,
      menuType: body.menuType,
      restaurantDetailsComplete: !!body.restaurantDetails,
      hasReviews: Array.isArray(body.restaurantDetails?.reviews) && body.restaurantDetails?.reviews.length > 0
    });
    
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
    
    // Log per debug
    console.log("Welcome response:", {
      success: data.success,
      message: data.message ? data.message.substring(0, 30) + '...' : undefined
    });

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