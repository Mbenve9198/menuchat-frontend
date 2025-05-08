import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get restaurantId from query params or from session
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId') || session.user.restaurantId

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID required' },
        { status: 400 }
      )
    }

    // Get bot configuration from backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/bot-config/${restaurantId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to retrieve bot configuration')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in bot-config API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 