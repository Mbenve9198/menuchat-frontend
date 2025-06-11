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

    // Nel nuovo sistema RestaurantMessage, tutti i messaggi sono sempre approvati
    // Non c'è bisogno di controllare lo status su Meta
    return NextResponse.json({
      success: true,
      status: 'APPROVED',
      message: 'RestaurantMessage templates are always approved'
    })
  } catch (error) {
    console.error('Errore nel controllo dello stato del template:', error)
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 