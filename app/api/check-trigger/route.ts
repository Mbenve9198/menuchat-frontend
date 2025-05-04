import { NextResponse } from 'next/server'
import axios from 'axios'

// Rimuovi l'export default e usa invece questo formato
export async function POST(request: Request) {
  let requestBody: any = {}
  
  try {
    requestBody = await request.json()
    const { triggerPhrase } = requestBody
    
    // Verifica che il trigger phrase sia valido
    if (!triggerPhrase || triggerPhrase.trim() === '') {
      return NextResponse.json({ 
        available: false, 
        error: 'Il trigger phrase non può essere vuoto' 
      })
    }
    
    // Verifica che sia configurata la variabile d'ambiente BACKEND_URL
    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL non configurato. Impossibile contattare il servizio di verifica.')
    }
    
    // Invia la richiesta al backend e attende la risposta
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/setup/check-trigger`, 
      { triggerPhrase: triggerPhrase.trim() }
    )
    
    // Ritorna direttamente la risposta dal backend
    return NextResponse.json(response.data)
    
  } catch (error: any) {
    console.error('Errore nella verifica del trigger phrase:', error)
    
    return NextResponse.json({ 
      available: false, 
      error: 'Si è verificato un errore durante la verifica del trigger phrase',
      details: error.message
    })
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
