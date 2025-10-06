"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, TrendingDown, Zap, Sparkles, Loader2, ArrowRight, RefreshCw } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { useToast } from "@/hooks/use-toast"
import { RestaurantAutocomplete } from "@/components/rank-checker/restaurant-autocomplete"
import { RankingResults } from "@/components/rank-checker/ranking-results"
import { LeadCaptureForm } from "@/components/rank-checker/lead-capture-form"
import Image from "next/image"

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

export default function RankCheckerPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [keyword, setKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [pendingRankingData, setPendingRankingData] = useState<RankingData | null>(null)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const { toast } = useToast()

  const isFormValid = selectedRestaurant && keyword.trim().length > 0

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

  const handleLeadSubmit = (email: string, phone: string) => {
    // Salva email e telefono
    setUserEmail(email)
    setUserPhone(phone)
    
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

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 pb-24">
        {/* Header con mascotte */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-[#1B9AAA] mb-1">
                🗺️ Rank Checker
              </h1>
              <p className="text-lg text-gray-700">
                I tuoi clienti ti trovano su Google?
              </p>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-24 h-24"
            >
              <Image
                src="/mascottes/mascotte_rock.png"
                alt="Mascot"
                width={96}
                height={96}
                className="drop-shadow-2xl object-contain"
              />
            </motion.div>
          </div>
        </div>

        {/* Sezione Input */}
        <AnimatePresence mode="wait">
          {!rankingData && (
            <motion.div
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-3xl p-5 shadow-xl mb-6">
                <div className="space-y-2 mb-6">
                  <h2 className="text-xl font-extrabold text-gray-800">
                    Scopri la tua posizione
                  </h2>
                  <p className="text-sm text-gray-600">
                    Analisi gratuita in 30 secondi ⚡
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                    <div className="flex flex-wrap gap-2">
                      {KEYWORD_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion.text}
                          type="button"
                          onClick={() => setKeyword(suggestion.text)}
                          className="px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 text-gray-700 hover:from-[#1B9AAA]/20 hover:to-[#06D6A0]/20 border border-[#1B9AAA]/20 transition-all"
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
                    className="w-full h-14 text-base font-extrabold"
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
            />
          </div>
        )}

        {/* Sezione Risultati (appare dopo aver compilato il form lead) */}
        {rankingData && !showLeadForm && (
          <div id="results-section">
            <RankingResults 
              data={rankingData}
              keyword={keyword}
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

        {/* Benefici (visibili solo quando non ci sono risultati e non c'è il form lead) */}
        {!rankingData && !isLoading && !showLeadForm && (
          <div className="w-full max-w-md space-y-4">
            <motion.div
              className="bg-white rounded-3xl p-5 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚡</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Analisi Istantanea
                  </h3>
                  <p className="text-sm text-gray-600">
                    Scopri in pochi secondi dove appari nelle ricerche Google Maps
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-3xl p-5 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">👥</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Confronto Competitor
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vedi chi ti precede e quanti clienti potenziali stai perdendo
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-3xl p-5 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">🚀</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Soluzione Pratica
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ricevi consigli concreti per scalare la classifica
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}

