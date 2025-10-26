"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, TrendingUp, CheckCircle, AlertTriangle, Sparkles } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"

interface OnboardingQualificationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  restaurantName: string
  accessToken: string
}

type Step = 'has-menu' | 'willing-menu' | 'covers' | 'result'

export function OnboardingQualificationModal({
  isOpen,
  onClose,
  onComplete,
  restaurantName,
  accessToken
}: OnboardingQualificationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('has-menu')
  const [hasDigitalMenu, setHasDigitalMenu] = useState<boolean | null>(null)
  const [willingToAdoptMenu, setWillingToAdoptMenu] = useState<boolean | null>(null)
  const [dailyCovers, setDailyCovers] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  // Calcola recensioni mensili
  const calculateMonthlyReviews = (): number => {
    const covers = parseInt(dailyCovers) || 0
    // 75% dei coperti effettivamente raggiungibili
    const reachableCustomers = covers * 0.75
    // 10% diventa recensione
    const dailyReviews = reachableCustomers * 0.10
    // 6 giorni a settimana * 4 settimane
    const monthlyReviews = dailyReviews * 6 * 4
    return Math.round(monthlyReviews)
  }

  const handleHasMenuAnswer = (answer: boolean) => {
    setHasDigitalMenu(answer)
    if (answer) {
      // Ha già il menu → vai diretto ai coperti
      setCurrentStep('covers')
    } else {
      // Non ha menu → chiedi se è disposto
      setCurrentStep('willing-menu')
    }
  }

  const handleWillingAnswer = (answer: boolean) => {
    setWillingToAdoptMenu(answer)
    setCurrentStep('covers')
  }

  const handleCoversSubmit = () => {
    if (parseInt(dailyCovers) > 0) {
      setCurrentStep('result')
    }
  }

  const handleFinalCTA = async () => {
    if (!accessToken) {
      console.error('⚠️ Nessun token disponibile, skip salvataggio qualificazione')
      onComplete()
      return
    }

    setIsSaving(true)

    try {
      // Salva i dati di qualificazione nel backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker-leads/${accessToken}/qualification`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hasDigitalMenu,
            willingToAdoptMenu,
            dailyCovers: parseInt(dailyCovers),
            estimatedMonthlyReviews: calculateMonthlyReviews()
          })
        }
      )

      if (response.ok) {
        console.log('✅ Dati di qualificazione salvati con successo')
      } else {
        console.error('⚠️ Errore salvataggio qualificazione (non bloccante)')
      }
    } catch (error) {
      console.error('⚠️ Errore salvataggio qualificazione:', error)
      // Non bloccare il flusso
    } finally {
      setIsSaving(false)
      onComplete()
    }
  }

  if (!isOpen) return null

  const monthlyReviews = calculateMonthlyReviews()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="text-5xl mb-3"
                >
                  🎯
                </motion.div>
                <h2 className="text-2xl font-black mb-2">
                  Perfetto, {restaurantName.split(' ')[0]}!
                </h2>
                <p className="text-white/90 text-sm">
                  2 domande per personalizzare la tua strategia
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* STEP 1: Ha già un menu digitale? */}
                {currentStep === 'has-menu' && (
                  <motion.div
                    key="has-menu"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">📱</div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        Utilizzi già un menu digitale?
                      </h3>
                      <p className="text-sm text-gray-600">
                        (QR code che porta al menu online)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleHasMenuAnswer(true)}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl hover:border-[#1B9AAA] hover:bg-[#1B9AAA]/5 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">✅</div>
                            <span className="font-bold text-gray-900">Sì, ce l'ho già</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1B9AAA] transition-colors" />
                        </div>
                      </button>

                      <button
                        onClick={() => handleHasMenuAnswer(false)}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl hover:border-[#1B9AAA] hover:bg-[#1B9AAA]/5 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">❌</div>
                            <span className="font-bold text-gray-900">No, non ancora</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1B9AAA] transition-colors" />
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Disposto a metterlo? (solo se non ha menu) */}
                {currentStep === 'willing-menu' && (
                  <motion.div
                    key="willing-menu"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">💡</div>
                      <h3 className="text-xl font-black text-gray-900 mb-3 leading-tight">
                        Saresti disposto a metterlo se ti permettesse di...
                      </h3>
                      
                      {/* Benefits Box */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-left">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-900">
                            Raccogliere <span className="text-green-600">100+ recensioni</span> al mese
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-left">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-900">
                            Entrare nella <span className="text-green-600">TOP 3</span> su Google Maps
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        (Senza dover fare nulla, automaticamente)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleWillingAnswer(true)}
                        className="w-full p-4 border-2 border-green-300 bg-green-50 rounded-2xl hover:border-green-500 hover:bg-green-100 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">🚀</div>
                            <span className="font-bold text-gray-900">Sì, assolutamente!</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      <button
                        onClick={() => handleWillingAnswer(false)}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">🤔</div>
                            <span className="font-bold text-gray-900">No, preferisco di no</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Quanti coperti? */}
                {currentStep === 'covers' && (
                  <motion.div
                    key="covers"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">👥</div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        Quanti coperti fai al giorno?
                      </h3>
                      <p className="text-sm text-gray-600">
                        (In media, nei giorni di apertura)
                      </p>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Es. 80"
                        value={dailyCovers}
                        onChange={(e) => setDailyCovers(e.target.value)}
                        className="w-full h-16 px-6 text-center text-3xl font-bold border-2 border-gray-200 rounded-2xl focus:border-[#1B9AAA] focus:ring-4 focus:ring-[#1B9AAA]/20 outline-none transition"
                        autoFocus
                      />

                      {/* Quick select buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {[30, 50, 80, 100, 150, 200].map((num) => (
                          <button
                            key={num}
                            onClick={() => setDailyCovers(num.toString())}
                            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${
                              dailyCovers === num.toString()
                                ? 'bg-[#1B9AAA] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      <CustomButton
                        onClick={handleCoversSubmit}
                        disabled={!dailyCovers || parseInt(dailyCovers) <= 0}
                        className="w-full h-14 text-base font-black"
                      >
                        <span className="flex items-center gap-2">
                          Calcola il Potenziale
                          <TrendingUp className="w-5 h-5" />
                        </span>
                      </CustomButton>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Risultato */}
                {currentStep === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-6"
                  >
                    {/* Box Recensioni */}
                    <div className="bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] rounded-3xl p-6 text-white text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                        className="mb-4"
                      >
                        <div className="text-5xl mb-2">⭐</div>
                        <div className="text-6xl font-black mb-2">
                          {monthlyReviews}
                        </div>
                        <div className="text-xl font-bold opacity-90">
                          Recensioni al mese
                        </div>
                      </motion.div>
                      
                      <div className="text-sm opacity-80 bg-white/10 rounded-xl p-3">
                        Con {dailyCovers} coperti/giorno, il tuo ristorante può generare questo numero di recensioni
                      </div>
                    </div>

                    {/* Messaggio finale in base alle risposte */}
                    {hasDigitalMenu && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-black text-gray-900 mb-2">
                              Sei già pronto! 🎉
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              Hai già un menu digitale. Con MenuChat puoi <strong>trasformarlo in una macchina di recensioni</strong> e ottenere quelle {monthlyReviews} recensioni mensili che ti faranno <strong>scalare la classifica di Google</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!hasDigitalMenu && willingToAdoptMenu && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-black text-gray-900 mb-2">
                              Lo creiamo noi per te! 🚀
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                              Non hai ancora un menu digitale? <strong>Nessun problema!</strong>
                            </p>
                            <div className="bg-white rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-gray-900">Lo creiamo noi GRATIS nella prova</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-gray-900">Nessun impegno</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-gray-900">Inizi subito a prendere recensioni</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!hasDigitalMenu && !willingToAdoptMenu && (
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-black text-gray-900 mb-2">
                              Stai perdendo {monthlyReviews} recensioni al mese! 😰
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              Senza un menu digitale collegato a WhatsApp, <strong>ogni mese perdi {monthlyReviews} potenziali recensioni</strong> che i tuoi competitor stanno raccogliendo.
                            </p>
                            <div className="mt-3 p-3 bg-white rounded-xl">
                              <p className="text-xs text-gray-600 mb-2">In 6 mesi perderai:</p>
                              <p className="text-2xl font-black text-orange-600">
                                {monthlyReviews * 6} recensioni
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Mentre loro salgono, tu scendi...
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CTA Finale */}
                    <CustomButton
                      onClick={handleFinalCTA}
                      disabled={isSaving}
                      className="w-full h-14 text-base font-black"
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ⏳
                          </motion.div>
                          Salvataggio...
                        </span>
                      ) : !hasDigitalMenu && !willingToAdoptMenu ? (
                        <span className="flex items-center gap-2">
                          Scopri come recuperarle
                          <ChevronRight className="w-5 h-5" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Inizia la Prova Gratuita
                          <Sparkles className="w-5 h-5" />
                        </span>
                      )}
                    </CustomButton>

                    <p className="text-xs text-center text-gray-500">
                      🔒 Nessuna carta richiesta • Cancelli quando vuoi
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

