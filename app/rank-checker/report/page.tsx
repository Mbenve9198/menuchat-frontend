'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GMBFullReport } from '@/components/rank-checker/gmb-full-report'
import { useToast } from '@/hooks/use-toast'
import { CustomButton } from '@/components/ui/custom-button'
import { ArrowLeft } from 'lucide-react'

/**
 * Pagina DEDICATA per visualizzare il Report GMB Completo
 * Accessibile SOLO dopo qualificazione o tramite link email
 */

function LoadingStep({ text, delay = 0 }: { text: string; delay?: number }) {
  const [show, setShow] = useState(delay === 0)

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShow(true), delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [delay])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={show ? { opacity: 1, x: 0 } : {}}
      className="flex items-center gap-2 text-sm text-gray-700"
    >
      {show && (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>{text}</span>
        </>
      )}
    </motion.div>
  )
}

function ReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [gmbAuditData, setGmbAuditData] = useState<any>(null)
  const [restaurantName, setRestaurantName] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    loadGMBReport()
  }, [])

  const loadGMBReport = async () => {
    try {
      // Ottieni token da URL o localStorage
      const tokenFromUrl = searchParams.get('token')
      const tokenFromStorage = localStorage.getItem('rank_checker_token')
      const accessToken = tokenFromUrl || tokenFromStorage

      if (!accessToken) {
        toast({
          title: "Accesso Negato",
          description: "Token di accesso mancante. Completa prima l'analisi.",
          variant: "destructive"
        })
        router.push('/rank-checker')
        return
      }

      // Salva token se arriva da URL (per link email)
      if (tokenFromUrl && !tokenFromStorage) {
        localStorage.setItem('rank_checker_token', tokenFromUrl)
      }

      console.log('📊 Caricamento report GMB...', accessToken)

      // Fetch del report GMB
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://backend.menuchat.it'}/api/rank-checker/gmb-audit/${accessToken}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const result = await response.json()

      console.log('📊 Response:', result)

      if (!result.success) {
        throw new Error(result.error || 'Errore caricamento report')
      }

      if (result.status === 'not_started') {
        toast({
          title: "Report Non Disponibile",
          description: "Devi prima completare la qualificazione per sbloccare il report GMB.",
          variant: "destructive"
        })
        router.push('/rank-checker/qualify')
        return
      }

      if (result.status === 'processing') {
        toast({
          title: "Elaborazione in Corso",
          description: "Il tuo report GMB è in elaborazione. Riprova tra 1 minuto.",
        })
        // Riprova dopo 10 secondi
        setTimeout(() => {
          loadGMBReport()
        }, 10000)
        return
      }

      if (result.status === 'completed' && result.audit) {
        setGmbAuditData(result.audit)
        setRestaurantName(result.audit.summary?.restaurantName || 'il tuo ristorante')
        setIsLoading(false)
        console.log('✅ Report GMB caricato')
      } else {
        throw new Error('Report non disponibile')
      }

    } catch (error: any) {
      console.error('❌ Errore caricamento report:', error)
      setError(true)
      setIsLoading(false)
      toast({
        title: "Errore",
        description: error.message || "Impossibile caricare il report GMB",
        variant: "destructive"
      })
    }
  }

  const handleBookCall = async () => {
    // Redirect alla sezione di booking chiamata nella pagina qualify
    router.push('/rank-checker/qualify?scrollTo=call-preference')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEF7F0] via-white to-[#F0F9FF] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Report Non Disponibile
          </h2>
          <p className="text-gray-600 mb-6">
            Non siamo riusciti a caricare il tuo report GMB. Potrebbe non essere ancora pronto o il link potrebbe essere errato.
          </p>
          <CustomButton
            onClick={() => router.push('/rank-checker')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna all'Analisi Base
          </CustomButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF7F0] via-white to-[#F0F9FF]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🔍
            </motion.div>
            
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Caricamento Report GMB...
            </h2>
            
            <div className="space-y-3 mb-6">
              <LoadingStep text="Recupero dati del tuo profilo Google Maps..." />
              <LoadingStep text="Caricamento confronto competitor..." delay={1} />
              <LoadingStep text="Preparazione insights AI..." delay={2} />
              <LoadingStep text="Finalizzazione piano d'azione..." delay={3} />
            </div>

            <p className="text-sm text-gray-600">
              ⏱️ Ci vorranno pochi secondi...
            </p>
          </motion.div>
        ) : (
          <>
            {/* Header con Back Button */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/rank-checker')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Torna all'Analisi Base
              </button>
            </div>

            {/* Report GMB Completo */}
            {gmbAuditData && (
              <GMBFullReport
                audit={gmbAuditData}
                onBookCall={handleBookCall}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function GMBReportPage() {
  return (
    <ReportContent />
  )
}

