import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Funzione per fare il fetch dei contatti dal backend
async function fetchContactsFromBackend(restaurantId: string, token: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    console.log("Connecting to API:", apiUrl)
    console.log("Restaurant ID:", restaurantId)
    console.log("Token available:", !!token)
    
    const url = `${apiUrl}/contacts/restaurant/${restaurantId}`
    console.log("Fetching from URL:", url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log("Response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Error fetching contacts: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log("Data received:", JSON.stringify(data).slice(0, 200) + "...")
    return data
  } catch (error) {
    console.error("Error fetching contacts from backend:", error)
    throw error
  }
}

export async function GET(req: Request) {
  try {
    console.log("Contacts API called")
    const session = await auth()
    
    console.log("Session available:", !!session)
    console.log("User available:", !!session?.user)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const url = new URL(req.url)
    const restaurantId = url.searchParams.get("restaurantId")
    
    console.log("Restaurant ID from query:", restaurantId)
    
    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "Restaurant ID is required" },
        { status: 400 }
      )
    }
    
    // Parametri di paginazione e filtro opzionali
    const page = url.searchParams.get("page") || "1"
    const limit = url.searchParams.get("limit") || "50"
    const search = url.searchParams.get("search") || ""
    const sort = url.searchParams.get("sort") || ""
    const optIn = url.searchParams.get("optIn") || ""
    
    // Recupera i contatti dal backend
    try {
      console.log("Attempting to fetch contacts from backend")
      const result = await fetchContactsFromBackend(
        restaurantId, 
        session.accessToken as string
      )
      
      // Trasforma i dati nel formato atteso dal frontend
      const transformedContacts = result.contacts.map((contact: any) => ({
        _id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        country: getCountryName(contact.countryCode),
        countryCode: contact.countryCode,
        lastVisit: contact.lastContact,
        visitCount: contact.uniqueDayInteractions,
        totalInteractions: contact.totalInteractions,
        optIn: contact.optIn
      }))
      
      return NextResponse.json({
        success: true,
        contacts: transformedContacts,
        pagination: result.pagination
      })
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
      
      // Restituisci un array vuoto invece di dati mock
      return NextResponse.json({
        success: true,
        contacts: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: 0
        },
        message: "Impossibile connettersi al backend. Nessun contatto disponibile."
      })
    }
  } catch (error) {
    console.error("Error processing contacts request:", error)
    return NextResponse.json(
      { success: false, error: "Error processing request" },
      { status: 500 }
    )
  }
}

// Funzione per ottenere il nome del paese dal codice
function getCountryName(countryCode: string): string {
  const countryMap: {[key: string]: string} = {
    'IT': 'Italia',
    'US': 'Stati Uniti',
    'GB': 'Regno Unito',
    'FR': 'Francia',
    'DE': 'Germania',
    'ES': 'Spagna',
    'PT': 'Portogallo',
    'CH': 'Svizzera',
    'AT': 'Austria',
    'BE': 'Belgio',
    'NL': 'Paesi Bassi',
    'DK': 'Danimarca',
    'SE': 'Svezia',
    'NO': 'Norvegia',
    'FI': 'Finlandia',
    'CZ': 'Repubblica Ceca',
    'PL': 'Polonia',
    'HU': 'Ungheria',
    'GR': 'Grecia',
    'RU': 'Russia',
    'JP': 'Giappone',
    'CN': 'Cina',
    'IN': 'India',
    'BR': 'Brasile',
    'MX': 'Messico',
    'AU': 'Australia',
    'NZ': 'Nuova Zelanda'
  }
  
  return countryMap[countryCode] || countryCode
} 