import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.restaurantId) {
      return new Response(JSON.stringify({ success: false, error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Proxy al backend
    const response = await fetch(`${BACKEND_URL}/api/ai-commands/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        'x-restaurant-id': session.user.restaurantId
      }
    })

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Errore API AI config GET:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Errore del server' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT(request: NextRequest) {
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
    const response = await fetch(`${BACKEND_URL}/api/ai-commands/config`, {
      method: 'PUT',
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
    console.error('Errore API AI config PUT:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Errore del server' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 