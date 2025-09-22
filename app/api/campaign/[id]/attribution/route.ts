import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 🎯 API per ottenere le statistiche di attribution di una campagna
 * @route GET /api/campaign/[id]/attribution
 * @access Private
 */
export async function GET(
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
    
    console.log(`🎯 Frontend: Richiesta attribution stats per campagna ${campaignId}`)
    
    // Chiama l'API del backend per ottenere le statistiche di attribution
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}/attribution`, {
      method: 'GET',
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
        error: data.error || data.message || 'Errore nel recupero delle statistiche di attribution'
      }, { status: response.status })
    }

    console.log(`✅ Frontend: Attribution stats recuperate per campagna ${campaignId}`)
    console.log(`📊 Ritorni: ${data.data?.totalReturns || 0}`)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Errore nel recupero attribution stats (frontend):', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error.message
    }, { status: 500 })
  }
} 