"use client"

import { motion } from "framer-motion"
import { 
  Trophy, 
  TrendingDown, 
  MapPin, 
  Star, 
  Users, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Target,
  Zap
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RankingMap } from "./ranking-map"

interface RankingResultsProps {
  data: {
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
  keyword: string
  onNewSearch: () => void
}

export function RankingResults({ data, keyword, onNewSearch }: RankingResultsProps) {
  const { userRestaurant, competitors, analysis } = data
  const rank = typeof userRestaurant.rank === 'number' ? userRestaurant.rank : 21

  // Determina il colore in base al rank
  const getRankColor = (rank: number | string) => {
    if (typeof rank !== 'number') return 'text-red-600'
    if (rank <= 3) return 'text-green-600'
    if (rank <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRankBgColor = (rank: number | string) => {
    if (typeof rank !== 'number') return 'from-red-500 to-red-600'
    if (rank <= 3) return 'from-green-500 to-emerald-600'
    if (rank <= 7) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header con bottone nuova ricerca */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risultati dell'Analisi</h2>
          <p className="text-gray-600 mt-1">Ricerca per "{keyword}"</p>
        </div>
        <Button
          onClick={onNewSearch}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Nuova Ricerca
        </Button>
      </div>

      {/* Il Verdetto - Ranking principale */}
      <Card className={`border-0 shadow-2xl bg-gradient-to-br ${getRankBgColor(userRestaurant.rank)} text-white overflow-hidden`}>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <p className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-2">
                Il tuo Posizionamento
              </p>
              <h3 className="text-4xl md:text-5xl font-black mb-3">
                {typeof userRestaurant.rank === 'number' ? `#${userRestaurant.rank}` : userRestaurant.rank}
              </h3>
              <p className="text-white/90 text-lg mb-2">
                per la ricerca "{keyword}"
              </p>
              {userRestaurant.address && (
                <p className="text-white/80 text-sm flex items-center justify-center md:justify-start gap-1 mt-2">
                  <MapPin className="w-4 h-4" />
                  {userRestaurant.address}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messaggio di analisi */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">Analisi della Situazione</h4>
              <p className="text-gray-700">{analysis.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* La Mappa Interattiva */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Mappa dei Competitor
          </CardTitle>
          <CardDescription>
            Visualizza la tua posizione rispetto ai concorrenti nella zona
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RankingMap
            userRestaurant={userRestaurant}
            competitors={competitors}
          />
        </CardContent>
      </Card>

      {/* Statistiche Impatto */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Competitor che ti precedono */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-800 uppercase tracking-wide mb-1">
                  Competitor Davanti a Te
                </p>
                <p className="text-4xl font-black text-orange-900 mb-2">
                  {analysis.competitorsAhead}
                </p>
                <p className="text-sm text-orange-700">
                  Ristoranti che i tuoi clienti vedono prima di te
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clienti persi */}
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 uppercase tracking-wide mb-1">
                  Coperti Persi (Stima)
                </p>
                <p className="text-4xl font-black text-red-900 mb-2">
                  ~{analysis.estimatedLostCustomers}
                </p>
                <p className="text-sm text-red-700">
                  Clienti potenziali a settimana che scegliendo competitor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista Competitor */}
      {competitors.length > 0 && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              I Tuoi Principali Competitor
            </CardTitle>
            <CardDescription>
              Questi ristoranti appaiono prima di te nelle ricerche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {competitors.map((competitor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-bold">
                    #{competitor.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">
                      {competitor.name}
                    </h4>
                    {competitor.address && (
                      <p className="text-sm text-gray-600 truncate flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {competitor.address}
                      </p>
                    )}
                    {competitor.type && (
                      <p className="text-xs text-gray-500 mt-1">
                        {competitor.type}
                      </p>
                    )}
                  </div>
                  {competitor.rating && (
                    <div className="flex-shrink-0 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {competitor.rating}
                      </span>
                      {competitor.reviews && (
                        <span className="text-xs text-gray-500">
                          ({competitor.reviews})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Finale - La Soluzione */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 text-white overflow-hidden relative">
        {/* Decorazioni di sfondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-32 -translate-x-32" />
        </div>
        
        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
              <Zap className="w-4 h-4" />
              La Soluzione per Te
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black">
              Scala la Classifica. In Automatico.
            </h2>
            
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Il nostro software automatizza la raccolta di recensioni positive dai tuoi clienti soddisfatti, 
              aiutandoti a migliorare il tuo ranking su Google Maps e ad attirare più clienti.
            </p>

            {/* Benefici chiave */}
            <div className="grid md:grid-cols-3 gap-4 pt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle2 className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold mb-1">Più Recensioni</h3>
                <p className="text-sm text-white/80">Sistema automatico via WhatsApp</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle2 className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold mb-1">Ranking Migliore</h3>
                <p className="text-sm text-white/80">Scala le posizioni su Google</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle2 className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold mb-1">Più Clienti</h3>
                <p className="text-sm text-white/80">Aumenta la tua visibilità</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-gray-100 text-lg font-bold h-14 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all gap-2 group"
                onClick={() => {
                  // Redirect alla pagina di registrazione/prova gratuita
                  window.location.href = '/auth/login'
                }}
              >
                ATTIVA LA TUA PROVA GRATUITA
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-white/70 mt-3">
                Nessuna carta di credito richiesta • Setup in 5 minuti
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
