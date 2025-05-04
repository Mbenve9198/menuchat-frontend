import { NextResponse } from 'next/server'

// Rimuovi l'export default e usa invece questo formato
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { triggerPhrase } = body

    if (!triggerPhrase || triggerPhrase.trim() === '') {
      return NextResponse.json(
        { available: false, error: 'Trigger phrase cannot be empty' },
        { status: 400 }
      )
    }

    // Usa BACKEND_URL come gli altri file
    const response = await fetch(`${process.env.BACKEND_URL}/api/setup/check-trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ triggerPhrase })
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error checking trigger availability:', error)
    return NextResponse.json(
      { available: false, error: 'Server error' },
      { status: 500 }
    )
  }
}

// Opzionale: aggiungi questo per gestire esplicitamente altri metodi HTTP
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
