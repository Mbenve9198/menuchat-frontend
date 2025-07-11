import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { numberId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.restaurantId) {
      return new Response(JSON.stringify({ success: false, error: 'Non autorizzato' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { numberId } = params

    // Proxy al backend
    const response = await fetch(`${BACKEND_URL}/api/ai-commands/authorized-numbers/${numberId}`, {
      method: 'DELETE',
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
    console.error('Errore API authorized numbers DELETE:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Errore del server' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 