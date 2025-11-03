"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, Sparkles, Lock } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { useToast } from "@/hooks/use-toast"

interface LeadCaptureFormProps {
  onSubmit: (email: string, phone: string) => Promise<void>
  restaurantName: string
  isLoading?: boolean
}

export function LeadCaptureForm({ onSubmit, restaurantName, isLoading = false }: LeadCaptureFormProps) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const isFormValid = email.trim().length > 0 && 
                     email.includes('@') && 
                     phone.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isFormValid) return

    setIsSubmitting(true)

    try {
      // Aspetta che onSubmit sia completato (include salvataggio lead + Email #1)
      await onSubmit(email, phone)
      
    } catch (error) {
      console.error('Errore:', error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova.",
        variant: "destructive"
      })
      setIsSubmitting(false) // Reset solo in caso di errore
    }
    // NON resettiamo isSubmitting qui - lo fa il parent quando finisce
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header con mascotte */}
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex-1 min-w-0">
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 px-2.5 sm:px-3 py-1.5 rounded-full mb-2 sm:mb-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#1B9AAA]" />
              <span className="text-xs font-bold text-[#1B9AAA] uppercase tracking-wide">
                Quasi fatto!
              </span>
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-2 leading-tight">
              Sblocca il Report Completo
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Inserisci i tuoi dati per vedere l'analisi dettagliata di <span className="font-bold">{restaurantName}</span>
            </p>
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl sm:text-4xl flex-shrink-0"
          >
            🎁
          </motion.div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#1B9AAA]" />
              Email
            </label>
            <input
              type="email"
              placeholder="tua@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1B9AAA] focus:ring-2 focus:ring-[#1B9AAA]/20 outline-none transition"
            />
          </div>

          {/* Campo Telefono */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1B9AAA]" />
              Numero di Telefono
            </label>
            <input
              type="tel"
              placeholder="+39 123 456 7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1B9AAA] focus:ring-2 focus:ring-[#1B9AAA]/20 outline-none transition"
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              I tuoi dati sono al sicuro. Non li condivideremo mai con terze parti.
            </p>
          </div>

          {/* Submit Button */}
          <CustomButton
            type="submit"
            disabled={!isFormValid || isSubmitting || isLoading}
            className="w-full h-12 sm:h-14 text-sm sm:text-base font-extrabold"
          >
            {(isSubmitting || isLoading) ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⚡
                </motion.div>
                <span className="text-xs sm:text-sm">
                  Generazione report in corso...
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                MOSTRA IL MIO REPORT
              </span>
            )}
          </CustomButton>
          
          {/* Loading Message */}
          {(isSubmitting || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl"
            >
              <p className="text-xs text-blue-800 text-center leading-relaxed">
                ⏱️ Stiamo analizzando il tuo ristorante e preparando il report personalizzato. Ci vorranno circa 3-5 secondi...
              </p>
            </motion.div>
          )}
        </form>

        {/* Benefici */}
        <div className="mt-5 sm:mt-6 space-y-2">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3">
            Cosa riceverai:
          </p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold text-xs">✓</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Ranking completo su Google Maps</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold text-xs">✓</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Mappa interattiva con competitor</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold text-xs">✓</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Analisi dettagliata coperti persi</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold text-xs">✓</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Consigli per migliorare il ranking</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

