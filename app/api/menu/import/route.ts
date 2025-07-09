import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, menuData, addIngredientsDescription } = await request.json()

    if (!restaurantId || !menuData) {
      return NextResponse.json({ 
        error: 'Parametri mancanti: restaurantId e menuData sono richiesti' 
      }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

    // Chiama il backend per importare i dati del menu
    const backendResponse = await fetch(`${backendUrl}/api/menu/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        restaurantId,
        menuData,
        addIngredientsDescription: !!addIngredientsDescription
      }),
      cache: 'no-store'
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json({ 
        error: errorData.error || 'Errore durante l\'importazione del menu' 
      }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in menu import API:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
} 