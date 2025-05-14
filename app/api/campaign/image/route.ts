import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'

// Inizializza OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Verifica l'autenticazione
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Estrai i dati dalla richiesta
    const data = await request.json()
    const { prompt, messageText, campaignType, restaurantName, model = 'dall-e-3' } = data
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt richiesto' },
        { status: 400 }
      )
    }

    console.log('Generazione immagine con prompt:', prompt)
    console.log('Modello utilizzato:', model)

    try {
      // Genera l'immagine usando OpenAI DALL-E
      const response = await openai.images.generate({
        model: model,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      });

      // Estrai l'URL dell'immagine
      const imageUrl = response.data[0]?.url
      
      if (!imageUrl) {
        throw new Error('Nessuna immagine generata')
      }

      return NextResponse.json({
        success: true,
        data: {
          imageUrl,
          prompt
        }
      })
    } catch (openaiError) {
      console.error('Errore OpenAI:', openaiError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Errore nella generazione dell\'immagine',
          details: openaiError instanceof Error ? openaiError.message : String(openaiError)
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Errore nella generazione dell\'immagine:', error)
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