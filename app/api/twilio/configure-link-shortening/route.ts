import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * 🔗 API per configurare il Link Shortening e Click Tracking
 * @route POST /api/twilio/configure-link-shortening
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

    // Costruisci l'URL del backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    console.log(`🔗 Frontend: Configurazione Link Shortening per ristorante ${session.user.restaurantId}`)
    
    // Chiama l'API del backend per configurare il click tracking
    const response = await fetch(`${backendUrl}/api/twilio/configure-webhook`, {
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
        error: data.error || data.message || 'Errore nella configurazione del Link Shortening'
      }, { status: response.status })
    }

    console.log(`✅ Frontend: Link Shortening configurato per ristorante ${session.user.restaurantId}`)

    return NextResponse.json({
      success: true,
      data: {
        ...data.data,
        manualSteps: [
          '1. Vai su console.twilio.com',
          '2. Messaging > Services > Seleziona il tuo Messaging Service',
          '3. Vai su "Link Shortening"',
          '4. Abilita "Shorten URLs"',
          '5. Configura il tuo dominio (es: twil.io)',
          `6. Imposta Click Event Webhook: ${data.data?.webhookUrl}`,
          `7. Imposta Status Callback URL: ${data.data?.statusWebhookUrl}`,
          '8. Salva le configurazioni'
        ],
        note: 'Il Link Shortening richiede un dominio verificato e fa parte di Engagement Suite'
      }
    })

  } catch (error: any) {
    console.error('❌ Errore nella configurazione Link Shortening (frontend):', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error.message
    }, { status: 500 })
  }
} 