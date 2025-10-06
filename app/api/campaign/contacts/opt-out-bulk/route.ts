import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 🚫 API per mettere opt-out contatti in bulk
 * @route POST /api/campaign/contacts/opt-out-bulk
 * @access Private
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Non autenticato'
      }, { status: 401 })
    }

    const body = await request.json()
    const { contactIds, reason } = body

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Array di ID contatti richiesto'
      }, { status: 400 })
    }

    // Costruisci l'URL del backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    console.log(`🚫 Frontend: Opt-out bulk di ${contactIds.length} contatti`)
    
    // Chiama l'API del backend per opt-out
    const response = await fetch(`${backendUrl}/api/campaign/contacts/opt-out-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ contactIds, reason })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`❌ Errore backend (${response.status}):`, data)
      return NextResponse.json({
        success: false,
        error: data.error || data.message || 'Errore nell\'opt-out dei contatti'
      }, { status: response.status })
    }

    console.log(`✅ Frontend: ${data.data?.optOutCount || 0} contatti messi in opt-out`)

    return NextResponse.json(data)

  } catch (error: any) {
    console.error('❌ Errore nell\'opt-out bulk (frontend):', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error.message
    }, { status: 500 })
  }
}



