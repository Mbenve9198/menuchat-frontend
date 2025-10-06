"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, TrendingUp, AlertCircle, Star, Users, Trophy, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { RestaurantAutocomplete } from "@/components/rank-checker/restaurant-autocomplete"
import { RankingResults } from "@/components/rank-checker/ranking-results"

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
  "ristorante",
  "pizzeria",
  "trattoria",
  "sushi",
  "ristorante di pesce",
  "steakhouse",
  "osteria",
  "bistrot"
]

const LOADING_MESSAGES = [
  "Stiamo interrogando Google Maps nella tua zona...",
  "Identificando i tuoi principali concorrenti...",
  "Calcolando il tuo posizionamento...",
  "Analizzando i risultati..."
]

export default function RankCheckerPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [keyword, setKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const { toast } = useToast()

  const isFormValid = selectedRestaurant && keyword.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid || !selectedRestaurant) return

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
        setRankingData(data)
        
        // Scroll smooth alla sezione risultati dopo un breve delay
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8" />
            <h1 className="text-2xl md:text-3xl font-bold">
              Rank Checker Google Maps
            </h1>
          </div>
          <p className="text-purple-100 text-sm md:text-base">
            Strumento gratuito per ristoratori
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Sezione Input */}
        <AnimatePresence mode="wait">
          {!rankingData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="space-y-4 pb-8">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                      I tuoi clienti ti trovano su Google?
                    </CardTitle>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                      O trovano i tuoi concorrenti?
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base md:text-lg text-gray-600">
                    Scoprilo in 30 secondi con il nostro tool gratuito.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo Autocomplete Ristorante */}
                    <div className="space-y-2">
                      <Label htmlFor="restaurant" className="text-base font-semibold text-gray-700">
                        Nome del tuo ristorante
                      </Label>
                      <RestaurantAutocomplete
                        onSelect={setSelectedRestaurant}
                        selectedRestaurant={selectedRestaurant}
                      />
                    </div>

                    {/* Campo Keyword */}
                    <div className="space-y-3">
                      <Label htmlFor="keyword" className="text-base font-semibold text-gray-700">
                        Parola chiave (es. pizzeria, sushi)
                      </Label>
                      <Input
                        id="keyword"
                        type="text"
                        placeholder="Inserisci una parola chiave..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="h-12 text-base rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      
                      {/* Tag suggerimenti */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {KEYWORD_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setKeyword(suggestion)}
                            className="px-3 py-1.5 text-sm rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors border border-purple-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pulsante CTA */}
                    <Button
                      type="submit"
                      disabled={!isFormValid || isLoading}
                      className="w-full h-14 text-base md:text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analisi in corso...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search className="w-5 h-5" />
                          ANALIZZA LA MIA VISIBILITÀ ORA
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Stato di caricamento animato */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <motion.p
                                key={loadingMessageIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-gray-700 font-medium"
                              >
                                {LOADING_MESSAGES[loadingMessageIndex]}
                              </motion.p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sezione Risultati */}
        {rankingData && (
          <div id="results-section">
            <RankingResults 
              data={rankingData}
              keyword={keyword}
              onNewSearch={() => {
                setRankingData(null)
                setSelectedRestaurant(null)
                setKeyword("")
              }}
            />
          </div>
        )}

        {/* Benefici (visibili solo quando non ci sono risultati) */}
        {!rankingData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <Card className="border-purple-100">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Analisi Istantanea</h3>
                <p className="text-gray-600 text-sm">
                  Scopri in pochi secondi dove appari nelle ricerche Google Maps
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Confronto Competitor</h3>
                <p className="text-gray-600 text-sm">
                  Vedi chi ti precede e quanti clienti potenziali stai perdendo
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Soluzione Pratica</h3>
                <p className="text-gray-600 text-sm">
                  Ricevi consigli concreti per scalare la classifica
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

