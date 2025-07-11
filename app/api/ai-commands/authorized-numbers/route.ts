import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.restaurantId) {
      return new Response(JSON.stringify({ success: false, error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()

    // Proxy al backend
    const response = await fetch(`${BACKEND_URL}/api/ai-commands/authorized-numbers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'x-restaurant-id': session.user.restaurantId
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Errore API authorized numbers POST:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Errore del server' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 