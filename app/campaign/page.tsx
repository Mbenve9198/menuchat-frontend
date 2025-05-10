"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  ChevronRight, 
  Flag, 
  Search, 
  CheckCircle, 
  ArrowLeft,
  Circle,
  UserCheck,
  Filter,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  country: string;
  countryCode: string;
  selected: boolean;
}

export default function CampaignPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [allSelected, setAllSelected] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  
  // Elenco dei paesi disponibili in base ai contatti
  const [availableCountries, setAvailableCountries] = useState<{code: string, name: string}[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchContacts()
    }
  }, [status, session])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contacts?restaurantId=${session?.user?.restaurantId}`)
      const data = await response.json()
      
      if (data.success) {
        // Aggiungiamo il campo selected a ogni contatto
        const contactsWithSelection = data.contacts.map((contact: any) => ({
          ...contact,
          selected: false
        }))
        
        setContacts(contactsWithSelection)
        setFilteredContacts(contactsWithSelection)
        
        // Estrai i paesi disponibili dai contatti
        const countries = Array.from(new Set(contactsWithSelection.map((c: Contact) => c.countryCode)))
          .map(code => {
            const codeStr = code as string;
            const name = getCountryName(codeStr) || codeStr;
            return { code: codeStr, name: name as string };
          })
          .sort((a, b) => (a.name as string).localeCompare(b.name as string))
        
        setAvailableCountries(countries)
        
        // Mostra un messaggio se la risposta contiene un messaggio
        if (data.message) {
          toast({
            title: "Informazione",
            description: data.message,
            variant: "default",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Errore",
        description: "Impossibile caricare i contatti",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Filtra i contatti in base al termine di ricerca e ai paesi selezionati
    let filtered = contacts
    
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phoneNumber.includes(searchTerm)
      )
    }
    
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(contact => 
        selectedCountries.includes(contact.countryCode)
      )
    }
    
    setFilteredContacts(filtered)
  }, [searchTerm, selectedCountries, contacts])

  useEffect(() => {
    // Aggiorna il conteggio dei contatti selezionati
    const count = filteredContacts.filter(c => c.selected).length
    setSelectedCount(count)
    
    // Verifica se tutti i contatti sono selezionati
    setAllSelected(count > 0 && count === filteredContacts.length)
  }, [filteredContacts])

  const toggleCountryFilter = (countryCode: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryCode)) {
        return prev.filter(code => code !== countryCode)
      } else {
        return [...prev, countryCode]
      }
    })
  }

  const toggleSelectAll = () => {
    const newSelection = !allSelected
    
    setFilteredContacts(prev => 
      prev.map(contact => ({
        ...contact,
        selected: newSelection
      }))
    )
    
    // Aggiorna anche i contatti originali
    setContacts(prev => 
      prev.map(contact => {
        // Aggiorna solo se il contatto è tra quelli filtrati
        const filtered = filteredContacts.find(c => c._id === contact._id)
        return filtered 
          ? { ...contact, selected: newSelection }
          : contact
      })
    )
    
    setAllSelected(newSelection)
  }

  const toggleSelectContact = (contactId: string) => {
    setFilteredContacts(prev => 
      prev.map(contact => {
        if (contact._id === contactId) {
          return { ...contact, selected: !contact.selected }
        }
        return contact
      })
    )
    
    // Aggiorna anche i contatti originali
    setContacts(prev => 
      prev.map(contact => {
        if (contact._id === contactId) {
          return { ...contact, selected: !contact.selected }
        }
        return contact
      })
    )
  }

  const getCountryName = (countryCode: string): string => {
    const countryMap: {[key: string]: string} = {
      'IT': 'Italia',
      'US': 'Stati Uniti',
      'GB': 'Regno Unito',
      'FR': 'Francia',
      'DE': 'Germania',
      'ES': 'Spagna',
      // Aggiungi altri paesi se necessario
    }
    
    return countryMap[countryCode] || countryCode
  }

  const getFlagEmoji = (countryCode: string): string => {
    // Trasforma il codice paese in emoji bandiera
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    
    return String.fromCodePoint(...codePoints)
  }
  
  const handleNextStep = () => {
    const selectedContactIds = contacts
      .filter(contact => contact.selected)
      .map(contact => contact._id)
    
    if (selectedContactIds.length === 0) {
      toast({
        title: "Nessun contatto selezionato",
        description: "Seleziona almeno un contatto per procedere",
        variant: "destructive",
      })
      return
    }
    
    // Salva i contatti selezionati e vai al passaggio successivo
    localStorage.setItem("selectedContactIds", JSON.stringify(selectedContactIds))
    router.push("/campaign/template")
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1B9AAA]"></div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200 pb-20">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-6">
        {/* Header Section */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.push("/dashboard")}
                className="mr-3 p-2 rounded-full hover:bg-white/50"
              >
                <ArrowLeft className="w-5 h-5 text-[#1B9AAA]" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1B9AAA]">Nuova Campagna</h1>
                <p className="text-sm text-gray-700">
                  Seleziona i destinatari
                </p>
              </div>
            </div>
            <div className="relative w-8 h-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
                alt="Mascot"
                width={32}
                height={32}
                className="absolute -top-1 -right-1"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cerca contatti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 rounded-xl border-gray-200 w-full"
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-white rounded-xl p-4 shadow-md"
            >
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filtra per paese</h3>
              <div className="flex flex-wrap gap-2">
                {availableCountries.map(country => (
                  <button
                    key={country.code}
                    onClick={() => toggleCountryFilter(country.code)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium 
                      ${selectedCountries.includes(country.code) 
                        ? 'bg-[#1B9AAA] text-white' 
                        : 'bg-gray-100 text-gray-600'}`}
                  >
                    <span>{getFlagEmoji(country.code)}</span>
                    <span>{country.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Selected Count and Select All */}
          <div className="flex items-center justify-between mb-3 bg-white/80 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleSelectAll}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                {allSelected ? (
                  <CheckCircle className="w-5 h-5 text-[#06D6A0]" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </button>
              <span className="text-sm font-medium">
                {selectedCount === 0 
                  ? "Seleziona tutti" 
                  : `${selectedCount} selezionati`}
              </span>
            </div>
            <div>
              {selectedCount > 0 && (
                <Badge variant="outline" className="bg-[#1B9AAA]/10 text-[#1B9AAA] border-[#1B9AAA]/20">
                  {selectedCount} contatti
                </Badge>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="space-y-2 mb-6">
            {filteredContacts.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nessun contatto trovato</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Prova a modificare la ricerca
                  </p>
                )}
                {!searchTerm && contacts.length === 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">
                      Non ci sono ancora contatti nel database.
                    </p>
                    <p className="text-sm text-gray-500">
                      I contatti verranno aggiunti automaticamente quando i clienti scriveranno al ristorante tramite WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <motion.div
                  key={contact._id}
                  className={`bg-white rounded-xl p-3 shadow-sm flex items-center cursor-pointer ${
                    contact.selected ? 'border-2 border-[#06D6A0]' : ''
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => toggleSelectContact(contact._id)}
                >
                  <div className="mr-3">
                    {contact.selected ? (
                      <CheckCircle className="w-6 h-6 text-[#06D6A0]" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <p className="font-medium text-gray-800">{contact.name}</p>
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                        {getFlagEmoji(contact.countryCode)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {selectedCount} contatti selezionati
            </p>
            <p className="text-xs text-gray-500">Passo 1 di 3</p>
          </div>
          <CustomButton
            onClick={handleNextStep}
            disabled={selectedCount === 0}
            className="flex items-center gap-1"
          >
            Avanti
            <ArrowRight className="w-4 h-4 ml-1" />
          </CustomButton>
        </div>
      </div>
    </main>
  )
} 