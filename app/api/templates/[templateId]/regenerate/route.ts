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
    const templateId = params.templateId

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Invia la richiesta di rigenerazione al backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to regenerate message" },
        { status: response.status }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in message regenerate route:', error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 