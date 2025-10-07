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
  Trophy,
  Sparkles
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

  // Verifica se le coordinate sono valide per mostrare la mappa
  const hasValidCoordinates = userRestaurant.coordinates && 
    typeof userRestaurant.coordinates.lat === 'number' && 
    typeof userRestaurant.coordinates.lng === 'number' &&
    !isNaN(userRestaurant.coordinates.lat) &&
    !isNaN(userRestaurant.coordinates.lng)

  // Log per debug
  console.log('Coordinates check:', {
    coordinates: userRestaurant.coordinates,
    hasValidCoordinates,
    lat: userRestaurant.coordinates?.lat,
    lng: userRestaurant.coordinates?.lng,
    latType: typeof userRestaurant.coordinates?.lat,
    lngType: typeof userRestaurant.coordinates?.lng
  })

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Hero dei Risultati - Centrato e Impattante */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
      >
        <button
          onClick={onNewSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all mb-4 text-sm font-medium text-gray-700"
        >
          <RefreshCw className="w-4 h-4 text-[#1B9AAA]" />
          Nuova Ricerca
        </button>
        
        <motion.div
          className="text-6xl sm:text-7xl md:text-8xl mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 0.6, repeat: 2 }}
        >
          {rankInfo.emoji}
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-3 leading-tight">
          {typeof userRestaurant.rank === 'number' ? `#${userRestaurant.rank}` : userRestaurant.rank}
        </h1>
        
        <div className={`inline-block px-6 py-3 rounded-2xl ${
          typeof userRestaurant.rank === 'number' && userRestaurant.rank <= 3
            ? 'bg-green-100'
            : typeof userRestaurant.rank === 'number' && userRestaurant.rank <= 7
            ? 'bg-yellow-100'
            : 'bg-red-100'
        } mb-4`}>
          <p className={`text-base sm:text-lg font-black ${rankInfo.textColor}`}>
            {analysis.message}
          </p>
        </div>
        
        <p className="text-sm sm:text-base text-gray-600 mb-2">
          Ricerca: "<span className="font-bold">{keyword}</span>"
        </p>
        
        {userRestaurant.address && (
          <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[300px]">{userRestaurant.address}</span>
          </p>
        )}
      </motion.div>

      {/* Statistiche Impatto */}
      <motion.div 
        className="grid grid-cols-2 gap-2 sm:gap-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        {/* Competitor davanti */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl">
          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">👥</div>
            <p className="text-2xl sm:text-3xl font-black text-[#EF476F] mb-1">
              {analysis.competitorsAhead}
            </p>
            <p className="text-xs text-gray-600 font-medium leading-tight">
              Competitor davanti
            </p>
          </div>
        </div>

        {/* Clienti persi */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl">
          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📉</div>
            <p className="text-2xl sm:text-3xl font-black text-[#EF476F] mb-1">
              ~{analysis.estimatedLostCustomers}
            </p>
            <p className="text-xs text-gray-600 font-medium leading-tight">
              Coperti persi/sett.
            </p>
          </div>
        </div>
      </motion.div>

      {/* La Mappa */}
      {hasValidCoordinates ? (
        <motion.div
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="text-xl sm:text-2xl flex-shrink-0">🗺️</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">Mappa Competitor</h3>
              <p className="text-xs text-gray-600">Dove appari vs i tuoi concorrenti</p>
            </div>
          </div>
          <RankingMap
            userRestaurant={userRestaurant}
            competitors={competitors}
          />
        </motion.div>
      ) : (
        <motion.div
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-xl sm:text-2xl flex-shrink-0">⚠️</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Mappa non disponibile</h3>
              <p className="text-xs text-gray-600">Le coordinate del ristorante non sono valide</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lista Competitor */}
      {competitors.length > 0 && (
        <motion.div
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="text-xl sm:text-2xl flex-shrink-0">⚠️</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">Principali Competitor</h3>
              <p className="text-xs text-gray-600">Chi appare prima di te</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {competitors.map((competitor, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#EF476F] to-[#1B9AAA] text-white flex items-center justify-center font-bold text-xs sm:text-sm">
                  #{competitor.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-800 truncate">
                    {competitor.name}
                  </h4>
                  {competitor.address && (
                    <p className="text-xs text-gray-500 truncate">
                      {competitor.address}
                    </p>
                  )}
                </div>
                {competitor.rating && (
                  <div className="flex-shrink-0 flex items-center gap-1 bg-white px-1.5 sm:px-2 py-1 rounded-full border border-gray-200">
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

      {/* CTA Fixato in Basso - Sempre Visibile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-2xl px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-md mx-auto">
          <CustomButton
            onClick={() => {
              window.location.href = '/auth/login'
            }}
            className="w-full h-12 sm:h-14 text-sm sm:text-base font-black shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              ATTIVA PROVA GRATUITA
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </CustomButton>
          <p className="text-xs text-center text-gray-500 mt-2">
            Nessuna carta di credito • Setup in 5 minuti
          </p>
        </div>
      </div>
    </div>
  )
}
