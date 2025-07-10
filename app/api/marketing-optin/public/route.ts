import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Questo endpoint è PUBBLICO - non richiede autenticazione
    // È usato dalla landing page optin per i clienti non autenticati
    
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID è richiesto' },
        { status: 400 }
      )
    }

    // Chiama direttamente il backend senza token di autenticazione
    // Il backend deve gestire questa chiamata come pubblica
    const backendUrl = new URL(`${process.env.BACKEND_URL}/api/marketing-optin/public`)
    backendUrl.searchParams.set('restaurantId', restaurantId)

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore del server' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Public API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
} 