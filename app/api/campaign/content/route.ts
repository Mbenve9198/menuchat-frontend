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
    const { campaignType, language, campaignObjective } = data
    
    if (!campaignType || !language || !campaignObjective) {
      return NextResponse.json(
        { success: false, error: 'Dati richiesti mancanti' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Chiamata al backend per generare contenuti con Claude
    const response = await fetch(`${backendUrl}/api/campaign/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        campaignType,
        language,
        campaignObjective,
        modelId: CLAUDE_MODEL,
        restaurantId: session.user.restaurantId
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella generazione del contenuto' },
        { status: response.status }
      )
    }

    const contentData = await response.json()
    return NextResponse.json(contentData)
    
  } catch (error: any) {
    console.error('Errore nella generazione del contenuto:', error)
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