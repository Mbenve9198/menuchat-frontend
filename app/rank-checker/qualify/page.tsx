"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, TrendingUp, CheckCircle, AlertTriangle, Sparkles, ArrowLeft } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { useToast } from "@/hooks/use-toast"

type Step = 'has-menu' | 'willing-menu' | 'covers' | 'result'

export default function QualifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState<Step>('has-menu')
  const [hasDigitalMenu, setHasDigitalMenu] = useState<boolean | null>(null)
  const [willingToAdoptMenu, setWillingToAdoptMenu] = useState<boolean | null>(null)
  const [dailyCovers, setDailyCovers] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [restaurantName, setRestaurantName] = useState('')

  // Recupera info dal localStorage e URL
  useEffect(() => {
    const token = localStorage.getItem('rank_checker_token')
    if (!token) {
      toast({
        title: "Errore",
        description: "Devi prima completare l'analisi del ranking",
        variant: "destructive"
      })
      router.push('/rank-checker')
      return
    }

    // Cerca di recuperare il nome del ristorante
    const storedName = searchParams.get('restaurant') || 'il tuo ristorante'
    setRestaurantName(storedName)
  }, [])

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
    const token = localStorage.getItem('rank_checker_token')
    
    if (!token) {
      console.error('⚠️ Nessun token disponibile, skip salvataggio qualificazione')
      router.push('/')
      return
    }

    setIsSaving(true)

    try {
      // Salva i dati di qualificazione nel backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/rank-checker-leads/${token}/qualification`,
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
        toast({
          title: "Perfetto! 🎉",
          description: "Iniziamo la tua prova gratuita",
        })
      } else {
        console.error('⚠️ Errore salvataggio qualificazione (non bloccante)')
      }
    } catch (error) {
      console.error('⚠️ Errore salvataggio qualificazione:', error)
      // Non bloccare il flusso
    } finally {
      setIsSaving(false)
      // Redirect all'onboarding
      router.push('/')
    }
  }

  const monthlyReviews = calculateMonthlyReviews()

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Torna ai risultati</span>
          </button>

          <AnimatePresence mode="wait">
            {/* STEP 1: Ha già un menu digitale? */}
            {currentStep === 'has-menu' && (
              <motion.div
                key="has-menu"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-6 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">📱</div>
                  <h1 className="text-2xl font-black text-gray-900 mb-3">
                    Perfetto, {restaurantName.split(' ')[0]}!
                  </h1>
                  <p className="text-sm text-gray-600 mb-6">
                    2 domande per personalizzare la tua strategia
                  </p>
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
                className="bg-white rounded-3xl p-6 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">💡</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
                    Saresti disposto a metterlo se ti permettesse di...
                  </h3>
                  
                  {/* Benefits Box */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-left">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span className="text-base font-bold text-gray-900">
                        Raccogliere <span className="text-green-600 text-xl">100+ recensioni</span> al mese
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <span className="text-base font-bold text-gray-900">
                        Entrare nella <span className="text-green-600 text-xl">TOP 3</span> su Google Maps
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-6">
                    (Automaticamente, senza fare nulla)
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleWillingAnswer(true)}
                    className="w-full p-5 border-2 border-green-300 bg-green-50 rounded-2xl hover:border-green-500 hover:bg-green-100 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🚀</div>
                        <span className="font-bold text-gray-900 text-lg">Sì, assolutamente!</span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-green-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <button
                    onClick={() => handleWillingAnswer(false)}
                    className="w-full p-5 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🤔</div>
                        <span className="font-bold text-gray-900 text-lg">No, preferisco di no</span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:translate-x-1 transition-transform" />
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
                className="bg-white rounded-3xl p-6 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">
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
                        className={`py-3 px-3 rounded-xl text-sm font-bold transition-all ${
                          dailyCovers === num.toString()
                            ? 'bg-[#1B9AAA] text-white scale-105'
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
                className="bg-white rounded-3xl p-6 shadow-2xl space-y-6"
              >
                {/* Box Recensioni */}
                <div className="bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] rounded-3xl p-8 text-white text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  >
                    <div className="text-6xl mb-3">⭐</div>
                    <div className="text-7xl font-black mb-3">
                      {monthlyReviews}
                    </div>
                    <div className="text-2xl font-bold opacity-90 mb-3">
                      Recensioni al mese
                    </div>
                  </motion.div>
                  
                  <div className="text-sm opacity-80 bg-white/10 rounded-xl p-4">
                    Con {dailyCovers} coperti/giorno, il tuo ristorante può generare questo numero di recensioni
                  </div>
                </div>

                {/* Messaggio finale in base alle risposte */}
                {hasDigitalMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-50 border-2 border-green-200 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Sparkles className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-black text-gray-900 mb-3 text-xl">
                          Sei già pronto! 🎉
                        </h4>
                        <p className="text-base text-gray-700 leading-relaxed">
                          Hai già un menu digitale. Con MenuChat puoi <strong>trasformarlo in una macchina di recensioni</strong> e ottenere quelle <strong className="text-green-600">{monthlyReviews} recensioni mensili</strong> che ti faranno <strong>scalare la classifica di Google</strong>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!hasDigitalMenu && willingToAdoptMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <Sparkles className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-black text-gray-900 mb-3 text-xl">
                          Lo creiamo noi per te! 🚀
                        </h4>
                        <p className="text-base text-gray-700 leading-relaxed mb-4">
                          Non hai ancora un menu digitale? <strong>Nessun problema!</strong>
                        </p>
                        <div className="bg-white rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-3 text-base">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="font-bold text-gray-900">Lo creiamo noi GRATIS nella prova</span>
                          </div>
                          <div className="flex items-center gap-3 text-base">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="font-bold text-gray-900">Nessun impegno</span>
                          </div>
                          <div className="flex items-center gap-3 text-base">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="font-bold text-gray-900">Inizi subito a prendere recensioni</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!hasDigitalMenu && !willingToAdoptMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-7 h-7 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-black text-gray-900 mb-3 text-xl">
                          Stai perdendo {monthlyReviews} recensioni al mese! 😰
                        </h4>
                        <p className="text-base text-gray-700 leading-relaxed mb-4">
                          Senza un menu digitale collegato a WhatsApp, <strong>ogni mese perdi {monthlyReviews} potenziali recensioni</strong> che i tuoi competitor stanno raccogliendo.
                        </p>
                        <div className="p-4 bg-white rounded-xl border-2 border-orange-300">
                          <p className="text-sm text-gray-600 mb-2">In 6 mesi perderai:</p>
                          <p className="text-4xl font-black text-orange-600 mb-2">
                            {monthlyReviews * 6} recensioni
                          </p>
                          <p className="text-sm text-gray-600">
                            Mentre loro salgono nella classifica...
                          </p>
                          <p className="text-base font-bold text-orange-700 mt-3">
                            Tu scendi. 📉
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CTA Finale */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <CustomButton
                    onClick={handleFinalCTA}
                    disabled={isSaving}
                    className="w-full h-16 text-lg font-black"
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

                  <p className="text-sm text-center text-gray-500 mt-3">
                    🔒 Nessuna carta richiesta • Cancelli quando vuoi
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

