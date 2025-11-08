"use client"

import { useState, useEffect } from "react"
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
  Sparkles,
  Lock
} from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { RankingMap } from "./ranking-map"
import { LocationTabs } from "./location-tabs"
import { ReviewAnalysisSection } from "./review-analysis-section"
import { GMBAuditGate } from "./gmb-audit-gate"

interface SearchResult {
  searchPointName: string
  searchPointIcon?: string
  searchPointCategory?: string
  rank: number | string
  coordinates: { lat: number; lng: number }
}

interface RankingResultsProps {
  data: {
    mainResult?: SearchResult
    strategicResults?: SearchResult[]
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
  placeId?: string
}

export function RankingResults({ data, keyword, onNewSearch, placeId }: RankingResultsProps) {
  const { userRestaurant, competitors, analysis, mainResult, strategicResults = [] } = data
  
  // Stato per il tab selezionato
  const [selectedLocationId, setSelectedLocationId] = useState('main')
  
  // Costruisci la lista dei tabs
  const allTabs = [
    {
      id: 'main',
      name: mainResult?.searchPointName || 'Tuo Locale',
      icon: '🏪',
      rank: mainResult?.rank || userRestaurant.rank
    },
    ...strategicResults.map((result, index) => ({
      id: `strategic-${index}`,
      name: result.searchPointName,
      icon: result.searchPointIcon || '📍',
      rank: result.rank
    }))
  ]

  // Ottieni i dati del tab corrente
  const getCurrentData = () => {
    if (selectedLocationId === 'main') {
      return {
        rank: mainResult?.rank || userRestaurant.rank,
        searchPointName: mainResult?.searchPointName || 'Dal tuo locale'
      }
    }
    
    const index = parseInt(selectedLocationId.replace('strategic-', ''))
    const strategicResult = strategicResults[index]
    
    return {
      rank: strategicResult?.rank || 'N/D',
      searchPointName: strategicResult?.searchPointName || 'N/D'
    }
  }

  const currentData = getCurrentData()
  const rank = typeof currentData.rank === 'number' ? currentData.rank : 21

  // Determina il colore e l'emoji in base al rank
  const getRankInfo = (rank: number | string) => {
    if (typeof rank !== 'number') return { color: 'from-red-500 to-orange-500', emoji: '😰', textColor: 'text-red-600' }
    if (rank <= 3) return { color: 'from-green-400 to-emerald-500', emoji: '🎉', textColor: 'text-green-600' }
    if (rank <= 7) return { color: 'from-yellow-400 to-orange-400', emoji: '😐', textColor: 'text-yellow-600' }
    return { color: 'from-orange-500 to-red-500', emoji: '😟', textColor: 'text-red-600' }
  }

  const rankInfo = getRankInfo(currentData.rank)

  // Calcola le metriche in base al rank corrente
  const competitorsAhead = typeof currentData.rank === 'number' ? currentData.rank - 1 : 20
  const estimatedLostCustomers = typeof currentData.rank === 'number' 
    ? currentData.rank >= 4 && currentData.rank <= 7
      ? (currentData.rank - 3) * 8
      : currentData.rank >= 8
      ? (currentData.rank - 3) * 10
      : 0
    : 0

  // Messaggio dinamico
  const getMessage = () => {
    if (typeof currentData.rank !== 'number') {
      return 'Non appari nei primi 20 risultati da questo punto!'
    }
    if (currentData.rank === 1) return 'Eccellente! Prima posizione! 🎉'
    if (currentData.rank <= 3) return 'Ottimo posizionamento nella top 3.'
    if (currentData.rank <= 7) return 'Buona visibilità, ma c\'è margine di miglioramento.'
    if (currentData.rank <= 10) return 'Posizionamento medio. Molti competitor ti precedono.'
    return 'Attenzione: scarsa visibilità da questo punto.'
  }

  // Determina il testo del CTA in base al ranking (usa il rank principale)
  const getCtaText = () => {
    const mainRank = mainResult?.rank || userRestaurant.rank
    if (typeof mainRank === 'number' && mainRank <= 3) {
      return "CONSOLIDA IL TUO POSIZIONAMENTO"
    }
    return "MIGLIORA IL TUO POSIZIONAMENTO"
  }

  // Determina se il lead è già TOP 3 (consolida) o deve migliorare
  const isTopRanked = () => {
    const mainRank = mainResult?.rank || userRestaurant.rank
    return typeof mainRank === 'number' && mainRank <= 3
  }

  // Gestisce il click sul CTA - TRIGGERA AUDIT + VA A QUALIFICAZIONE
  const handleCtaClick = () => {
    const token = localStorage.getItem('rank_checker_token')
    
    if (!token) {
      console.error('⚠️ Nessun token, redirect diretto a qualify')
      const restaurantParam = encodeURIComponent(userRestaurant.name)
      window.location.href = `/rank-checker/qualify?restaurant=${restaurantParam}`
      return
    }

    // 🔥 TRIGGERA AUDIT (fire-and-forget con keepalive per mobile)
    console.log('🚀 Triggering GMB Audit in background...')
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker/gmb-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token }),
      keepalive: true  // 🔥 Persiste anche dopo redirect (mobile fix)
    })
    .then(res => console.log('✅ Audit triggered:', res.status))
    .catch(err => console.error('⚠️ Audit error:', err))

    // REDIRECT IMMEDIATO a qualify
    const restaurantParam = encodeURIComponent(userRestaurant.name)
    window.location.href = `/rank-checker/qualify?restaurant=${restaurantParam}`
  }

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
          key={`emoji-${selectedLocationId}`}
          className="text-6xl sm:text-7xl md:text-8xl mb-4"
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 0.6 }}
        >
          {rankInfo.emoji}
        </motion.div>
        
        <motion.h1 
          key={`rank-${selectedLocationId}`}
          className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-3 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {typeof currentData.rank === 'number' ? `#${currentData.rank}` : currentData.rank}
        </motion.h1>
        
        <motion.div 
          key={`message-${selectedLocationId}`}
          className={`inline-block px-6 py-3 rounded-2xl ${
            typeof currentData.rank === 'number' && currentData.rank <= 3
              ? 'bg-green-100'
              : typeof currentData.rank === 'number' && currentData.rank <= 7
              ? 'bg-yellow-100'
              : 'bg-red-100'
          } mb-4`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className={`text-base sm:text-lg font-black ${rankInfo.textColor}`}>
            {getMessage()}
          </p>
        </motion.div>
        
        <p className="text-sm sm:text-base text-gray-600 mb-2">
          Ricerca: "<span className="font-bold">{keyword}</span>"
        </p>
        
        <p className="text-xs sm:text-sm text-gray-500">
          📍 {currentData.searchPointName}
        </p>
      </motion.div>

      {/* Tabs per cambiare punto di vista (solo se ci sono risultati strategici) */}
      {strategicResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          {/* Messaggio esplicativo */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">🎯</div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900 mb-1">
                  Abbiamo analizzato la tua visibilità da {strategicResults.length + 1} punti strategici!
                </h4>
                <p className="text-xs text-gray-600">
                  Tocca i pulsanti sotto per vedere come appari dalle zone chiave della tua città
                </p>
              </div>
            </div>
          </div>
          
          <LocationTabs
            tabs={allTabs}
            activeTab={selectedLocationId}
            onTabChange={setSelectedLocationId}
          />
        </motion.div>
      )}

      {/* Statistiche Impatto - Dati dinamici basati sul tab */}
      <motion.div 
        key={`stats-${selectedLocationId}`}
        className="grid grid-cols-2 gap-2 sm:gap-3"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Competitor davanti */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl">
          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">👥</div>
            <motion.p 
              key={`comp-${competitorsAhead}`}
              className="text-2xl sm:text-3xl font-black text-[#EF476F] mb-1"
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {competitorsAhead}
            </motion.p>
            <p className="text-xs text-gray-600 font-medium leading-tight">
              Competitor davanti
            </p>
          </div>
        </div>

        {/* Clienti persi */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl">
          <div className="text-center">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📉</div>
            <motion.p 
              key={`lost-${estimatedLostCustomers}`}
              className="text-2xl sm:text-3xl font-black text-[#EF476F] mb-1"
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ~{estimatedLostCustomers}
            </motion.p>
            <p className="text-xs text-gray-600 font-medium leading-tight">
              Coperti persi/sett.
            </p>
          </div>
        </div>
      </motion.div>

      {/* La Mappa - TEMPORANEAMENTE DISABILITATA */}
      {/* {hasValidCoordinates ? (
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
      )} */}

      {/* Riepilogo Multi-Punto (solo se ci sono risultati strategici) */}
      {strategicResults.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-orange-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-3">
              Il Verdetto Completo
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Abbiamo analizzato la tua visibilità da <span className="font-black">{strategicResults.length + 1} punti strategici</span> della città. 
              Ecco cosa abbiamo scoperto:
            </p>
            
            <div className="space-y-2">
              {allTabs.map((tab) => {
                const tabRank = typeof tab.rank === 'number' ? tab.rank : 21
                return (
                  <div 
                    key={tab.id} 
                    className="flex items-center justify-between p-3 bg-white rounded-xl"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{tab.icon}</span>
                      <span className="text-sm font-medium text-gray-700 truncate">{tab.name}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full font-black text-sm ${
                      tabRank <= 3 ? 'bg-green-100 text-green-700' :
                      tabRank <= 7 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {typeof tab.rank === 'number' ? `#${tab.rank}` : tab.rank}
                    </div>
                  </div>
                )
              })}
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
              <p className="text-xs text-gray-600">Chi appare prima di te (dal tuo locale)</p>
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

      {/* Analisi Recensioni Approfondita */}
      {placeId && (
        <ReviewAnalysisSection
          placeId={placeId}
          restaurantName={userRestaurant.name}
        />
      )}

      {/* 🆕 GMB AUDIT GATE - SEMPRE VISIBILE dopo risultati base */}
      <div id="gmb-gate-section">
        <GMBAuditGate
          restaurantName={userRestaurant.name}
          currentRank={mainResult?.rank || userRestaurant.rank}
          onUnlock={handleCtaClick}
          isLoading={false}
        />
      </div>

      {/* CTA Fixato in Basso - NASCOSTO se c'è il gate o il report (il gate ha già il suo CTA) */}
      {false && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-2xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="max-w-md mx-auto">
            {/* Teaser per GMB Audit */}
            <div className="mb-3 p-2.5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 text-center">
              <p className="text-xs font-bold text-orange-900 mb-1">
                ⚠️ Questa è solo l'ANALISI BASE
              </p>
              <p className="text-xs text-orange-700">
                Vuoi scoprire PERCHÉ sei in posizione {typeof (mainResult?.rank || userRestaurant.rank) === 'number' ? `#${mainResult?.rank || userRestaurant.rank}` : mainResult?.rank || userRestaurant.rank}?
              </p>
            </div>

            <CustomButton
              onClick={handleCtaClick}
              className="w-full h-12 sm:h-14 text-xs sm:text-sm font-black shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                SBLOCCA ANALISI GMB COMPLETA
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </CustomButton>
            <p className="text-xs text-center text-gray-500 mt-2">
              3 domande veloci • Google Maps Health Score • Piano d'azione AI
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
