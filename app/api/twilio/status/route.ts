import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth();
    
    // URL dell'API backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const url = `${backendUrl}/api/twilio/status`;
    
    // Aggiungi l'authorization header se abbiamo una sessione con token
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers
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
    console.error("Server error in Twilio status retrieval:", error);
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