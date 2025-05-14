import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Costante per il modello Claude da utilizzare
const CLAUDE_MODEL = "claude-3-7-sonnet-20250219"

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
    const { campaignType, messageText, restaurantName, language } = data
    
    if (!campaignType || !messageText) {
      return NextResponse.json(
        { success: false, error: 'Tipo di campagna e testo del messaggio richiesti' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Chiamata al backend per generare prompt con Claude
    const response = await fetch(`${backendUrl}/api/campaign/generate-image-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        campaignType,
        messageText,
        restaurantName: restaurantName || 'Restaurant',
        language: language || 'en',
        modelId: CLAUDE_MODEL,
        restaurantId: session.user.restaurantId
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella generazione del prompt' },
        { status: response.status }
      )
    }

    const promptData = await response.json()
    return NextResponse.json(promptData)
    
  } catch (error: any) {
    console.error('Errore nella generazione del prompt per immagine:', error)
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