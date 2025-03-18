import { NextResponse } from 'next/server';

// URL del backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    // Ottieni i dati del form
    const formData = await request.json();
    
    // Invia i dati al backend - utilizzo il percorso corretto con /api
    const response = await fetch(`${BACKEND_URL}/api/setup/generate-welcome-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Non sembra necessario un token di autenticazione per questa route basandosi sulla definizione in setupRoutes.js
      },
      body: JSON.stringify(formData)
    });
    
    // Verifica lo stato HTTP
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      // Se la risposta non è JSON, gestisci diversamente
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Backend returned non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          preview: errorText.substring(0, 200) // Log solo i primi 200 caratteri
        });
        
        return NextResponse.json({
          success: false,
          error: `Backend error (HTTP ${response.status})`,
          details: `Server returned ${response.status}: ${response.statusText}`
        }, { status: 500 });
      }
      
      // Se è JSON, procedi come prima
      const data = await response.json();
      return NextResponse.json({
        success: false,
        error: data.error,
        details: data.details
      }, { status: response.status });
    }
    
    // Processa la risposta di successo
    try {
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    } catch (jsonError: any) {
      console.error('Error parsing successful response as JSON:', jsonError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in backend response',
        details: jsonError.message
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Error in API:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      details: error.message
    }, { status: 500 });
  }
} 