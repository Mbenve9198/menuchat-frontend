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
    const { message, buttonText, updateAllLanguages, menuUrl, menuPdfUrl } = data
    const templateId = params.templateId

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Creiamo l'oggetto da inviare al backend
    const updateData: any = {
      updateAllLanguages: updateAllLanguages === true
    }

    // Aggiungiamo i dati in base a quelli forniti
    if (message !== undefined) {
      updateData.message = message
    }
    
    if (buttonText !== undefined) {
      updateData.buttonText = buttonText
    }
    
    if (menuUrl !== undefined) {
      updateData.menuUrl = menuUrl
    }
    
    if (menuPdfUrl !== undefined) {
      updateData.menuPdfUrl = menuPdfUrl
    }

    // Inviamo la richiesta al backend
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