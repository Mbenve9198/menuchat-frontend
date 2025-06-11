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

    // Nel nuovo sistema RestaurantMessage, la "conversione" è semplicemente un update
    // con i nuovi parametri di tipo. Usiamo la normale API di update.
    const updateData = {
      messageBody: message,
      messageType: newType === 'MEDIA' ? 'menu' : 'menu',
      updateAllLanguages: updateAllLanguages === true,
      menuUrl: newType === 'CALL_TO_ACTION' ? menuUrl : null,
      mediaUrl: newType === 'MEDIA' ? menuPdfUrl : null
    }

    // Usiamo la normale rotta di update invece di una rotta separata di conversione
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
        { success: false, error: result.error || "Failed to convert template" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Template converted successfully',
      data: result
    })
  } catch (error) {
    console.error('Error in template convert route:', error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 