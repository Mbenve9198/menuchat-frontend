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

    const { restaurantId, replaceExistingTags = true } = await request.json()

    if (!restaurantId) {
      return NextResponse.json({ 
        error: 'restaurantId è richiesto' 
      }, { status: 400 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

    // Chiama il backend per l'analisi AI
    const backendResponse = await fetch(`${backendUrl}/api/menu/ai-analyze-dishes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        restaurantId,
        replaceExistingTags
      }),
      cache: 'no-store'
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json({ 
        error: errorData.error || 'Errore durante l\'analisi AI' 
      }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in AI dish analysis API:', error)
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
} 