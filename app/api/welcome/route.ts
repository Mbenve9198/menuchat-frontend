import { NextResponse } from 'next/server';

// URL del backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Configurazione speciale per Vercel - Disabilita il caching dei bordi
export const config = {
  runtime: 'edge',
};

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Welcome endpoint works (GET)",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    // Ottieni i dati del form
    const formData = await request.json();
    
    console.log('Chiamata API con URL:', `${BACKEND_URL}/setup/generate-welcome-message`);
    console.log('Dati inviati:', JSON.stringify(formData));
    
    // Invia i dati al backend per generare il messaggio con Claude
    const response = await fetch(`${BACKEND_URL}/setup/generate-welcome-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: "Errore dal backend",
        details: JSON.stringify({
          status: response.status,
          statusText: response.statusText
        })
      }, { status: 500 });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in API:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 