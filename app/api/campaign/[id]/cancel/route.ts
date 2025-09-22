import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 🚫 API per cancellare una campagna schedulata su Twilio
 * @route POST /api/campaign/[id]/cancel
 * @access Private
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Non autenticato'
      }, { status: 401 })
    }

    const { id: campaignId } = params

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'ID campagna è richiesto'
      }, { status: 400 })
    }

    // Costruisci l'URL del backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    console.log(`🚫 Frontend: Cancellazione campagna ${campaignId}`)
    
    // Chiama l'API del backend per cancellare la campagna
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`❌ Errore backend (${response.status}):`, data)
      return NextResponse.json({
        success: false,
        error: data.error || data.message || 'Errore nella cancellazione della campagna'
      }, { status: response.status })
    }

    console.log(`✅ Frontend: Campagna ${campaignId} cancellata con successo`)
    console.log(`📊 Risultati: ${data.data?.canceledMessages || 0} messaggi cancellati`)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Errore nella cancellazione campagna (frontend):', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error.message
    }, { status: 500 })
  }
} 