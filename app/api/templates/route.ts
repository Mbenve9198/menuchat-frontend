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

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'ID ristorante richiesto' },
        { status: 400 }
      )
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

    const { templateId, message } = await request.json()
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'ID template richiesto' },
        { status: 400 }
      )
    }

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