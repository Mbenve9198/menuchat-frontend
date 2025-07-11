import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.restaurantId) {
      return NextResponse.json({
        success: false,
        error: 'Non autenticato'
      }, { status: 401 })
    }

    const body = await request.json()
    const { categoryId, dishOrders } = body

    if (!categoryId || !dishOrders || !Array.isArray(dishOrders)) {
      return NextResponse.json({
        success: false,
        error: 'Parametri mancanti: categoryId e dishOrders sono richiesti'
      }, { status: 400 })
    }

    // Costruisci l'URL del backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    // Chiama l'API del backend per riordinare i piatti
    const response = await fetch(`${backendUrl}/api/menu/dishes/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      },
      body: JSON.stringify({
        categoryId,
        dishOrders
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Errore nel riordinamento dei piatti'
      }, { status: response.status })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error reordering dishes:', error)
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 })
  }
} 