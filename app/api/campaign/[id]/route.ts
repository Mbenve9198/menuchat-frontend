import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET: ottiene una campagna specifica
export async function GET(
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
    
    // Richiedi la campagna dal backend
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella richiesta della campagna' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nel recupero della campagna:', error)
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

// PUT: aggiorna una campagna esistente
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

    // Ottieni dati dalla richiesta
    const campaignData = await request.json()

    if (!campaignId || !campaignData) {
      return NextResponse.json(
        { success: false, error: 'ID campagna o dati mancanti' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di aggiornamento al backend
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(campaignData)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || data.message || 'Errore nell\'aggiornamento della campagna' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento della campagna:', error)
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

// DELETE: elimina una campagna
export async function DELETE(
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
    
    // Invia la richiesta di eliminazione al backend
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nell\'eliminazione della campagna' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nell\'eliminazione della campagna:', error)
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