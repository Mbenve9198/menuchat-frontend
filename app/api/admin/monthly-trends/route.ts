import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const months = searchParams.get('months');
    
    // Ottieni il token dall'header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token di autorizzazione mancante' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Costruisci l'URL per il backend
    const backendUrl = new URL('/api/admin/monthly-trends', process.env.BACKEND_URL || 'http://localhost:5000');
    if (months) backendUrl.searchParams.set('months', months);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Errore nella route monthly-trends:', error);
    return NextResponse.json(
      { success: false, message: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 