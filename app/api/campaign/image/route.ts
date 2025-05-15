import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Timeout di 8 secondi per la richiesta fetch
const FETCH_TIMEOUT = 8000;

export async function POST(request: NextRequest) {
  try {
    // Verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Estrai i dati dalla richiesta
    const data = await request.json()
    const { prompt, messageText, campaignType, restaurantName, modelType = 'dall-e-3' } = data
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt richiesto' },
        { status: 400 }
      )
    }

    console.log('Generazione immagine con prompt:', prompt)

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Implementa il timeout per la richiesta
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    try {
      // Chiamata al backend per generare l'immagine
      const response = await fetch(`${backendUrl}/api/campaign/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          prompt,
          messageText,
          campaignType,
          restaurantName: restaurantName || 'Restaurant',
          modelType,
          restaurantId: session.user.restaurantId
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
        throw new Error(errorData.error || 'Errore nella generazione dell\'immagine');
      }

      const imageData = await response.json()
      return NextResponse.json(imageData)
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Se è un errore di abort (timeout), restituisci una risposta di fallback
      if (fetchError.name === 'AbortError') {
        console.log('La richiesta di generazione immagine è andata in timeout');
        
        // Usa un'immagine di fallback generica
        const fallbackImageUrl = "/placeholder.jpg";
        
        return NextResponse.json({
          success: true,
          data: {
            imageUrl: fallbackImageUrl,
            fallback: true
          }
        });
      }
      
      // Altrimenti propaga l'errore
      throw fetchError;
    }
    
  } catch (error: any) {
    console.error('Errore nella generazione dell\'immagine:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
} 