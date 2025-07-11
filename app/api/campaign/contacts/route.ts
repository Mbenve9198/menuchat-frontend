import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni restaurantId dalla sessione
    const restaurantId = session.user.restaurantId

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'ID ristorante mancante' },
        { status: 400 }
      )
    }

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    
    // Richiedi i contatti dal backend
    const response = await fetch(`${backendUrl}/api/campaign/contacts`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      cache: 'no-store' // Importante per ottenere sempre dati aggiornati
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella richiesta dei contatti' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      contacts: data.contacts || [],
      countryCodes: data.countryCodes || [],
      restaurant: data.restaurant || {
        name: session.user.name || 'Your Business'
      }
    })
  } catch (error: any) {
    console.error('Errore nel recupero dei contatti:', error)
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

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ API DELETE contatti - Inizio richiesta')
    
    // Ottieni la sessione e verifica l'autenticazione
    const session = await auth()
    console.log('🗑️ Sessione ottenuta:', session ? 'OK' : 'NO')
    
    if (!session) {
      console.log('🗑️ Sessione mancante, ritorno 401')
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Ottieni restaurantId dalla sessione
    const restaurantId = session.user.restaurantId
    console.log('🗑️ Restaurant ID:', restaurantId)

    if (!restaurantId) {
      console.log('🗑️ Restaurant ID mancante')
      return NextResponse.json(
        { success: false, error: 'ID ristorante mancante' },
        { status: 400 }
      )
    }

    // Ottieni i dati dal body della richiesta
    let requestBody
    try {
      requestBody = await request.json()
      console.log('🗑️ Body della richiesta:', requestBody)
    } catch (error) {
      console.log('🗑️ Errore nel parsing del body:', error)
      return NextResponse.json(
        { success: false, error: 'Corpo della richiesta non valido' },
        { status: 400 }
      )
    }

    const { contactIds } = requestBody

    // Validazione degli input
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      console.log('🗑️ Validazione contactIds fallita:', contactIds)
      return NextResponse.json(
        { success: false, error: 'Array di ID contatti richiesto' },
        { status: 400 }
      )
    }

    console.log('🗑️ Contact IDs da cancellare:', contactIds)

    // URL dell'API backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    console.log('🗑️ Backend URL:', backendUrl)
    
    console.log('🗑️ Invio richiesta al backend...')
    
    // Richiedi la cancellazione dei contatti al backend
    const response = await fetch(`${backendUrl}/api/campaign/contacts/bulk`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({ contactIds })
    })

    console.log('🗑️ Risposta dal backend:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (parseError) {
        console.log('🗑️ Errore nel parsing della risposta di errore:', parseError)
        errorData = { error: 'Errore del server' }
      }
      
      console.log('🗑️ Dati di errore dal backend:', errorData)
      
      return NextResponse.json(
        { success: false, error: errorData.error || 'Errore nella cancellazione dei contatti' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('🗑️ Dati di successo dal backend:', data)
    
    const responseData = {
      success: true,
      message: data.message,
      deletedCount: data.data?.deletedCount || 0,
      deletedIds: data.data?.deletedIds || []
    }
    
    console.log('🗑️ Risposta finale al frontend:', responseData)
    
    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('🗑️ Errore nella cancellazione bulk dei contatti:', error)
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