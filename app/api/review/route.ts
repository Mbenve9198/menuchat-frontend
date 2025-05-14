import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
      body.restaurantDetails.ratingsTotal = body.restaurantDetails.reviews?.length || 0;
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
    console.log("Review request body:", {
      restaurantId: body.restaurantId,
      language: body.language,
      forceLanguage: body.forceLanguage,
      restaurantName: body.restaurantName,
      restaurantDetailsComplete: !!body.restaurantDetails,
      hasReviews: Array.isArray(body.restaurantDetails?.reviews) && body.restaurantDetails?.reviews.length > 0
    });
    
    // Inoltra la richiesta al backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/setup/generate-review-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Errore nella generazione dei template');
    }
    
    console.log("Review response:", {
      success: data.success,
      templatesCount: data.templates?.length || 0,
      firstTemplate: data.templates?.[0]?.substring(0, 30) + '...' || 'Nessun template'
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in review API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      },
      { status: 500 }
    );
  }
} 