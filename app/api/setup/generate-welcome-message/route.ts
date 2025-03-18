import { NextResponse } from 'next/server';

// URL del backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    // Ottieni i dati del form
    const formData = await request.json();
    
    // Invia i dati al backend
    const response = await fetch(`${BACKEND_URL}/api/setup/generate-welcome-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Ottieni la risposta dal backend
    const data = await response.json();
    
    // Se la risposta non è ok, lancia un errore
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.error,
        details: data.details
      }, { status: response.status });
    }
    
    // Ritorna la risposta
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error in API:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error.message
    }, { status: 500 });
  }
} 