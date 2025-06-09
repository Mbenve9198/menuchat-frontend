import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// POST: Invia un template a Twilio per approvazione
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni l'ID del template
    const templateId = params.id

    // Ottieni la categoria del template dalla richiesta
    const { category } = await request.json()

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'ID template mancante' },
        { status: 400 }
      )
    }

    if (!category || !['UTILITY', 'MARKETING', 'AUTHENTICATION', 'SERVICE'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Categoria non valida. Deve essere UTILITY, MARKETING, AUTHENTICATION o SERVICE' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di approvazione al backend
    const response = await fetch(`${backendUrl}/api/campaign-templates/${templateId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ category })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella sottomissione del template' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nella sottomissione del template:', error)
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