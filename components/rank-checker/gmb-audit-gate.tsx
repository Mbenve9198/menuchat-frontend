"use client"

import { motion } from "framer-motion"
import { Lock, Sparkles, TrendingUp, Target, Zap, ArrowRight } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"

interface GMBAuditGateProps {
  restaurantName: string
  currentRank: number | string
  onUnlock: () => void
  isLoading?: boolean
}

const BENEFITS = [
  {
    icon: "🎯",
    title: "Google Maps Health Score (0-100)",
    description: "Scopri PERCHÉ sei in quella posizione"
  },
  {
    icon: "🔴",
    title: "I 5-7 errori che Google penalizza",
    description: "Con fix passo-passo immediati"
  },
  {
    icon: "⚔️",
    title: "Confronto dettagliato con competitor",
    description: "Cosa fanno loro meglio di te (dati reali)"
  },
  {
    icon: "🤖",
    title: "Analisi AI delle recensioni",
    description: "Pattern nascosti e opportunità"
  },
  {
    icon: "📋",
    title: "Piano d'azione 7-30-90 giorni",
    description: "Cosa fare oggi, questa settimana, questo mese"
  },
  {
    icon: "💰",
    title: "Stima fatturato recuperabile",
    description: "Quanto stai perdendo vs quanto puoi guadagnare"
  }
]

export function GMBAuditGate({ restaurantName, currentRank, onUnlock, isLoading = false }: GMBAuditGateProps) {
  const rankDisplay = typeof currentRank === 'number' ? `#${currentRank}` : currentRank

  return (
    <div className="w-full space-y-4 pb-24">
      {/* Hero Drammatico */}
      <motion.div
        className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-orange-200 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-5xl sm:text-6xl mb-3"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
        >
          ⚠️
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 leading-tight">
          Questa è solo l'<span className="text-[#EF476F]">Analisi BASE</span>
        </h2>

        <p className="text-sm sm:text-base text-gray-700 mb-2">
          Ora sai che <span className="font-black">{restaurantName}</span> è in posizione <span className="font-black text-[#EF476F]">{rankDisplay}</span>
        </p>

        <p className="text-base sm:text-lg font-black text-gray-900">
          Ma... <span className="text-[#EF476F]">PERCHÉ</span> sei in questa posizione? 🤔
        </p>
      </motion.div>

      {/* Lock Section */}
      <motion.div
        className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-5">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            className="inline-block"
          >
            <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
          </motion.div>
          
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
            ANALISI COMPLETA <span className="text-[#EF476F]">BLOCCATA</span>
          </h3>
          
          <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
            Rispondi a <span className="font-black text-[#1B9AAA]">3 domande veloci</span> (30 secondi) 
            per sbloccare la tua <span className="font-bold">Analisi GMB Completa</span>
          </p>
        </div>

        {/* Benefici Grid */}
        <div className="space-y-2.5 sm:space-y-3 mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center">
            Cosa scoprirai:
          </p>
          
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.05) }}
            >
              <span className="text-2xl flex-shrink-0">{benefit.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight mb-0.5">
                  {benefit.title}
                </p>
                <p className="text-xs text-gray-600 leading-tight">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          className="bg-gradient-to-r from-[#1B9AAA]/5 to-[#06D6A0]/5 rounded-xl p-3 border border-[#1B9AAA]/20 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-center text-gray-700">
            ⭐ <span className="font-bold">127 ristoratori</span> hanno già sbloccato l'analisi completa oggi
          </p>
        </motion.div>

        {/* Valore */}
        <div className="text-center mb-1">
          <p className="text-xs text-gray-500 line-through">Valore: €497</p>
          <p className="text-lg sm:text-xl font-black text-[#1B9AAA]">
            GRATIS per te oggi 🎁
          </p>
        </div>
      </motion.div>

      {/* CTA Fixato in Basso */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-gray-200 shadow-2xl px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-md mx-auto">
          <CustomButton
            onClick={onUnlock}
            disabled={isLoading}
            className="w-full h-14 sm:h-16 text-sm sm:text-base font-black shadow-2xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.div>
                Elaborazione...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                🔓 SBLOCCA ANALISI COMPLETA
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </CustomButton>
          
          {!isLoading && (
            <p className="text-xs text-center text-gray-500 mt-2">
              ⏱️ 3 domande veloci • 30 secondi • Zero impegno
            </p>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <p className="text-xs text-blue-800 text-center leading-relaxed">
                🤖 Stiamo analizzando il tuo profilo Google Maps, confrontando con competitor e generando il piano d'azione con AI...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

