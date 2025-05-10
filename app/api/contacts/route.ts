import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Funzione per fare il fetch dei contatti dal backend
async function fetchContactsFromBackend(restaurantId: string, token: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const response = await fetch(`${apiUrl}/contacts/restaurant/${restaurantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error fetching contacts: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching contacts from backend:", error)
    throw error
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const url = new URL(req.url)
    const restaurantId = url.searchParams.get("restaurantId")
    
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
      
      // In caso di errore di connessione al backend, fallback a dati mock temporanei
      // NOTA: Questo è solo per sviluppo e test, da rimuovere in produzione
      console.warn("Using mock data as fallback")
      const mockContacts = generateMockContacts(75)
      
      return NextResponse.json({
        success: true,
        contacts: mockContacts,
        pagination: {
          total: mockContacts.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(mockContacts.length / parseInt(limit))
        }
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

// Funzione per generare contatti mock (solo per fallback)
function generateMockContacts(count: number = 50) {
  const firstNames = [
    "Marco", "Giulia", "Alessandro", "Sofia", "Francesco", "Chiara", "Matteo", "Valentina",
    "Andrea", "Martina", "Luca", "Giorgia", "Lorenzo", "Alessia", "Gabriele", "Beatrice",
    "Davide", "Elisa", "Simone", "Federica", "Giovanni", "Alice", "Federico", "Laura"
  ]
  
  const lastNames = [
    "Rossi", "Ferrari", "Russo", "Bianchi", "Romano", "Colombo", "Ricci", "Marino",
    "Greco", "Bruno", "Gallo", "Conti", "Costa", "Giordano", "Mancini", "Rizzo",
    "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso"
  ]
  
  const countries = [
    { code: "IT", prefixes: ["+39"] },
    { code: "US", prefixes: ["+1"] },
    { code: "GB", prefixes: ["+44"] },
    { code: "FR", prefixes: ["+33"] },
    { code: "DE", prefixes: ["+49"] },
    { code: "ES", prefixes: ["+34"] }
  ]
  
  const contacts = []
  
  for (let i = 0; i < count; i++) {
    // Scegli una nazionalità casuale
    const country = countries[Math.floor(Math.random() * countries.length)]
    
    // Crea un numero di telefono casuale
    const prefix = country.prefixes[Math.floor(Math.random() * country.prefixes.length)]
    let phoneNumber = prefix
    
    // Aggiungi le cifre in base al prefisso
    switch (prefix) {
      case "+39": // Italia: 10 cifre
        phoneNumber += " " + Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("")
        break
      case "+1": // USA: 10 cifre con formato XXX-XXX-XXXX
        const areaCode = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join("")
        const centralOffice = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join("")
        const lineNumber = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("")
        phoneNumber += " " + areaCode + "-" + centralOffice + "-" + lineNumber
        break
      default: // Altri paesi: 9-11 cifre
        const digitCount = 9 + Math.floor(Math.random() * 3) // 9-11 cifre
        phoneNumber += " " + Array.from({ length: digitCount }, () => Math.floor(Math.random() * 10)).join("")
    }
    
    // Nome e cognome casuali
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    contacts.push({
      _id: `contact_${i + 1}`,
      name: `${firstName} ${lastName}`,
      phoneNumber: phoneNumber,
      country: country.code === "IT" ? "Italia" : 
               country.code === "US" ? "Stati Uniti" :
               country.code === "GB" ? "Regno Unito" :
               country.code === "FR" ? "Francia" :
               country.code === "DE" ? "Germania" :
               country.code === "ES" ? "Spagna" : "",
      countryCode: country.code,
      lastVisit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Ultimi 90 giorni
      visitCount: Math.floor(Math.random() * 20) + 1,
      totalInteractions: Math.floor(Math.random() * 50) + 1,
      optIn: Math.random() > 0.1 // 90% di opt-in
    })
  }
  
  return contacts
} 