"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"

interface GMBHealthScoreProps {
  score: number
  verdict: string
  breakdown: {
    tier1: { score: number; max: number }
    tier2: { score: number; max: number }
    tier3: { score: number; max: number }
  }
}

export function GMBHealthScore({ score, verdict, breakdown }: GMBHealthScoreProps) {
  // Colore in base al score
  const getScoreColor = () => {
    if (score >= 85) return 'from-green-400 to-emerald-500'
    if (score >= 70) return 'from-yellow-400 to-orange-400'
    if (score >= 50) return 'from-orange-400 to-red-400'
    return 'from-red-500 to-red-700'
  }

  const getVerdictEmoji = () => {
    if (verdict === 'OTTIMO') return '🏆'
    if (verdict === 'BUONO') return '👍'
    if (verdict === 'MEDIO') return '⚠️'
    return '🚨'
  }

  const getVerdictColor = () => {
    if (verdict === 'OTTIMO') return 'text-green-600'
    if (verdict === 'BUONO') return 'text-yellow-600'
    if (verdict === 'MEDIO') return 'text-orange-600'
    return 'text-red-600'
  }

  // Calcola percentuali per i tier
  const tier1Percentage = (breakdown.tier1.score / breakdown.tier1.max) * 100
  const tier2Percentage = (breakdown.tier2.score / breakdown.tier2.max) * 100
  const tier3Percentage = (breakdown.tier3.score / breakdown.tier3.max) * 100

  return (
    <motion.div
      className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-gray-200"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div 
          className="text-5xl sm:text-6xl mb-3"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 0.6 }}
        >
          {getVerdictEmoji()}
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
          Google Maps Health Score
        </h2>
        <p className="text-sm text-gray-600">
          Analisi approfondita del tuo profilo GMB
        </p>
      </div>

      {/* Gauge Circolare */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
        {/* Cerchio esterno (grigio) */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Cerchio progressivo (colorato) */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 40 * (1 - score / 100)
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`${getScoreColor().split(' ')[0].replace('from-', 'text-')}`} stopOpacity="1" />
              <stop offset="100%" className={`${getScoreColor().split(' ')[1].replace('to-', 'text-')}`} stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score al centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p 
            className="text-5xl sm:text-6xl font-black text-gray-900"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {score}
          </motion.p>
          <p className="text-sm sm:text-base font-bold text-gray-500">/100</p>
        </div>
      </div>

      {/* Verdict */}
      <div className="text-center mb-6">
        <div className={`inline-block px-5 py-2.5 rounded-full ${
          verdict === 'OTTIMO' ? 'bg-green-100' :
          verdict === 'BUONO' ? 'bg-yellow-100' :
          verdict === 'MEDIO' ? 'bg-orange-100' :
          'bg-red-100'
        }`}>
          <p className={`text-lg sm:text-xl font-black ${getVerdictColor()}`}>
            {verdict}
          </p>
        </div>
      </div>

      {/* Breakdown rimosso - solo gauge principale */}

      {/* Messaggio Critico */}
      {score < 70 && (
        <motion.div
          className="mt-5 p-3 sm:p-4 rounded-2xl bg-red-50 border-2 border-red-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-bold text-red-900 mb-1">
                Attenzione! Problemi Critici Rilevati
              </p>
              <p className="text-xs text-red-700 leading-relaxed">
                Il tuo profilo GMB ha lacune gravi che Google penalizza pesantemente. 
                Scorri sotto per vedere le priorità da sistemare SUBITO.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

