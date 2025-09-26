"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Search, Users, Phone, Mail, MoreVertical, UserCheck, UserX, Loader2, Shield, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import BubbleBackground from "@/components/bubble-background"
import UILanguageSelector from "@/components/ui-language-selector"
import { CustomButton } from "@/components/ui/custom-button"
import { useSession } from "next-auth/react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/hooks/use-toast"

// Tipo di dato per un contatto
interface Contact {
  id: string | number
  name: string
  phone: string
  email?: string
  lastOrder: string
  countryCode: string
  language?: string
  interactionCount?: number
  marketingConsent: boolean
  optOutDate?: string
  optOutReason?: string
  receivedCampaigns?: number
  lastContactDate?: string
  createdAt?: string
}

// Tipo di dato per un country code
interface CountryCode {
  code: string
  name: string
  flag: string
}

export default function ContactsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  const { toast } = useToast()
  
  const [contacts, setContacts] = useState<Contact[]>([])
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [consentFilter, setConsentFilter] = useState("all") // all, opted-in, opted-out
  
  // Stati per il dialog di gestione contatto
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [isUpdatingContact, setIsUpdatingContact] = useState(false)

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/campaign/contacts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Errore nel recupero dei contatti')
      }

      setContacts(data.contacts || [])
      setCountryCodes(data.countryCodes || [])
    } catch (err: any) {
      console.error('Errore nel recupero dei contatti:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Load contacts when component mounts and session is ready
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchContacts()
    } else if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [status, session])

  // Filtro contatti
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      contact.phone.includes(searchQuery) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCountry = !selectedCountryCode || contact.countryCode === selectedCountryCode
    
    const matchesConsent = 
      consentFilter === "all" || 
      (consentFilter === "opted-in" && contact.marketingConsent) ||
      (consentFilter === "opted-out" && !contact.marketingConsent)
    
    return matchesSearch && matchesCountry && matchesConsent
  })

  const filterByCountry = (code: string) => {
    setSelectedCountryCode(code === selectedCountryCode ? null : code)
  }

  // Funzione per aprire il dialog di gestione contatto
  const openContactDialog = (contact: Contact) => {
    setSelectedContact(contact)
    setShowContactDialog(true)
  }

  // Funzione per aggiornare le preferenze del contatto
  const updateContactPreferences = async (contactId: string | number, marketingConsent: boolean) => {
    try {
      setIsUpdatingContact(true)

      const response = await fetch(`/api/campaign/contacts/${contactId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marketingConsent })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore del server' }))
        throw new Error(errorData.error || 'Errore nell\'aggiornamento delle preferenze')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Errore nell\'aggiornamento delle preferenze')
      }

      // Aggiorna il contatto nella lista locale
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact.id === contactId 
            ? { ...contact, marketingConsent, optOutDate: marketingConsent ? undefined : new Date().toISOString() }
            : contact
        )
      )

      // Aggiorna anche il contatto selezionato nel dialog
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact({
          ...selectedContact,
          marketingConsent,
          optOutDate: marketingConsent ? undefined : new Date().toISOString()
        })
      }

      toast({
        title: marketingConsent ? "✅ Consenso attivato" : "❌ Consenso rimosso",
        description: marketingConsent 
          ? "Il contatto riceverà campagne marketing"
          : "Il contatto non riceverà più campagne marketing",
      })

    } catch (error: any) {
      console.error('Errore nell\'aggiornamento delle preferenze:', error)
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare le preferenze",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingContact(false)
    }
  }

  const getConsentBadge = (contact: Contact) => {
    if (contact.marketingConsent) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Consenso
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <UserX className="w-3 h-3" />
          Opt-out
        </Badge>
      )
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-8">
        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <CustomButton
              variant="ghost"
              className="p-2 hover:bg-white/50 rounded-full"
              onClick={() => router.push("/campaign")}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </CustomButton>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#1B9AAA]" />
              Rubrica Contatti
            </h1>
            <UILanguageSelector variant="compact" />
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cerca per nome, telefono o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 border-gray-200 rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              {/* Filtro consenso */}
              <Select value={consentFilter} onValueChange={setConsentFilter}>
                <SelectTrigger className="flex-1 bg-white/80 border-gray-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i contatti</SelectItem>
                  <SelectItem value="opted-in">Con consenso</SelectItem>
                  <SelectItem value="opted-out">Senza consenso</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro paese */}
              <Select value={selectedCountryCode || "all"} onValueChange={(value) => setSelectedCountryCode(value === "all" ? null : value)}>
                <SelectTrigger className="flex-1 bg-white/80 border-gray-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i paesi</SelectItem>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistiche contatti */}
          <div className="mt-4 bg-white/80 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#1B9AAA]">{contacts.length}</p>
                <p className="text-xs text-gray-600">Totali</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter(c => c.marketingConsent).length}
                </p>
                <p className="text-xs text-gray-600">Con consenso</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {contacts.filter(c => !c.marketingConsent).length}
                </p>
                <p className="text-xs text-gray-600">Opt-out</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B9AAA]"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Caricamento contatti...</h3>
            <p className="text-gray-500">Recupero della rubrica in corso...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <span className="text-6xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Errore nel caricamento</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <CustomButton
              className="py-2 px-4 flex items-center justify-center mx-auto"
              onClick={fetchContacts}
            >
              Riprova
            </CustomButton>
          </div>
        )}

        {/* Contact List */}
        {!isLoading && !error && (
          <div className="w-full max-w-md space-y-3 mb-32">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-4 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                  onClick={() => openContactDialog(contact)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar con iniziali */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center text-white font-bold text-sm">
                        {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate">{contact.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{contact.phone}</span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">{contact.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {getConsentBadge(contact)}
                          <span className="text-xs text-gray-400">
                            Ultimo contatto: {formatDate(contact.lastContactDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Country flag */}
                      <span className="text-lg" title={contact.countryCode}>
                        {countryCodes.find(c => c.code === contact.countryCode)?.flag || "🌍"}
                      </span>
                      
                      {/* Privacy quick toggle */}
                      <Switch
                        checked={contact.marketingConsent}
                        onCheckedChange={(checked) => {
                          // Previeni la propagazione del click al dialog
                          setTimeout(() => {
                            updateContactPreferences(contact.id, checked)
                          }, 0)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </div>

                  {/* Statistiche interazioni */}
                  <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-[#1B9AAA]">
                        {contact.interactionCount || 0}
                      </p>
                      <p className="text-xs text-gray-500">Interazioni</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">
                        {contact.receivedCampaigns || 0}
                      </p>
                      <p className="text-xs text-gray-500">Campagne ricevute</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/mascottes/mascotte_nodata.png"
                    alt="No Data Mascot"
                    width={120}
                    height={120}
                    className="drop-shadow-lg"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Nessun contatto trovato</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedCountryCode || consentFilter !== "all"
                    ? "Prova a modificare i filtri di ricerca"
                    : "Non hai ancora contatti nella rubrica"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fixed Action Buttons */}
        {!isLoading && !error && (
          <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center gap-3 px-4">
            <CustomButton
              className="py-3 px-6 shadow-lg flex items-center justify-center"
              onClick={() => router.push("/contacts/import")}
              variant="outline"
            >
              <Users className="w-5 h-5 mr-2" /> Importa Contatti
            </CustomButton>
            
            <CustomButton
              className="py-3 px-6 shadow-lg flex items-center justify-center"
              onClick={() => router.push("/campaign/create")}
            >
              <Mail className="w-5 h-5 mr-2" /> Crea Campagna
            </CustomButton>
          </div>
        )}

        {/* Dialog per gestione singolo contatto */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="w-full max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-6 h-6 text-[#1B9AAA]" />
                Gestione Privacy
              </DialogTitle>
              <DialogDescription>
                {selectedContact && (
                  <>
                    Gestisci le preferenze privacy per <strong>{selectedContact.name}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedContact && (
              <div className="space-y-6">
                {/* Informazioni contatto */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center text-white font-bold">
                      {selectedContact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{selectedContact.name}</h3>
                      <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                      {selectedContact.email && (
                        <p className="text-sm text-gray-600">{selectedContact.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Paese</p>
                      <p className="font-medium">
                        {countryCodes.find(c => c.code === selectedContact.countryCode)?.flag || "🌍"} {selectedContact.countryCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lingua</p>
                      <p className="font-medium">{selectedContact.language || "Non specificata"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Interazioni</p>
                      <p className="font-medium">{selectedContact.interactionCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Campagne ricevute</p>
                      <p className="font-medium">{selectedContact.receivedCampaigns || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Gestione consenso marketing */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Campagne Marketing</p>
                        <p className="text-sm text-gray-600">
                          {selectedContact.marketingConsent 
                            ? "Può ricevere campagne promozionali"
                            : "Non riceve campagne promozionali"
                          }
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedContact.marketingConsent}
                      onCheckedChange={(checked) => updateContactPreferences(selectedContact.id, checked)}
                      disabled={isUpdatingContact}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  {/* Informazioni opt-out */}
                  {!selectedContact.marketingConsent && selectedContact.optOutDate && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <UserX className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Opt-out attivo</p>
                          <p className="text-sm text-red-600">
                            Data opt-out: {formatDate(selectedContact.optOutDate)}
                          </p>
                          {selectedContact.optOutReason && (
                            <p className="text-sm text-red-600">
                              Motivo: {selectedContact.optOutReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informazioni consenso */}
                  {selectedContact.marketingConsent && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <UserCheck className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Consenso attivo</p>
                          <p className="text-sm text-green-600">
                            Il contatto può ricevere campagne marketing e comunicazioni promozionali
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <CustomButton
                variant="outline"
                onClick={() => setShowContactDialog(false)}
                className="w-full"
                disabled={isUpdatingContact}
              >
                {isUpdatingContact ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aggiornamento...
                  </>
                ) : (
                  "Chiudi"
                )}
              </CustomButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
} 