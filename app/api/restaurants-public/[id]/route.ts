import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID is required'
      }, { status: 400 })
    }

    // Costruisci l'URL del backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    // Chiama l'API del backend per ottenere le info pubbliche del ristorante
    const response = await fetch(`${backendUrl}/api/restaurants/${id}/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Errore nel recupero delle informazioni del ristorante'
      }, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching restaurant public info:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 })
  }
} 