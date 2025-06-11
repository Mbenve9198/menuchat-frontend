import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
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
    const { 
      message, 
      messageBody,
      buttonText, 
      reviewButtonText,
      updateAllLanguages, 
      menuUrl, 
      menuPdfUrl,
      mediaUrl,
      messageType,
      language,
      restaurantId
    } = data
    const templateId = params.templateId

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Creiamo l'oggetto da inviare al backend nel formato RestaurantMessage
    const updateData: any = {
      messageBody: message || messageBody,
      updateAllLanguages: updateAllLanguages === true
    }

    // Aggiungiamo i dati opzionali se presenti
    if (language) {
      updateData.language = language
    }
    
    if (restaurantId) {
      updateData.restaurantId = restaurantId
    }
    
    if (messageType) {
      updateData.messageType = messageType
    }
    
    if (reviewButtonText || buttonText) {
      updateData.reviewButtonText = reviewButtonText || buttonText
    }
    
    if (menuUrl) {
      updateData.menuUrl = menuUrl
    }
    
    if (mediaUrl || menuPdfUrl) {
      updateData.mediaUrl = mediaUrl || menuPdfUrl
    }

    // Inviamo la richiesta al backend usando la rotta corretta
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