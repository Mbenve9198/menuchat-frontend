import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch templates')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in templates API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { templateId } = await request.json()
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.body)
    })

    if (!response.ok) {
      throw new Error('Failed to update template')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in templates API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 