import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth();
    
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || '7days';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'ID ristorante mancante' },
        { status: 400 }
      );
    }

    // URL dell'API backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Costruisci l'URL con i parametri di query
    let url = `${backendUrl}/api/stats?restaurantId=${restaurantId}&period=${period}`;
    
    // Aggiungi date personalizzate se presenti
    if (period === 'custom' && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    
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
    console.error("Server error in stats retrieval:", error);
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