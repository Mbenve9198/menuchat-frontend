import { NextRequest, NextResponse } from 'next/server';

// Configurazione che verrà letta dalle variabili d'ambiente durante il runtime
export async function GET(request: NextRequest) {
  // Ottieni configurazione dal backend
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    // Tenta di ottenere la configurazione dal backend
    const response = await fetch(`${backendUrl}/api/config/cloudinary`, {
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        cloudName: data.cloudName,
        uploadPreset: data.uploadPreset || 'menuchat_preset'
      });
    }
    
    // Se non riusciamo a ottenere dal backend, usa i valori di fallback
    console.warn('Non possiamo ottenere la configurazione Cloudinary dal backend, utilizziamo i valori di default');
    
    return NextResponse.json({
      success: true,
      cloudName: 'menuchat',
      uploadPreset: 'menuchat_preset'
    });
  } catch (error: any) {
    console.error('Errore nel recupero della configurazione Cloudinary:', error);
    
    // In caso di errore, usa valori di fallback
    return NextResponse.json({
      success: true,
      cloudName: 'menuchat',
      uploadPreset: 'menuchat_preset'
    });
  }
} 