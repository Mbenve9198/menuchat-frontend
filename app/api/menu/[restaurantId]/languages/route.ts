import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params

    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID è richiesto'
      }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    const response = await fetch(`${backendUrl}/api/menu/${restaurantId}/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Errore nel recupero delle lingue supportate'
      }, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching supported languages:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Non autenticato'
      }, { status: 401 })
    }

    const { restaurantId } = params
    const body = await request.json()

    if (!restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID è richiesto'
      }, { status: 400 })
    }

    // Verifica che l'utente stia aggiornando il proprio ristorante
    if (session.user.restaurantId !== restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Non autorizzato'
      }, { status: 403 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    const response = await fetch(`${backendUrl}/api/menu/${restaurantId}/languages`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Errore nell\'aggiornamento delle lingue supportate'
      }, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error updating supported languages:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 })
  }
} 