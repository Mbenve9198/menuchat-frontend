import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { restaurantId, menuData, addIngredientsDescription } = await request.json()

    if (!restaurantId || !menuData) {
      return NextResponse.json({ 
        error: 'Parametri mancanti: restaurantId e menuData sono richiesti' 
      }, { status: 400 })
    }

    // Chiama il backend per importare i dati del menu
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/menu/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
      body: JSON.stringify({
        restaurantId,
        menuData,
        addIngredientsDescription: !!addIngredientsDescription
      })
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
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