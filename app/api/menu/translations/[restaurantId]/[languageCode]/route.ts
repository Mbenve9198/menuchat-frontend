import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string; languageCode: string } }
) {
  try {
    // Verifica autenticazione
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { restaurantId, languageCode } = params

    if (!restaurantId || !languageCode) {
      return NextResponse.json({ 
        error: 'Parametri mancanti: restaurantId e languageCode sono richiesti' 
      }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

    // Chiama il backend per cancellare le traduzioni
    const backendResponse = await fetch(`${backendUrl}/api/menu/translations/${restaurantId}/${languageCode}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json({ 
        error: errorData.error || 'Errore durante la cancellazione delle traduzioni' 
      }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in menu translations delete API:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
} 