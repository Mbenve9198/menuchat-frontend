"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, TrendingDown, Zap, Sparkles, Loader2, ArrowRight, RefreshCw } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { useToast } from "@/hooks/use-toast"
import { RestaurantAutocomplete } from "@/components/rank-checker/restaurant-autocomplete"
import { RankingResults } from "@/components/rank-checker/ranking-results"
import { LeadCaptureForm } from "@/components/rank-checker/lead-capture-form"

interface Restaurant {
  id: string
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
}

interface RankingData {
  userRestaurant: {
    name: string
    rank: number | string
    coordinates: { lat: number; lng: number }
    rating?: number
    reviews?: number
    address?: string
  }
  competitors: Array<{
    name: string
    rank: number
    coordinates: { lat: number; lng: number }
    rating?: number
    reviews?: number
    address?: string
    type?: string
  }>
  analysis: {
    competitorsAhead: number
    estimatedLostCustomers: number
    message: string
    totalResultsFound?: number
  }
}

const KEYWORD_SUGGESTIONS = [
  { text: "ristorante", emoji: "🍽️" },
  { text: "pizzeria", emoji: "🍕" },
  { text: "trattoria", emoji: "🍝" },
  { text: "sushi", emoji: "🍣" },
  { text: "ristorante di pesce", emoji: "🐟" },
  { text: "steakhouse", emoji: "🥩" },
]

const LOADING_MESSAGES = [
  { text: "Stiamo interrogando Google Maps nella tua zona...", emoji: "🗺️" },
  { text: "Identificando i tuoi principali concorrenti...", emoji: "🔍" },
  { text: "Calcolando il tuo posizionamento...", emoji: "📊" },
  { text: "Analizzando i risultati...", emoji: "⚡" }
]

const BENEFITS = [
  { emoji: "⚡", title: "Analisi Istantanea", description: "Scopri dove appari nelle ricerche Google Maps" },
  { emoji: "👥", title: "Confronto Competitor", description: "Vedi chi ti precede e quanti clienti perdi" },
  { emoji: "🚀", title: "Soluzione Pratica", description: "Ricevi consigli per scalare la classifica" }
]

