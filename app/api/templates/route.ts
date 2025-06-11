import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Get restaurantId from query params or from session
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId') || session.user.restaurantId
    const reviewSettings = searchParams.get('reviewSettings') === 'true'
    const templateId = searchParams.get('templateId')
    const buttonText = searchParams.get('buttonText') === 'true'

    if (!restaurantId && !templateId) {
      return NextResponse.json(
        { error: 'ID ristorante o ID template richiesto' },
        { status: 400 }
      )
    }

    // Usa la rotta corretta del nuovo sistema con query parameters
    const url = new URL(`${process.env.BACKEND_URL}/api/templates`)
    url.searchParams.set('restaurantId', restaurantId)
    
    if (reviewSettings) {
      url.searchParams.set('reviewSettings', 'true')
    }

    // Get templates/review settings from backend
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Impossibile recuperare i dati')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nella route API dei template:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { templateId, message, buttonText, updateAllLanguages, menuUrl, menuPdfUrl, messageBody, language, restaurantId, reviewButtonText, messageType, mediaUrl } = data

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Creiamo l'oggetto da inviare al backend nel formato RestaurantMessage
    const updateData: any = {
      messageBody: message || messageBody,
      language: language,
      restaurantId: restaurantId,
      updateAllLanguages: updateAllLanguages === true
    }

    // Aggiungiamo i dati specifici in base al tipo
    if (messageType) {
      updateData.messageType = messageType
    }
    
    if (menuUrl) {
      updateData.menuUrl = menuUrl
    }
    
    if (mediaUrl || menuPdfUrl) {
      updateData.mediaUrl = mediaUrl || menuPdfUrl
    }
    
    if (reviewButtonText || buttonText) {
      updateData.reviewButtonText = reviewButtonText || buttonText
    }

    // Usa la rotta corretta del nuovo sistema
    const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(updateData)
    })

    const result = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to update template" },
        { status: response.status }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in template PUT route:', error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { restaurantId, reviewLink, reviewPlatform } = await request.json()
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'ID ristorante richiesto' },
        { status: 400 }
      )
    }

    // Usa la rotta corretta del nuovo sistema
    const response = await fetch(`${process.env.BACKEND_URL}/api/templates`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ restaurantId, reviewLink, reviewPlatform })
    })

    if (!response.ok) {
      throw new Error('Impossibile aggiornare le impostazioni di recensione')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nella route API delle impostazioni di recensione:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 