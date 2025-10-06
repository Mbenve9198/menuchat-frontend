"use client"

import { motion } from "framer-motion"
import { 
  TrendingDown, 
  MapPin, 
  Star, 
  Users, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  Trophy
} from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
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

  // Determina il colore e l'emoji in base al rank
  const getRankInfo = (rank: number | string) => {
    if (typeof rank !== 'number') return { color: 'from-red-500 to-orange-500', emoji: '😰', textColor: 'text-red-600' }
    if (rank <= 3) return { color: 'from-green-400 to-emerald-500', emoji: '🎉', textColor: 'text-green-600' }
    if (rank <= 7) return { color: 'from-yellow-400 to-orange-400', emoji: '😐', textColor: 'text-yellow-600' }
    return { color: 'from-orange-500 to-red-500', emoji: '😟', textColor: 'text-red-600' }
  }

  const rankInfo = getRankInfo(userRestaurant.rank)

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header con bottone nuova ricerca */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-[#1B9AAA]">I tuoi risultati</h2>
          <p className="text-sm text-gray-600">Ricerca: "{keyword}"</p>
        </div>
        <button
          onClick={onNewSearch}
          className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <RefreshCw className="w-5 h-5 text-[#1B9AAA]" />
        </button>
      </div>

      {/* Il Verdetto - Card Principale */}
      <motion.div
        className={`bg-gradient-to-br ${rankInfo.color} rounded-3xl p-6 shadow-2xl text-white`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <div className="text-center">
          <motion.div
            className="text-6xl mb-3"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            {rankInfo.emoji}
          </motion.div>
          <p className="text-sm font-bold uppercase tracking-wide opacity-90 mb-2">
            La tua posizione
          </p>
          <h3 className="text-5xl font-black mb-3">
            {typeof userRestaurant.rank === 'number' ? `#${userRestaurant.rank}` : userRestaurant.rank}
          </h3>
          <p className="text-white/90 text-base mb-2">
            per "{keyword}"
          </p>
          {userRestaurant.address && (
            <p className="text-white/80 text-xs flex items-center justify-center gap-1 mt-2">
              <MapPin className="w-3 h-3" />
              {userRestaurant.address}
            </p>
          )}
        </div>
      </motion.div>

      {/* Messaggio di analisi */}
      <motion.div
        className="bg-white rounded-3xl p-5 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 mb-1">Cosa significa?</h4>
            <p className="text-sm text-gray-600">{analysis.message}</p>
          </div>
        </div>
      </motion.div>

      {/* Statistiche Impatto */}
      <div className="grid grid-cols-2 gap-3">
        {/* Competitor davanti */}
        <motion.div
          className="bg-white rounded-3xl p-4 shadow-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-3xl font-black text-[#EF476F] mb-1">
              {analysis.competitorsAhead}
            </p>
            <p className="text-xs text-gray-600 font-medium">
              Competitor davanti
            </p>
          </div>
        </motion.div>

        {/* Clienti persi */}
        <motion.div
          className="bg-white rounded-3xl p-4 shadow-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📉</div>
            <p className="text-3xl font-black text-[#EF476F] mb-1">
              ~{analysis.estimatedLostCustomers}
            </p>
            <p className="text-xs text-gray-600 font-medium">
              Coperti persi/sett.
            </p>
          </div>
        </motion.div>
      </div>

      {/* La Mappa */}
      <motion.div
        className="bg-white rounded-3xl p-5 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">🗺️</div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Mappa Competitor</h3>
            <p className="text-xs text-gray-600">Dove appari vs i tuoi concorrenti</p>
          </div>
        </div>
        <RankingMap
          userRestaurant={userRestaurant}
          competitors={competitors}
        />
      </motion.div>

      {/* Lista Competitor */}
      {competitors.length > 0 && (
        <motion.div
          className="bg-white rounded-3xl p-5 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Principali Competitor</h3>
              <p className="text-xs text-gray-600">Chi appare prima di te</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {competitors.map((competitor, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#EF476F] to-[#1B9AAA] text-white flex items-center justify-center font-bold text-sm">
                  #{competitor.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-800 truncate">
                    {competitor.name}
                  </h4>
                  {competitor.address && (
                    <p className="text-xs text-gray-500 truncate">
                      {competitor.address}
                    </p>
                  )}
                </div>
                {competitor.rating && (
                  <div className="flex-shrink-0 flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-200">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-900">
                      {competitor.rating}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA Finale - La Soluzione */}
      <motion.div
        className="bg-gradient-to-br from-[#1B9AAA] via-[#06D6A0] to-[#1B9AAA] rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {/* Decorazioni di sfondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl translate-y-16 -translate-x-16" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-4 w-fit mx-auto">
            <Zap className="w-4 h-4" />
            La Soluzione
          </div>
          
          <h2 className="text-2xl font-black text-center mb-3">
            Scala la Classifica.<br/>In Automatico.
          </h2>
          
          <p className="text-sm text-white/90 text-center mb-5 leading-relaxed">
            Il nostro software automatizza la raccolta di recensioni positive, 
            aiutandoti a migliorare il ranking e ad attirare più clienti.
          </p>

          {/* Benefici chiave */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-xl">⭐</div>
              <div>
                <p className="text-xs font-bold">Più Recensioni</p>
                <p className="text-xs opacity-80">Sistema automatico via WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-xl">📈</div>
              <div>
                <p className="text-xs font-bold">Ranking Migliore</p>
                <p className="text-xs opacity-80">Scala le posizioni su Google</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <div className="text-xl">💰</div>
              <div>
                <p className="text-xs font-bold">Più Clienti</p>
                <p className="text-xs opacity-80">Aumenta la tua visibilità</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <CustomButton
            onClick={() => {
              window.location.href = '/auth/login'
            }}
            className="w-full h-14 text-base font-black bg-white text-[#1B9AAA] hover:bg-gray-50 shadow-xl"
          >
            <span className="flex items-center gap-2">
              ATTIVA PROVA GRATUITA
              <ArrowRight className="w-5 h-5" />
            </span>
          </CustomButton>
          
          <p className="text-xs text-white/70 text-center mt-3">
            Nessuna carta di credito • Setup in 5 minuti
          </p>
        </div>
      </motion.div>
    </div>
  )
}
