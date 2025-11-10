"use client"

import { motion } from "framer-motion"
import { AlertCircle, CheckCircle } from "lucide-react"

interface GMBPriorityCardProps {
  priority: {
    number: number
    level: string
    title: string
    impact: string
    stats: any
    whyItMatters: string
    quickWin: {
      title: string
      steps: string[]
    }
    estimatedImpact: string
  }
  index: number
}

export function GMBPriorityCard({ priority, index }: GMBPriorityCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case '🔴':
        return 'from-red-500 to-orange-500'
      case '🟡':
        return 'from-yellow-500 to-orange-400'
      case '🟢':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getLevelBg = (level: string) => {
    switch (level) {
      case '🔴':
        return 'bg-red-50 border-red-200'
      case '🟡':
        return 'bg-yellow-50 border-yellow-200'
      case '🟢':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`rounded-2xl border-2 ${getLevelBg(priority.level)} p-5 shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getLevelColor(priority.level)} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
          {priority.number}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{priority.level}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {priority.impact}
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">
            {priority.title}
          </h3>
        </div>
      </div>

      {/* Stats */}
      {priority.stats && Object.keys(priority.stats).length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <div className="space-y-2">
            {Object.entries(priority.stats).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-bold text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why It Matters */}
      <div className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-gray-700">Perché è importante:</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed pl-7">
          {priority.whyItMatters}
        </p>
      </div>

      {/* Quick Win */}
      {priority.quickWin && (
        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-black text-green-900">{priority.quickWin.title}</p>
          </div>
          <div className="space-y-2 pl-7">
            {priority.quickWin.steps?.map((step: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs text-green-600 font-bold mt-0.5">✓</span>
                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Impact */}
      {priority.estimatedImpact && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1 font-medium">Impatto stimato:</p>
          <p className="text-sm font-bold text-green-600">{priority.estimatedImpact}</p>
        </div>
      )}
    </motion.div>
  )
}

