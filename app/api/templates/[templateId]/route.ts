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
    const { message, buttonText, updateAllLanguages } = data
    const templateId = params.templateId

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Gestione aggiornamento del testo del messaggio
    if (message !== undefined) {
      const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ 
          message, 
          updateAllLanguages: updateAllLanguages === true 
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: result.error || "Failed to update template" },
          { status: response.status }
        )
      }

      return NextResponse.json(result)
    }

    // Gestione aggiornamento del testo del pulsante
    if (buttonText !== undefined) {
      const buttonResponse = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}/button-text`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ 
          buttonText, 
          updateAllLanguages: updateAllLanguages === true
        })
      })

      const buttonResult = await buttonResponse.json()
      
      if (!buttonResponse.ok) {
        return NextResponse.json(
          { success: false, error: buttonResult.error || "Failed to update button text" },
          { status: buttonResponse.status }
        )
      }

      return NextResponse.json(buttonResult)
    }

    return NextResponse.json({ success: false, error: "No update data provided" }, { status: 400 })
  } catch (error) {
    console.error('Error in template PUT route:', error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 