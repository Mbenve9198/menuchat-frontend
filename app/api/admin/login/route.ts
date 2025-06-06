import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // URL del backend - usa variabile d'ambiente o fallback
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Errore nel proxy login admin:', error);
    return NextResponse.json(
      { success: false, message: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 