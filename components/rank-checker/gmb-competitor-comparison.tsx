"use client"

import { motion } from "framer-motion"
import { Trophy, AlertCircle } from "lucide-react"

interface ComparisonRow {
  metric: string
  user: number | string
  comp1: number | string
  comp2: number | string
  comp3: number | string
  userWins: boolean
}

interface GMBCompetitorComparisonProps {
  table: ComparisonRow[]
  summary: {
    userWins: number
    competitorWins: number
    whoIsBest: string
    yourWeakestArea: string
  }
}

export function GMBCompetitorComparison({ table, summary }: GMBCompetitorComparisonProps) {
  return (
    <motion.div
      className="bg-white rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-gray-200"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#EF476F]" />
        <h3 className="text-lg sm:text-xl font-black text-gray-900">
          Tu vs TOP 3 Competitor
        </h3>
      </div>

      {/* Tabella Invertita - Righe = Ristoranti, Colonne = Metriche */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-2 sm:px-3 font-bold text-gray-600 uppercase tracking-wide w-32 sm:w-40">
                Ristorante
              </th>
              {table.map((metric) => (
                <th key={metric.metric} className="text-center py-2 px-1 sm:px-2 font-bold text-gray-600 uppercase tracking-wide text-xs">
                  {metric.metric}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* TU */}
            <motion.tr
              className="border-b border-gray-100 bg-[#1B9AAA]/5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <td className="py-3 px-2 sm:px-3 font-black text-[#1B9AAA]">
                Tu
              </td>
              {table.map((metric) => (
                <td key={metric.metric} className={`py-3 px-1 sm:px-2 text-center font-bold ${
                  metric.userWins ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.userWins ? '✅' : '❌'} {metric.user}
                </td>
              ))}
            </motion.tr>

            {/* COMPETITOR #1 */}
            {table[0]?.comp1 && (
              <motion.tr
                className="border-b border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <td className="py-3 px-2 sm:px-3 font-medium text-gray-700 truncate max-w-[120px]">
                  <span className="text-xs text-gray-500">#1</span> {summary.whoIsBest !== 'Tu' ? summary.whoIsBest : 'Competitor'}
                </td>
                {table.map((metric) => (
                  <td key={metric.metric} className="py-3 px-1 sm:px-2 text-center font-bold text-gray-900">
                    {metric.comp1}
                  </td>
                ))}
              </motion.tr>
            )}

            {/* COMPETITOR #2 */}
            {table[0]?.comp2 && (
              <motion.tr
                className="border-b border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <td className="py-3 px-2 sm:px-3 font-medium text-gray-700 text-xs">
                  <span className="text-gray-500">#2</span> Competitor
                </td>
                {table.map((metric) => (
                  <td key={metric.metric} className="py-3 px-1 sm:px-2 text-center font-medium text-gray-700">
                    {metric.comp2}
                  </td>
                ))}
              </motion.tr>
            )}

            {/* COMPETITOR #3 - solo desktop */}
            {table[0]?.comp3 && (
              <motion.tr
                className="border-b border-gray-100 hidden sm:table-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <td className="py-3 px-2 sm:px-3 font-medium text-gray-700 text-xs">
                  <span className="text-gray-500">#3</span> Competitor
                </td>
                {table.map((metric) => (
                  <td key={metric.metric} className="py-3 px-1 sm:px-2 text-center font-medium text-gray-600">
                    {metric.comp3}
                  </td>
                ))}
              </motion.tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 space-y-3">
        {/* Chi Vince */}
        <div className={`p-3 rounded-xl border-2 ${
          summary.whoIsBest === 'Tu' 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
        }`}>
          <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
            🏆 Chi è il migliore?
          </p>
          <p className={`text-sm sm:text-base font-black ${
            summary.whoIsBest === 'Tu' ? 'text-green-700' : 'text-red-700'
          }`}>
            {summary.whoIsBest}
            {summary.whoIsBest !== 'Tu' && ' ti batte su quasi tutti i fattori'}
          </p>
        </div>

        {/* Area più Debole */}
        {summary.yourWeakestArea && summary.yourWeakestArea !== 'Nessuna area critica identificata' && (
          <div className="p-3 rounded-xl bg-orange-50 border-2 border-orange-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mb-1">
                  La tua area più debole
                </p>
                <p className="text-xs sm:text-sm font-black text-orange-700">
                  {summary.yourWeakestArea}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Concentrati su questo per il massimo impatto
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

