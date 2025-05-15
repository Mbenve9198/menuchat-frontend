import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// GET: Ottiene tutti i template di campagna disponibili
export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Recupera i parametri di query
    const { searchParams } = new URL(request.url)
    const campaignType = searchParams.get('campaignType')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const language = searchParams.get('language')
    const isActive = searchParams.get('isActive')
    
    // Costruisci l'URL con i parametri di query
    let apiUrl = `${backendUrl}/api/campaign-templates`
    const queryParams = []
    
    if (campaignType) queryParams.push(`campaignType=${campaignType}`)
    if (type) queryParams.push(`type=${type}`)
    if (status) queryParams.push(`status=${status}`)
    if (language) queryParams.push(`language=${language}`)
    if (isActive) queryParams.push(`isActive=${isActive}`)
    
    if (queryParams.length > 0) {
      apiUrl += `?${queryParams.join('&')}`
    }
    
    // Richiesta al backend
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nel recupero dei template' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nel recupero dei template:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
}

// POST: Crea un nuovo template di campagna
export async function POST(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni i dati dalla richiesta
    const templateData = await request.json()

    if (!templateData || !templateData.type || !templateData.name || !templateData.campaignType) {
      return NextResponse.json(
        { success: false, error: 'Dati mancanti nel template' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di creazione al backend
    const response = await fetch(`${backendUrl}/api/campaign-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(templateData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella creazione del template' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nella creazione del template:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore interno del server',
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
} 