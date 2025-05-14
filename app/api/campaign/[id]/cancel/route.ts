import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// PUT: annulla una campagna programmata
export async function PUT(
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

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'ID campagna mancante' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di annullamento al backend
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Errore nell\'annullamento della campagna' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nell\'annullamento della campagna:', error)
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