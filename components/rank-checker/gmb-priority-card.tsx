"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Zap, TrendingUp } from "lucide-react"

interface Priority {
  tier: string
  level: string
  number: number
  title: string
  impact: string
  stats: any
  whyItMatters: string
  quickWin: {
    title: string
    steps: string[]
  }
  estimatedImpact: string
  source: string
  priority: number
}

interface GMBPriorityCardProps {
  priority: Priority
  index: number
}

export function GMBPriorityCard({ priority, index }: GMBPriorityCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0) // Prima card aperta di default

  const getBorderColor = () => {
    if (priority.tier === 'CRITICO') return 'border-red-300'
    if (priority.tier === 'ALTA') return 'border-yellow-300'
    return 'border-green-300'
  }

  const getBgColor = () => {
    if (priority.tier === 'CRITICO') return 'from-red-50 to-red-100'
    if (priority.tier === 'ALTA') return 'from-yellow-50 to-yellow-100'
    return 'from-green-50 to-green-100'
  }

  const getImpactBadgeColor = () => {
    if (priority.impact === 'ALTISSIMO') return 'bg-red-500'
    if (priority.impact === 'ALTO') return 'bg-orange-500'
    if (priority.impact === 'MEDIO') return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <motion.div
      className={`bg-gradient-to-br ${getBgColor()} rounded-2xl border-2 ${getBorderColor()} overflow-hidden`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {/* Header - Sempre visibile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 sm:p-4 flex items-start gap-3 text-left"
      >
        <div className="flex-shrink-0 text-2xl sm:text-3xl mt-1">
          {priority.level}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Priority Number + Title */}
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-xs sm:text-sm">
              {priority.number}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-gray-900 leading-tight mb-1">
                {priority.title}
              </h3>
            </div>
          </div>

          {/* Impact Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`${getImpactBadgeColor()} px-2 py-0.5 rounded-full`}>
              <p className="text-xs font-bold text-white uppercase tracking-wide">
                Impatto: {priority.impact}
              </p>
            </div>
            <div className="bg-white px-2 py-0.5 rounded-full border border-gray-300">
              <p className="text-xs font-bold text-gray-700">
                {priority.tier}
              </p>
            </div>
          </div>

          {/* Stats Preview (solo se collassato) */}
          {!isExpanded && priority.stats && (
            <div className="mt-2">
              <p className="text-xs text-gray-700 font-medium">
                {Object.keys(priority.stats).length > 0 && (
                  <>
                    {priority.stats.current && `Ora: ${priority.stats.current}`}
                    {priority.stats.target && ` → Target: ${priority.stats.target}`}
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 text-gray-600">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Contenuto Espanso */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4">
              {/* Stats Dettagliati */}
              {priority.stats && Object.keys(priority.stats).length > 0 && (
                <div className="bg-white rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Situazione Attuale</p>
                  {Object.entries(priority.stats).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Perché è Importante */}
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-base">💡</span>
                  <p className="text-xs font-bold text-gray-700 uppercase">Perché è Importante</p>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {priority.whyItMatters}
                </p>
                {priority.source && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Fonte: {priority.source}
                  </p>
                )}
              </div>

              {/* Quick Win */}
              {priority.quickWin && (
                <div className="bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 rounded-xl p-3 border-2 border-[#1B9AAA]/30">
                  <div className="flex items-start gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[#1B9AAA] flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-black text-[#1B9AAA] uppercase">
                      {priority.quickWin.title}
                    </p>
                  </div>
                  <ol className="space-y-1.5">
                    {priority.quickWin.steps.map((step, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Impatto Stimato */}
              <div className="flex items-center gap-2 justify-center bg-white rounded-xl p-2.5">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs sm:text-sm font-black text-green-700">
                  {priority.estimatedImpact}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

