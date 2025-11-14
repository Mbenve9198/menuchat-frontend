"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, TrendingUp } from "lucide-react"

interface LiveResult {
  id: string
  city: string
  type: string
  typeName: string
  menusSent: number
  reviewsCollected: number
  reviewRequests: number
  badge: {
    emoji: string
    text: string
  } | null
  timestamp: string
  performance: number
}

interface LiveResultsFeedProps {
  period?: '7days' | '30days' | 'alltime'
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function LiveResultsFeed({ 
  period = '7days',
  autoRefresh = true,
  refreshInterval = 30000 
}: LiveResultsFeedProps) {
  const [results, setResults] = useState<LiveResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())

  const loadData = async () => {
    try {
      const response = await fetch(`/api/public-stats/live-feed?period=${selectedPeriod}&limit=12`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Identifica nuove card per l'animazione pulse
        const currentIds = new Set(results.map(r => r.id))
        const incomingIds = new Set(data.data.map((r: LiveResult) => r.id))
        const newCardIds = new Set(
          data.data
            .filter((r: LiveResult) => !currentIds.has(r.id))
            .map((r: LiveResult) => r.id)
        )
        
        setNewIds(newCardIds)
        setResults(data.data)
        
        // Rimuovi l'highlight dopo 3 secondi
        setTimeout(() => setNewIds(new Set()), 3000)
      }
    } catch (error) {
      console.error('Error loading live feed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      loadData()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, selectedPeriod])

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime()
    const then = new Date(timestamp).getTime()
    const diff = Math.floor((now - then) / 1000 / 60) // minuti
    
    if (diff < 1) return 'Ora'
    if (diff < 60) return `${diff} min fa`
    const hours = Math.floor(diff / 60)
    if (hours < 24) return `${hours}h fa`
    return `${Math.floor(hours / 24)}g fa`
  }

  const getPeriodLabel = (p: string) => {
    switch(p) {
      case '7days': return 'Ultimi 7 giorni'
      case '30days': return 'Ultimo mese'
      case 'alltime': return 'Sempre'
      default: return 'Ultimi 7 giorni'
    }
  }

  const getPerformanceGradient = (performance: number) => {
    if (performance > 300) return 'from-emerald-50 to-green-50 border-green-200'
    if (performance > 100) return 'from-blue-50 to-cyan-50 border-blue-200'
    return 'from-gray-50 to-slate-50 border-gray-200'
  }

  return (
    <div className="w-full">
      {/* Header con filtri */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-25 animate-pulse"></div>
            <div className="relative bg-white px-3 py-1.5 rounded-lg border-2 border-green-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-700">LIVE</span>
            </div>
          </div>
          <span className="text-sm text-gray-600">Risultati in tempo reale</span>
        </div>

        {/* Filtro periodo */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-md">
          {(['7days', '30days', 'alltime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === p
                  ? 'bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getPeriodLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid di risultati */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border-2 border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {results.map((result, index) => {
              const isNew = newIds.has(result.id)
              
              return (
                <motion.div
                  key={result.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    damping: 20
                  }}
                  className={`bg-gradient-to-br ${getPerformanceGradient(result.performance)} border-2 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all relative overflow-hidden ${
                    isNew ? 'ring-2 ring-green-400 ring-opacity-50' : ''
                  }`}
                >
                  {/* Pulse effect per nuove card */}
                  {isNew && (
                    <motion.div
                      className="absolute inset-0 bg-green-400 opacity-20"
                      animate={{
                        opacity: [0.3, 0, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: 1,
                      }}
                    />
                  )}

                  {/* Header card */}
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{result.type}</span>
                      <div>
                        <p className="font-bold text-gray-900">{result.typeName}</p>
                        <p className="text-sm text-gray-600">📍 {result.city}</p>
                      </div>
                    </div>
                    {result.badge && (
                      <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                        <span>{result.badge.emoji}</span>
                        <span className="text-gray-700">{result.badge.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Statistiche */}
                  <div className="space-y-2 mb-3 relative z-10">
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-600">👥 Clienti raggiunti</span>
                      <motion.span 
                        className="font-bold text-lg text-[#1B9AAA]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                      >
                        {result.menusSent}
                      </motion.span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-600">⭐ Recensioni raccolte</span>
                      <motion.span 
                        className="font-bold text-lg text-[#06D6A0]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
                      >
                        {result.reviewsCollected}
                      </motion.span>
                    </div>
                  </div>

                  {/* Footer con timestamp */}
                  <div className="flex items-center justify-between text-xs text-gray-500 relative z-10">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Performance: {result.performance}
                    </span>
                    <span>{getTimeAgo(result.timestamp)}</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Messaggio se nessun risultato */}
      {!loading && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun risultato disponibile per questo periodo</p>
        </div>
      )}

      {/* Info auto-refresh */}
      {autoRefresh && results.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔄 Aggiornamento automatico ogni {refreshInterval / 1000} secondi
          </p>
        </div>
      )}
    </div>
  )
}

