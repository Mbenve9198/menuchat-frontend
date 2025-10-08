"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, TrendingUp, ThumbsUp, AlertCircle, Loader2, BarChart3 } from "lucide-react"

interface ReviewAnalysisProps {
  placeId: string
  restaurantName: string
}

interface ReviewAnalysisData {
  restaurantName: string
  analysisDate: string
  totalReviews: number
  averageRating: number
  reviewVelocity: number
  ratingDistribution: {
    oneStars: number
    twoStars: number
    threeStars: number
    fourStars: number
    fiveStars: number
  }
  aiAnalysis: {
    strengths: string[]
    weaknesses: string[]
    mainTopics: Array<{
      keyword: string
      sentiment: 'positive' | 'negative' | 'neutral'
    }>
    summary: string
  }
}

export function ReviewAnalysisSection({ placeId, restaurantName }: ReviewAnalysisProps) {
  const [data, setData] = useState<ReviewAnalysisData | null>(null)
  const [status, setStatus] = useState<'loading' | 'processing' | 'available' | 'not_available' | 'error'>('loading')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    fetchReviewAnalysis()
  }, [placeId])

  const fetchReviewAnalysis = async () => {
    try {
      setStatus('loading')

      console.log(`🔍 Fetching review analysis for placeId: ${placeId}`)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/review-analysis/${placeId}`
      )

      console.log(`📡 Review analysis response status: ${response.status}`)

      if (!response.ok) {
        throw new Error('Errore nel recupero dell\'analisi')
      }

      const result = await response.json()
      console.log(`📊 Review analysis result:`, {
        found: result.found,
        status: result.status,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : []
      })

      if (result.status === 'completed' && result.found) {
        console.log('✅ Analisi recensioni trovata e completata!', {
          totalReviews: result.data?.totalReviews,
          averageRating: result.data?.averageRating,
          reviewVelocity: result.data?.reviewVelocity,
          hasStrengths: result.data?.aiAnalysis?.strengths?.length > 0,
          hasWeaknesses: result.data?.aiAnalysis?.weaknesses?.length > 0
        })
        setData(result.data)
        setStatus('available')
      } else if (result.status === 'processing') {
        console.log(`⏳ Analisi in processing, retry ${retryCount + 1}/12...`)
        setStatus('processing')
        
        // Retry dopo 5 secondi (max 12 tentativi = 1 minuto)
        if (retryCount < 12) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            fetchReviewAnalysis()
          }, 5000)
        }
      } else {
        console.log('ℹ️ Analisi non disponibile:', result)
        setStatus('not_available')
      }

    } catch (error) {
      console.error('❌ Errore caricamento analisi recensioni:', error)
      setStatus('error')
    }
  }

  // Loading state
  if (status === 'loading' || status === 'processing') {
    return (
      <motion.div
        className="bg-white rounded-3xl p-5 shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center py-6">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B9AAA] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Analisi Recensioni in Corso...
          </h3>
          <p className="text-sm text-gray-600">
            Stiamo analizzando {status === 'processing' ? 'centinaia di recensioni' : 'i dati'}. Questo può richiedere 30-60 secondi.
          </p>
        </div>
      </motion.div>
    )
  }

  // Not available state
  if (status === 'not_available' || status === 'error') {
    return null // Non mostrare nulla se non disponibile
  }

  // Data available
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Header Sezione */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-4xl mb-3">⭐</div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Analisi Approfondita Recensioni
        </h2>
        <p className="text-sm text-gray-600">
          Abbiamo analizzato tutte le {data.totalReviews} recensioni di {restaurantName}
        </p>
      </motion.div>

      {/* Metriche Principali */}
      <motion.div
        className="grid grid-cols-3 gap-2 sm:gap-3"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        {/* Totale Recensioni */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl text-center">
          <div className="text-2xl mb-1">📊</div>
          <p className="text-2xl sm:text-3xl font-black text-[#1B9AAA] mb-1">
            {data.totalReviews}
          </p>
          <p className="text-xs text-gray-600 font-medium leading-tight">
            Recensioni Totali
          </p>
        </div>

        {/* Rating Medio */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl text-center">
          <div className="text-2xl mb-1">⭐</div>
          <p className="text-2xl sm:text-3xl font-black text-yellow-600 mb-1">
            {data.averageRating}
          </p>
          <p className="text-xs text-gray-600 font-medium leading-tight">
            Rating Medio
          </p>
        </div>

        {/* Velocity */}
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl text-center">
          <div className="text-2xl mb-1">⚡</div>
          <p className="text-2xl sm:text-3xl font-black text-[#06D6A0] mb-1">
            {data.reviewVelocity}
          </p>
          <p className="text-xs text-gray-600 font-medium leading-tight">
            Recensioni/Anno
          </p>
        </div>
      </motion.div>

      {/* Punti Forti */}
      {data.aiAnalysis.strengths.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-green-200"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">💪</div>
            <h3 className="text-lg font-black text-gray-900">Punti Forti</h3>
          </div>
          <div className="space-y-2">
            {data.aiAnalysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-gray-800 flex-1">{strength}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Punti Deboli */}
      {data.aiAnalysis.weaknesses.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-orange-200"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">⚠️</div>
            <h3 className="text-lg font-black text-gray-900">Aree di Miglioramento</h3>
          </div>
          <div className="space-y-2">
            {data.aiAnalysis.weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-gray-800 flex-1">{weakness}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sintesi AI */}
      {data.aiAnalysis.summary && (
        <motion.div
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">🎯</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base text-gray-900 mb-2">
                Sintesi dell'Analisi
              </h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {data.aiAnalysis.summary}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
