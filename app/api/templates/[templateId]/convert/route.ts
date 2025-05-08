import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(
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
    const { message, newType, updateAllLanguages, menuUrl, menuPdfUrl } = data
    const templateId = params.templateId

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      )
    }

    if (!newType || !['MEDIA', 'CALL_TO_ACTION'].includes(newType)) {
      return NextResponse.json(
        { success: false, error: "Valid new template type is required" },
        { status: 400 }
      )
    }

    // Verifica che il tipo corretto abbia i dati necessari
    if (newType === 'CALL_TO_ACTION' && !menuUrl) {
      return NextResponse.json(
        { success: false, error: "Menu URL is required for CALL_TO_ACTION templates" },
        { status: 400 }
      )
    }
    
    if (newType === 'MEDIA' && !menuPdfUrl) {
      return NextResponse.json(
        { success: false, error: "Menu PDF URL is required for MEDIA templates" },
        { status: 400 }
      )
    }

    // Creiamo l'oggetto da inviare al backend
    const convertData = {
      message,
      newType,
      updateAllLanguages: updateAllLanguages === true,
      menuUrl,
      menuPdfUrl
    }

    // Inviamo la richiesta al backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(convertData)
    })

    const result = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to convert template" },
        { status: response.status }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in template convert route:', error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 