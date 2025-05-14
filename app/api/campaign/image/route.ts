import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

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
    const { prompt, messageText, campaignType, restaurantName, modelType = 'gpt-image-1' } = data
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt richiesto' },
        { status: 400 }
      )
    }

    console.log('Generazione immagine con prompt:', prompt)

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
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
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella generazione dell\'immagine' },
        { status: response.status }
      )
    }

    const imageData = await response.json()
    return NextResponse.json(imageData)
    
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