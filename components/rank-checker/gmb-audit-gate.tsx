"use client"

import { motion } from "framer-motion"
import { Lock, ArrowRight, Target, Trophy, Zap, Gift } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"

interface GMBAuditGateProps {
  restaurantName: string
  currentRank: number | string
  onUnlock: () => void
  isLoading: boolean
}

export function GMBAuditGate({ restaurantName, currentRank, onUnlock, isLoading }: GMBAuditGateProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-orange-200"
      >
        {/* Badge Prezzo / Valore */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 15 }}
          className="flex justify-center mb-4"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2.5 rounded-full shadow-lg">
            <Gift className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">GRATIS OGGI</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs opacity-75">Valore</span>
                <span className="text-base font-bold line-through opacity-75">€497</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl sm:text-6xl mb-4"
          >
            🔒
          </motion.div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">
            Vuoi scoprire <span className="text-orange-600">PERCHÉ</span> sei in posizione{" "}
            <span className="text-red-600">
              {typeof currentRank === 'number' ? `#${currentRank}` : currentRank}
            </span>?
          </h2>
          
          <p className="text-sm sm:text-base text-gray-700 mb-4">
            <strong>Analisi GMB Completa</strong> ti rivela:
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 bg-white rounded-xl p-3.5 sm:p-4 border border-orange-200"
          >
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm sm:text-base text-gray-900 mb-1">I tuoi 3 problemi CRITICI</p>
              <p className="text-xs sm:text-sm text-gray-600">Con piano d'azione passo-passo</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3 bg-white rounded-xl p-3.5 sm:p-4 border border-orange-200"
          >
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm sm:text-base text-gray-900 mb-1">Confronto con TOP 3 competitor</p>
              <p className="text-xs sm:text-sm text-gray-600">Cosa fanno meglio di te</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-start gap-3 bg-white rounded-xl p-3.5 sm:p-4 border border-orange-200"
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-sm sm:text-base text-gray-900 mb-1">Quick Wins per salire SUBITO</p>
              <p className="text-xs sm:text-sm text-gray-600">Azioni concrete da fare oggi</p>
            </div>
          </motion.div>
        </div>

        {/* CTA nella Card */}
        <CustomButton
          onClick={onUnlock}
          disabled={isLoading}
          className="w-full h-12 sm:h-14 text-sm sm:text-base font-black shadow-xl"
        >
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            SBLOCCA ANALISI COMPLETA
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </CustomButton>

        <p className="text-xs text-center text-gray-500 mt-3">
          3 domande veloci • Google Maps Health Score • Piano d'azione AI
        </p>
      </motion.div>

      {/* CTA Fixata in Basso - Sempre Visibile */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t-2 border-orange-200 shadow-2xl px-3 sm:px-4 py-3 sm:py-4"
      >
        <div className="max-w-md mx-auto">
          {/* Badge Prezzo Compatto */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black">
              <Gift className="w-3.5 h-3.5" />
              <span>GRATIS OGGI</span>
              <span className="opacity-75">•</span>
              <span className="line-through opacity-75">€497</span>
            </div>
          </div>

          {/* Teaser Veloce */}
          <div className="mb-3 text-center">
            <p className="text-xs font-bold text-gray-900">
              Scopri PERCHÉ sei #{typeof currentRank === 'number' ? currentRank : '20+'} e come salire
            </p>
          </div>

          <CustomButton
            onClick={onUnlock}
            disabled={isLoading}
            className="w-full h-12 sm:h-14 text-xs sm:text-sm font-black shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              SBLOCCA ANALISI COMPLETA
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </CustomButton>
          
          <p className="text-xs text-center text-gray-500 mt-2">
            Piano d'azione AI • Quick Wins • Confronto competitor
          </p>
        </div>
      </motion.div>
    </>
  )
}

