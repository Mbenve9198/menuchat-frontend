import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await auth();
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { restaurantId, targetLanguage, targetLanguageCode } = await request.json()

    if (!restaurantId || !targetLanguage || !targetLanguageCode) {
      return NextResponse.json({ 
        error: 'Parametri mancanti: restaurantId, targetLanguage e targetLanguageCode sono richiesti' 
      }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

    // Chiama il backend per generare le traduzioni
    const backendResponse = await fetch(`${backendUrl}/api/menu/translations/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        restaurantId,
        targetLanguage,
        targetLanguageCode
      }),
      cache: 'no-store'
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json({ 
        error: errorData.error || 'Errore durante la generazione delle traduzioni' 
      }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in menu translations generate API:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
} 