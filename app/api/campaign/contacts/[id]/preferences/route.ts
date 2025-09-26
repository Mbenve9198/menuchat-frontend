import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// PUT: Aggiorna le preferenze privacy di un contatto
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

    // Ottieni l'ID del contatto
    const contactId = params.id

    // Ottieni i dati dalla richiesta
    const { marketingConsent } = await request.json()

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'ID contatto mancante' },
        { status: 400 }
      )
    }

    if (typeof marketingConsent !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Valore marketingConsent non valido' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di aggiornamento al backend
    const response = await fetch(`${backendUrl}/api/contacts/${contactId}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ marketingConsent })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nell\'aggiornamento delle preferenze' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento delle preferenze:', error)
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