export default function RankCheckerPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [keyword, setKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLead, setIsLoadingLead] = useState(false) // Nuovo stato per salvataggio lead
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [pendingRankingData, setPendingRankingData] = useState<RankingData | null>(null)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [currentBenefitIndex, setCurrentBenefitIndex] = useState(0)
  const [showEmailRecovery, setShowEmailRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [isRecovering, setIsRecovering] = useState(false)
  const { toast } = useToast()

  const isFormValid = selectedRestaurant && keyword.trim().length > 0

  // Recupera risultati automaticamente se c'è un token nell'URL (solo client-side)
  useEffect(() => {
    // Usa window.location solo sul client
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const showAudit = urlParams.get('showAudit')
      
      if (token) {
        recoverResultsFromToken(token, showAudit === 'true')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid || !selectedRestaurant) return

    // Validazione delle coordinate
    if (!selectedRestaurant.location || !selectedRestaurant.location.lat || !selectedRestaurant.location.lng) {
      toast({
        title: "Errore",
        description: "Il ristorante selezionato non ha coordinate valide. Riprova con un altro.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setLoadingMessageIndex(0)
    setRankingData(null)

    // Cicla i messaggi di caricamento
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2500)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantName: selectedRestaurant.name,
          placeId: selectedRestaurant.id,
          latitude: selectedRestaurant.location.lat,
          longitude: selectedRestaurant.location.lng,
          keyword: keyword.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'analisi')
      }

      if (data.success) {
        // Salva i dati in attesa e mostra il form per la lead
        setPendingRankingData(data)
        setShowLeadForm(true)
        
        // Scroll smooth al form dopo un breve delay
        setTimeout(() => {
          document.getElementById('lead-form-section')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }, 300)
      } else {
        throw new Error(data.error || 'Errore durante l\'analisi')
      }

    } catch (error) {
      console.error('Errore:', error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive"
      })
    } finally {
      clearInterval(messageInterval)
      setIsLoading(false)
    }
  }

  const handleLeadSubmit = async (email: string, phone: string) => {
    // Salva email e telefono
    setUserEmail(email)
    setUserPhone(phone)
    setIsLoadingLead(true) // Inizia loading
    
    try {
      // Salva il lead con TUTTI i risultati nel backend
      // NOTA: Questo include generazione e invio Email #1 SOAP OPERA (~3-5 secondi)
      if (pendingRankingData && selectedRestaurant) {
        console.log('📧 Salvataggio lead e generazione Email #1...')
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker-leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            phone,
            restaurantName: selectedRestaurant.name,
            placeId: selectedRestaurant.id,
            keyword,
            rankingResults: pendingRankingData  // Salva TUTTI i dati!
          })
        })

        if (response.ok) {
          const data = await response.json()
          // Salva il token in localStorage per recuperare i risultati
          if (data.accessToken) {
            localStorage.setItem('rank_checker_token', data.accessToken)
            localStorage.setItem('rank_checker_last_email', email)
            console.log('✅ Lead salvato e Email #1 inviata, token:', data.accessToken)
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Errore salvataggio lead (non bloccante):', error)
      // Non bloccare il flusso anche se il salvataggio fallisce
    } finally {
      setIsLoadingLead(false) // Fine loading
    }
    
    // Trasferisci i dati pending ai risultati finali
    setRankingData(pendingRankingData)
    setShowLeadForm(false)
    
    // Scroll ai risultati
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  // Animazione automatica delle card benefici
  useEffect(() => {
    // Alterna le card solo quando non ci sono risultati e non è in loading
    if (!rankingData && !isLoading && !showLeadForm) {
      const interval = setInterval(() => {
        setCurrentBenefitIndex((prev) => (prev + 1) % BENEFITS.length)
      }, 3000) // Cambia ogni 3 secondi

      return () => clearInterval(interval)
    }
  }, [rankingData, isLoading, showLeadForm])

  // Recupera risultati usando un token
  const recoverResultsFromToken = async (token: string, shouldShowAudit: boolean = false) => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker-leads/results/${token}`
      )

      const data = await response.json()

      if (data.success && data.data) {
        const leadData = data.data
        
        // Crea un oggetto restaurant dal placeId salvato
        const restaurant: Restaurant = {
          id: leadData.placeId,
          name: leadData.restaurantName,
          address: leadData.rankingResults?.userRestaurant?.address || '',
          location: {
            lat: leadData.rankingResults?.userRestaurant?.coordinates?.lat || 0,
            lng: leadData.rankingResults?.userRestaurant?.coordinates?.lng || 0
          }
        }
        
        // Ripristina tutto lo stato
        setSelectedRestaurant(restaurant)
        setKeyword(leadData.keyword)
        setUserEmail(leadData.email)
        setUserPhone(leadData.phone)
        
        // MOSTRA DIRETTAMENTE I RISULTATI SALVATI (no rianalisi!)
        setRankingData(leadData.rankingResults)
        setShowLeadForm(false)
        
        // 🆕 Se showAudit=true, recupera anche l'audit GMB
        if (shouldShowAudit) {
          console.log('🔍 Recupero GMB Audit...')
          
          try {
            const auditResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker/gmb-audit/${token}`
            )
            const auditData = await auditResponse.json()
            
            if (auditData.success && auditData.status === 'completed' && auditData.audit) {
              console.log('✅ GMB Audit recuperato!')
              // Passa i dati audit a RankingResults (lo faremo tramite prop)
              // Per ora salviamo in localStorage
              localStorage.setItem('gmb_audit_data', JSON.stringify(auditData.audit))
            }
          } catch (auditError) {
            console.error('⚠️ Errore recupero audit:', auditError)
          }
        }
        
        toast({
          title: shouldShowAudit ? "Analisi GMB Completata! 🎉" : "Bentornato! 👋",
          description: shouldShowAudit 
            ? `Ecco la tua Analisi GMB completa` 
            : `Ecco i risultati di ${leadData.restaurantName}`,
        })
        
        // Scroll ai risultati dopo un attimo
        setTimeout(() => {
          const targetId = shouldShowAudit ? 'gmb-report-section' : 'results-section'
          document.getElementById(targetId)?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }, 500)
        
      } else {
        toast({
          title: "Token non valido",
          description: "Il link è scaduto o non valido.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Errore:', error)
      toast({
        title: "Errore",
        description: "Impossibile recuperare i risultati.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Funzione per recuperare risultati usando email
  const handleEmailRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recoveryEmail.includes('@')) {
      toast({
        title: "Errore",
        description: "Inserisci un'email valida",
        variant: "destructive"
      })
      return
    }

    setIsRecovering(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker-leads/check/${encodeURIComponent(recoveryEmail)}`
      )

      const data = await response.json()

      if (data.found && data.accessToken) {
        // Salva il token e ricarica la pagina con il token
        localStorage.setItem('rank_checker_token', data.accessToken)
        window.location.href = `/rank-checker?token=${data.accessToken}`
      } else {
        toast({
          title: "Nessun risultato trovato",
          description: "Non abbiamo trovato analisi recenti per questa email.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Errore:', error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive"
      })
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen w-full max-w-full px-3 sm:px-4 py-8 pb-32 overflow-x-hidden">
        {/* Hero Header Centrato */}
        {!rankingData && !showLeadForm && (
          <div className="w-full max-w-2xl mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <div className="text-4xl sm:text-5xl mb-4">🗺️</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight">
                I tuoi clienti ti trovano su Google?
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
                O trovano i tuoi <span className="text-[#EF476F]">concorrenti</span>?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto">
                Scoprilo in <span className="font-bold text-[#1B9AAA]">30 secondi</span> con il nostro tool <span className="font-bold">100% gratuito</span>
              </p>
            </motion.div>
          </div>
        )}

        {/* Sezione Input */}
        <AnimatePresence mode="wait">
          {!rankingData && !showLeadForm && (
            <motion.div
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl mb-6">

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Campo Autocomplete Ristorante */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🏪</span>
                      Nome del tuo ristorante
                    </label>
                    <RestaurantAutocomplete
                      onSelect={setSelectedRestaurant}
                      selectedRestaurant={selectedRestaurant}
                    />
                  </div>

                  {/* Campo Keyword */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🔍</span>
                      Parola chiave
                    </label>
                    <input
                      type="text"
                      placeholder="es. pizzeria, sushi..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1B9AAA] focus:ring-2 focus:ring-[#1B9AAA]/20 outline-none transition"
                    />
                    
                    {/* Tag suggerimenti */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {KEYWORD_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion.text}
                          type="button"
                          onClick={() => setKeyword(suggestion.text)}
                          className="px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 text-gray-700 hover:from-[#1B9AAA]/20 hover:to-[#06D6A0]/20 border border-[#1B9AAA]/20 transition-all whitespace-nowrap"
                        >
                          {suggestion.emoji} {suggestion.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pulsante CTA */}
                  <CustomButton
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full h-12 sm:h-14 text-sm sm:text-base font-extrabold"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analisi in corso...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        ANALIZZA ORA
                      </span>
                    )}
                  </CustomButton>
                </form>

                {/* Link recupero risultati */}
                {!isLoading && (
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEmailRecovery(!showEmailRecovery)}
                      className="w-full text-center text-sm font-medium text-[#1B9AAA] hover:text-[#06D6A0] transition-colors"
                    >
                      {showEmailRecovery ? '← Torna alla ricerca' : '🔍 Hai già fatto l\'analisi? Recupera i tuoi risultati'}
                    </button>

                    <AnimatePresence>
                      {showEmailRecovery && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-4"
                        >
                          <form onSubmit={handleEmailRecovery} className="space-y-3">
                            <input
                              type="email"
                              placeholder="Inserisci la tua email..."
                              value={recoveryEmail}
                              onChange={(e) => setRecoveryEmail(e.target.value)}
                              className="w-full h-10 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1B9AAA] focus:ring-2 focus:ring-[#1B9AAA]/20 outline-none transition"
                            />
                            <CustomButton
                              type="submit"
                              disabled={isRecovering || !recoveryEmail.includes('@')}
                              className="w-full h-10 text-sm font-bold"
                            >
                              {isRecovering ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Ricerca...
                                </span>
                              ) : (
                                'Recupera Risultati'
                              )}
                            </CustomButton>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Stato di caricamento animato */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-[#1B9AAA]/5 to-[#06D6A0]/5 rounded-2xl p-4 border-2 border-[#1B9AAA]/10">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="text-3xl"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {LOADING_MESSAGES[loadingMessageIndex].emoji}
                          </motion.div>
                          <motion.p
                            key={loadingMessageIndex}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-sm font-medium text-gray-700"
                          >
                            {LOADING_MESSAGES[loadingMessageIndex].text}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Lead Capture (appare dopo l'analisi, prima dei risultati) */}
        {showLeadForm && pendingRankingData && selectedRestaurant && (
          <div id="lead-form-section" className="w-full max-w-md">
            <LeadCaptureForm
              onSubmit={handleLeadSubmit}
              restaurantName={selectedRestaurant.name}
              isLoading={isLoadingLead}
            />
          </div>
        )}

        {/* Sezione Risultati (appare dopo aver compilato il form lead) */}
        {rankingData && !showLeadForm && selectedRestaurant && (
          <div id="results-section" className="w-full max-w-md">
            <RankingResults 
              data={rankingData}
              keyword={keyword}
              placeId={selectedRestaurant.id}
              onNewSearch={() => {
                setRankingData(null)
                setPendingRankingData(null)
                setShowLeadForm(false)
                setSelectedRestaurant(null)
                setKeyword("")
                setUserEmail("")
                setUserPhone("")
              }}
            />
          </div>
        )}

        {/* Card Benefici Animata Fixata in Basso (visibile solo nella landing page) */}
        {!rankingData && !isLoading && !showLeadForm && (
          <div className="fixed bottom-0 left-0 right-0 z-30 pb-4 px-3 sm:px-4">
            <div className="max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBenefitIndex}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-[#1B9AAA]/20"
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="text-4xl sm:text-5xl flex-shrink-0"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {BENEFITS[currentBenefitIndex].emoji}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1">
                        {BENEFITS[currentBenefitIndex].title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-snug">
                        {BENEFITS[currentBenefitIndex].description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Indicatori */}
                  <div className="flex justify-center gap-2 mt-4">
                    {BENEFITS.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentBenefitIndex 
                            ? 'w-8 bg-[#1B9AAA]' 
                            : 'w-1.5 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

