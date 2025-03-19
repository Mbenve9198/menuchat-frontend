import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica che il metodo sia POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { triggerPhrase } = req.body

    if (!triggerPhrase || triggerPhrase.trim() === '') {
      return res.status(400).json({ 
        available: false, 
        error: 'Trigger phrase cannot be empty' 
      })
    }

    // Fai la richiesta al backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check-trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ triggerPhrase })
    })

    const data = await response.json()
    return res.status(200).json(data)

  } catch (error) {
    console.error('Error checking trigger availability:', error)
    return res.status(500).json({ 
      available: false, 
      error: 'Server error' 
    })
  }
}
