import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// POST: Schedula l'invio di una campagna per una data futura
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni l'ID della campagna
    const campaignId = params.id

    // Ottieni dati dalla richiesta
    const { scheduledDate } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'ID campagna mancante' },
        { status: 400 }
      )
    }

    if (!scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'Data di invio programmata non fornita' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di scheduling al backend
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ scheduledDate })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella programmazione della campagna' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nella programmazione della campagna:', error)
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