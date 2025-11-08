"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, Phone, Mail } from "lucide-react"
import BubbleBackground from "@/components/bubble-background"
import { CustomButton } from "@/components/ui/custom-button"

export default function ThankYouPage() {
  const router = useRouter()

  // Redirect automatico alla homepage dopo 10 secondi
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          
          <motion.div
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animazione Check */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 10
              }}
              className="mb-6"
            >
              <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-white" strokeWidth={3} />
              </div>
            </motion.div>

            {/* Titolo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">
                Richiesta Ricevuta! 🎉
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                Ti chiameremo presto per aiutarti a <span className="font-bold text-[#1B9AAA]">scalare Google Maps</span>
              </p>
            </motion.div>

            {/* Info Box */}
            <motion.div
              className="bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 rounded-2xl p-5 mb-6 border-2 border-[#1B9AAA]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-black text-gray-900 text-lg mb-2">
                Cosa Succede Ora?
              </h3>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Ti chiameremo nell'orario che hai scelto
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Analizzeremo insieme il tuo report GMB
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Ti mostreremo come arrivare in TOP 3 in 60-90 giorni
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email ricevuta */}
            <motion.div
              className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 justify-center text-sm text-blue-800">
                <Mail className="w-4 h-4" />
                <p>
                  Ti abbiamo inviato un'email di conferma
                </p>
              </div>
            </motion.div>

            {/* CTA Secondari */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <CustomButton
                onClick={() => router.push('/')}
                className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold"
              >
                <span className="flex items-center gap-2">
                  Torna alla Homepage
                  <ArrowRight className="w-4 h-4" />
                </span>
              </CustomButton>

              <button
                onClick={() => router.push('/rank-checker')}
                className="w-full py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Fai un'altra analisi
              </button>
            </motion.div>

            {/* Timer auto-redirect */}
            <motion.p
              className="text-xs text-gray-500 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Redirect automatico tra 10 secondi...
            </motion.p>
          </motion.div>

          {/* Contatto Urgente */}
          <motion.div
            className="mt-6 bg-white rounded-2xl p-4 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <p className="text-xs text-gray-600 text-center mb-3">
              Hai urgenza? Contattaci direttamente:
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="tel:+393123456789"
                className="flex items-center gap-2 text-sm font-medium text-[#1B9AAA] hover:text-[#06D6A0] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Chiama
              </a>
              <span className="text-gray-300">|</span>
              <a
                href="mailto:team@menuchat.it"
                className="flex items-center gap-2 text-sm font-medium text-[#1B9AAA] hover:text-[#06D6A0] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

