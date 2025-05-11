import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log per debug
    console.log("Review request body:", {
      restaurantId: body.restaurantId,
      language: body.language,
      forceLanguage: body.forceLanguage
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
      templatesCount: data.templates?.length || 0
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