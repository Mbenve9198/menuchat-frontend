import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET: ottiene tutte le campagne per il ristorante
export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni restaurantId dalla sessione
    const restaurantId = session.user.restaurantId

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'ID ristorante mancante' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Richiedi le campagne dal backend
    const response = await fetch(`${backendUrl}/api/campaign`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella richiesta delle campagne' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nel recupero delle campagne:', error)
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

// POST: crea una nuova campagna
export async function POST(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni dati dalla richiesta
    const campaignData = await request.json()

    if (!campaignData) {
      return NextResponse.json(
        { success: false, error: 'Dati della campagna mancanti' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di creazione al backend
    const response = await fetch(`${backendUrl}/api/campaign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(campaignData)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Errore nella creazione della campagna' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nella creazione della campagna:', error)
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