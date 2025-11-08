"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Calendar, TrendingUp } from "lucide-react"
import { GMBHealthScore } from "./gmb-health-score"
import { GMBPriorityCard } from "./gmb-priority-card"
import { GMBCompetitorComparison } from "./gmb-competitor-comparison"
import { CustomButton } from "@/components/ui/custom-button"

interface GMBFullReportProps {
  audit: {
    summary: {
      restaurantName: string
      currentRank: number | string
      keyword: string
      healthScore: number
      verdict: string
      mainIssue: string
    }
    healthScore: {
      totalScore: number
      verdict: string
      breakdown: {
        tier1: { score: number; max: number }
        tier2: { score: number; max: number }
        tier3: { score: number; max: number }
      }
      priorities: any[]
    }
    competitorComparison: {
      table: any[]
      summary: any
    }
    aiInsights: {
      userStrengths: string[]
      userWeaknesses: string[]
      competitorStrengths: string[]
      criticalGaps: any[]
      quickWins: string[]
    }
    actionPlan?: {
      first7Days: any[]
      first30Days: any[]
      first90Days: any[]
      estimatedRankingImprovement: string
      estimatedRevenue: string
    }
    roiEstimate: {
      current: any
      after90Days: any
      gain: {
        customers: string
        revenue: string
        yearlyRevenue: string
      }
    }
  }
  onBookCall: () => void
}

export function GMBFullReport({ audit, onBookCall }: GMBFullReportProps) {
  const { summary, healthScore, competitorComparison, aiInsights, actionPlan, roiEstimate } = audit

  return (
    <div className="w-full space-y-5 pb-28">
      {/* Hero Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-4xl mb-3">📊</div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight">
          Analisi GMB Completa
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {summary.restaurantName}
        </p>
      </motion.div>

      {/* Health Score Card */}
      <GMBHealthScore
        score={healthScore.totalScore}
        verdict={healthScore.verdict}
        breakdown={healthScore.breakdown}
      />

      {/* Messaggio Shock */}
      <motion.div
        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-4 sm:p-5 shadow-xl text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <p className="text-base sm:text-lg font-black mb-2">
            🚨 PROBLEMA PRINCIPALE IDENTIFICATO
          </p>
          <p className="text-xl sm:text-2xl font-black mb-3">
            {summary.mainIssue}
          </p>
          <p className="text-sm opacity-90">
            Questo è il fattore #1 che ti sta penalizzando su Google Maps
          </p>
        </div>
      </motion.div>

      {/* Priorities (Top 5-7) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">🎯</div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">
            Le Tue Priorità di Sistemazione
          </h2>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Ordinate per impatto (dalla più critica alla meno importante)
        </p>

        {healthScore.priorities.map((priority, index) => (
          <GMBPriorityCard
            key={index}
            priority={priority}
            index={index}
          />
        ))}
      </div>

      {/* Competitor Comparison */}
      <GMBCompetitorComparison
        table={competitorComparison.table}
        summary={competitorComparison.summary}
      />

      {/* AI Insights */}
      {aiInsights && (
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-purple-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl">🤖</div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900">
              Analisi AI delle Recensioni
            </h3>
          </div>

          {/* Strengths */}
          {aiInsights.userStrengths && aiInsights.userStrengths.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                <span>✅</span> Cosa amano i tuoi clienti
              </p>
              <div className="space-y-1.5">
                {aiInsights.userStrengths.map((strength, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-2 border border-green-200">
                    <p className="text-xs sm:text-sm text-gray-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {aiInsights.userWeaknesses && aiInsights.userWeaknesses.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1">
                <span>❌</span> Cosa criticano
              </p>
              <div className="space-y-1.5">
                {aiInsights.userWeaknesses.map((weakness, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-2 border border-red-200">
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {aiInsights.quickWins && aiInsights.quickWins.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#1B9AAA] uppercase mb-2 flex items-center gap-1">
                <span>⚡</span> Quick Wins AI
              </p>
              <div className="space-y-1.5">
                {aiInsights.quickWins.map((win, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-2 border border-[#1B9AAA]/30">
                    <p className="text-xs sm:text-sm text-gray-700">{win}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ROI Estimate - RIMOSSO (ridondante) */}

      {/* Action Plan Preview (se disponibile) */}
      {actionPlan && actionPlan.first7Days && actionPlan.first7Days.length > 0 && (
        <motion.div
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-[#1B9AAA]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B9AAA]" />
            <h3 className="text-lg sm:text-xl font-black text-gray-900">
              Piano d'Azione - Prossimi 7 Giorni
            </h3>
          </div>

          <div className="space-y-2.5">
            {actionPlan.first7Days.slice(0, 3).map((action, idx) => (
              <div key={idx} className="bg-gradient-to-r from-[#1B9AAA]/5 to-[#06D6A0]/5 rounded-xl p-3 border border-[#1B9AAA]/20">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B9AAA] text-white flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
                      {action.action}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {action.why}
                    </p>
                    {action.expectedResult && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-bold text-green-700">
                          {action.expectedResult}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {actionPlan.estimatedRankingImprovement && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 text-center">
              <p className="text-xs font-bold text-gray-600 uppercase mb-1">Stima Miglioramento</p>
              <p className="text-sm sm:text-base font-black text-purple-700">
                {actionPlan.estimatedRankingImprovement}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* CTA FINALE - Fixato in Basso */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-2xl px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-md mx-auto">
          <CustomButton
            onClick={onBookCall}
            className="w-full h-14 sm:h-16 text-sm sm:text-base font-black shadow-2xl"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              VOGLIO IMPLEMENTARE TUTTO QUESTO
              <ArrowRight className="w-5 h-5" />
            </span>
          </CustomButton>
          
          <p className="text-xs text-center text-gray-500 mt-2">
            💬 Chiamata strategica gratuita • Zero impegno
          </p>
        </div>
      </div>
    </div>
  )
}

