import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// POST: Invia un template di campagna a Twilio per approvazione
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

    // Ottieni l'ID della campagna
    const campaignId = params.id

    // Ottieni i dati dalla richiesta
    const { category } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'ID campagna mancante' },
        { status: 400 }
      )
    }

    if (!category || !['UTILITY', 'MARKETING', 'AUTHENTICATION', 'SERVICE'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Categoria non valida. Utilizzare UTILITY, MARKETING, AUTHENTICATION o SERVICE' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Invia la richiesta di sottomissione del template al backend
    const response = await fetch(`${backendUrl}/api/campaign/${campaignId}/submit-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ category })
    })

    if (!response.ok) {
      // Se ricevi un errore 404 Template non trovato, prova a creare i template predefiniti
      if (response.status === 404) {
        try {
          // Ottieni i dati dell'errore
          const errorData = await response.json()
          
          if (errorData.error && errorData.error.includes('Template non trovato')) {
            console.log('Template non trovato, creando template predefiniti...')
            
            // Crea template predefiniti
            const defaultsResponse = await fetch(`${backendUrl}/api/campaign-templates/create-defaults`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`
              }
            })
            
            if (!defaultsResponse.ok) {
              return NextResponse.json(
                { success: false, error: 'Impossibile creare template predefiniti' },
                { status: 500 }
              )
            }
            
            // Riprova a inviare il template
            const retryResponse = await fetch(`${backendUrl}/api/campaign/${campaignId}/submit-template`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`
              },
              body: JSON.stringify({ category })
            })
            
            if (!retryResponse.ok) {
              const retryErrorData = await retryResponse.json().catch(() => ({ error: 'Errore del server' }))
              return NextResponse.json(
                { success: false, error: retryErrorData.error || 'Errore nella sottomissione del template (secondo tentativo)' },
                { status: retryResponse.status }
              )
            }
            
            const retryData = await retryResponse.json()
            return NextResponse.json(retryData)
          }
        } catch (innerError) {
          console.error('Errore nel tentativo di creare template predefiniti:', innerError)
        }
      }
      
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