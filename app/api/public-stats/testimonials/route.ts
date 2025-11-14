import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const apiUrl = `${backendUrl}/api/public-stats/testimonials`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // No cache per dati sempre aggiornati
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Errore nel recupero delle testimonianze'
      }, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 })
  }
}

