import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function POST(req: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Estrai i dati dal body
    const body = await req.json()
    const { dishId, prompt, dishName } = body

    // Validazione input
    if (!dishId || !prompt || !dishName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'dishId, prompt e dishName sono richiesti' 
        },
        { status: 400 }
      )
    }

    // Validazione lunghezza prompt (limite Imagen: 480 token ≈ 1920 caratteri)
    if (prompt.length > 1500) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Il prompt è troppo lungo. Massimo 1500 caratteri.' 
        },
        { status: 400 }
      )
    }

    console.log(`🎨 Frontend: Richiesta generazione immagine per piatto: ${dishName}`)

    // Chiamata al backend
    const response = await fetch(`${BACKEND_URL}/api/menu/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        dishId,
        prompt,
        dishName
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`❌ Errore backend generazione immagine:`, data)
      
      // Gestione errori specifici
      if (data.type === 'quota_exceeded') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Quota Google Imagen superata. Riprova più tardi.',
            type: 'quota_exceeded'
          },
          { status: 429 }
        )
      }

      if (data.type === 'safety_filter') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Il prompt contiene contenuto non appropriato. Modifica la descrizione.',
            type: 'safety_filter'
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Errore nella generazione dell\'immagine' 
        },
        { status: response.status }
      )
    }

    console.log(`✅ Frontend: Immagine generata con successo per ${dishName}`)

    return NextResponse.json({
      success: true,
      imageUrl: data.imageUrl,
      message: data.message,
      stats: data.stats
    })

  } catch (error) {
    console.error('Errore nella generazione immagine (frontend):', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server nella generazione dell\'immagine' 
      },
      { status: 500 }
    )
  }
} 