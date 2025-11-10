"use client"

import { motion } from "framer-motion"
import { Lock, Sparkles, ArrowRight, Target, Trophy, Zap } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"

interface GMBAuditGateProps {
  restaurantName: string
  currentRank: number | string
  onUnlock: () => void
  isLoading: boolean
}

export function GMBAuditGate({ restaurantName, currentRank, onUnlock, isLoading }: GMBAuditGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-6 shadow-2xl border-2 border-orange-200"
    >
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🔒
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 leading-tight">
          Vuoi scoprire <span className="text-orange-600">PERCHÉ</span> sei in posizione{" "}
          <span className="text-red-600">
            {typeof currentRank === 'number' ? `#${currentRank}` : currentRank}
          </span>?
        </h2>
        
        <p className="text-base text-gray-700 mb-4">
          <strong>Analisi GMB Completa</strong> ti rivela:
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 bg-white rounded-xl p-4 border border-orange-200"
        >
          <Target className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-1">I tuoi 3 problemi CRITICI</p>
            <p className="text-sm text-gray-600">Con piano d'azione passo-passo</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 bg-white rounded-xl p-4 border border-orange-200"
        >
          <Trophy className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-1">Confronto con TOP 3 competitor</p>
            <p className="text-sm text-gray-600">Cosa fanno meglio di te</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 bg-white rounded-xl p-4 border border-orange-200"
        >
          <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-1">Quick Wins per salire SUBITO</p>
            <p className="text-sm text-gray-600">Azioni concrete da fare oggi</p>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <CustomButton
        onClick={onUnlock}
        disabled={isLoading}
        className="w-full h-14 text-base font-black shadow-xl"
      >
        <span className="flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          SBLOCCA ANALISI COMPLETA
          <ArrowRight className="w-5 h-5" />
        </span>
      </CustomButton>

      <p className="text-xs text-center text-gray-500 mt-3">
        3 domande veloci • Google Maps Health Score • Piano d'azione AI
      </p>
    </motion.div>
  )
}

