import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'
    const limit = searchParams.get('limit') || '20'

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const apiUrl = `${backendUrl}/api/public-stats/live-feed?period=${period}&limit=${limit}`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // No cache per dati sempre freschi
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Errore nel recupero del live feed'
      }, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching public live feed:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 })
  }
}

