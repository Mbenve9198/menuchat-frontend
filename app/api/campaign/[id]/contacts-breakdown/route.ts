import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 📊 API per ottenere breakdown contatti per stato
 * @route GET /api/campaign/[id]/contacts-breakdown
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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'ID campagna è richiesto'
      }, { status: 400 })
    }

    // Costruisci l'URL del backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const url = status 
      ? `${backendUrl}/api/campaign/${campaignId}/contacts-breakdown?status=${status}`
      : `${backendUrl}/api/campaign/${campaignId}/contacts-breakdown`
    
    console.log(`📊 Frontend: Breakdown contatti campagna ${campaignId}, status: ${status || 'all'}`)
    
    // Chiama l'API del backend
    const response = await fetch(url, {
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
        error: data.error || data.message || 'Errore nel recupero del breakdown'
      }, { status: response.status })
    }

    console.log(`✅ Frontend: Breakdown recuperato - ${data.data?.total || 0} contatti`)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Errore nel breakdown (frontend):', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error.message
    }, { status: 500 })
  }
}















