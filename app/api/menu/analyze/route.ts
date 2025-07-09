import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.accessToken) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { fileUrl, fileType, restaurantId } = await request.json()

    if (!fileUrl || !fileType || !restaurantId) {
      return NextResponse.json({ 
        error: 'Parametri mancanti: fileUrl, fileType e restaurantId sono richiesti' 
      }, { status: 400 })
    }

    // Chiama il backend per analizzare il menu
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/menu/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`
      },
      body: JSON.stringify({
        fileUrl,
        fileType,
        restaurantId
      })
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      return NextResponse.json({ 
        error: errorData.error || 'Errore durante l\'analisi del menu' 
      }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in menu analyze API:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
} 