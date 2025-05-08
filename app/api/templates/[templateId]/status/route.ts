import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(
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

    const templateId = params.templateId
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'ID template richiesto' },
        { status: 400 }
      )
    }

    // Richiedi lo stato del template dal backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/templates/${templateId}/status`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Impossibile recuperare lo stato del template')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nel controllo dello stato del template:', error)
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 