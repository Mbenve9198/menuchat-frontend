import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Get restaurantId from query params or from session
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId') || session.user.restaurantId
    const reviewSettings = searchParams.get('reviewSettings') === 'true'
    const templateId = searchParams.get('templateId')
    const buttonText = searchParams.get('buttonText') === 'true'

    if (!restaurantId && !templateId) {
      return NextResponse.json(
        { error: 'ID ristorante o ID template richiesto' },
        { status: 400 }
      )
    }

    // Se sono richieste le impostazioni di recensione
    if (reviewSettings && restaurantId) {
      const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${restaurantId}/review-settings`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Impossibile recuperare le impostazioni di recensione')
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Se è richiesto il testo del pulsante
    if (buttonText && templateId) {
      const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}/button-text`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Impossibile recuperare il testo del pulsante')
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Get templates from backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${restaurantId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Impossibile recuperare i template')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nella route API dei template:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { templateId, message, buttonText } = await request.json()
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'ID template richiesto' },
        { status: 400 }
      )
    }

    // Se è richiesto l'aggiornamento del testo del pulsante
    if (buttonText !== undefined) {
      const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}/button-text`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ buttonText })
      })

      if (!response.ok) {
        throw new Error('Impossibile aggiornare il testo del pulsante')
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Altrimenti, aggiorna il messaggio
    const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      throw new Error('Impossibile aggiornare il template')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nella route API dei template:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { restaurantId, reviewLink, reviewPlatform } = await request.json()
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'ID ristorante richiesto' },
        { status: 400 }
      )
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${restaurantId}/review-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ reviewLink, reviewPlatform })
    })

    if (!response.ok) {
      throw new Error('Impossibile aggiornare le impostazioni di recensione')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nella route API delle impostazioni di recensione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 