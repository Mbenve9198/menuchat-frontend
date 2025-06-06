import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Ottieni il token dall'header Authorization
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Token di autorizzazione mancante' },
        { status: 401 }
      );
    }

    // URL del backend - usa variabile d'ambiente o fallback
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/admin/template-stats`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Errore nel proxy template-stats:', error);
    return NextResponse.json(
      { success: false, message: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 