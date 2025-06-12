"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"

interface OptinMessage {
  title: string
  message: string
  checkboxText: string
  continueButton: string
  skipButton: string
}

interface RestaurantInfo {
  name: string
  profileImage?: string
}

export default function OptinPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const restaurantId = params.restaurantId as string
  const menuUrl = searchParams.get('menuUrl')
  const phoneNumber = searchParams.get('phone')
  const language = searchParams.get('lang') || 'it'
  
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<OptinMessage | null>(null)
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (restaurantId) {
      fetchOptinData()
      trackView()
    }
  }, [restaurantId])

  const fetchOptinData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch configurazione opt-in
      const optinResponse = await fetch(`/api/marketing-optin?restaurantId=${restaurantId}`)
      const optinData = await optinResponse.json()
      
      if (!optinResponse.ok || !optinData.success) {
        throw new Error('Configurazione opt-in non trovata')
      }

      // Se l'opt-in non è abilitato, reindirizza direttamente al menu
      if (!optinData.config.enabled) {
        redirectToMenu()
        return
      }

      // Ottieni il messaggio per la lingua corrente
      const messages = optinData.config.messages
      const currentMessage = messages[language] || messages['it'] || messages[Object.keys(messages)[0]]
      
      if (!currentMessage) {
        throw new Error('Messaggio non trovato per la lingua specificata')
      }
      
      setMessage(currentMessage)
      
      // Fetch info ristorante
      const restaurantResponse = await fetch(`/api/restaurants?restaurantId=${restaurantId}&profileImage=true`)
      const restaurantData = await restaurantResponse.json()
      
      if (restaurantData.success) {
        setRestaurant({
          name: restaurantData.name || 'Ristorante',
          profileImage: restaurantData.profileImage
        })
      }
      
    } catch (error) {
      console.error('Error fetching optin data:', error)
      setError('Impossibile caricare la pagina')
      // In caso di errore, reindirizza al menu dopo 3 secondi
      setTimeout(() => {
        redirectToMenu()
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const trackView = async () => {
    try {
      await fetch('/api/marketing-optin/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          phoneNumber: phoneNumber || 'anonymous',
          action: 'view',
          ipAddress: null, // Verrà popolato dal server se necessario
          userAgent: navigator.userAgent
        }),
      })
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  const handleSubmit = async (optinChoice: boolean) => {
    if (!message || !restaurant) return
    
    try {
      setIsSubmitting(true)
      
      // Traccia la scelta dell'utente
      await fetch('/api/marketing-optin/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          phoneNumber: phoneNumber || 'anonymous',
          action: optinChoice ? 'optin' : 'skip',
          ipAddress: null,
          userAgent: navigator.userAgent
        }),
      })
      
      // Reindirizza al menu
      redirectToMenu()
      
    } catch (error) {
      console.error('Error submitting choice:', error)
      // Anche in caso di errore, reindirizza al menu
      redirectToMenu()
    }
  }

  const redirectToMenu = () => {
    if (menuUrl) {
      window.location.href = menuUrl
    } else {
      // Fallback se non c'è URL del menu
      router.push('/')
    }
  }

  const handleContinue = () => {
    if (isChecked) {
      handleSubmit(true)
    }
  }

  const handleSkip = () => {
    handleSubmit(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Reindirizzamento al menu in corso...</p>
        </div>
      </div>
    )
  }

  if (!message || !restaurant) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        {/* Header con logo ristorante */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-4">
            {restaurant.profileImage ? (
              <img 
                src={restaurant.profileImage} 
                alt={restaurant.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {restaurant.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{restaurant.name}</h3>
            <p className="text-sm text-gray-500">MenuChat</p>
          </div>
        </div>

        {/* Titolo */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-4 text-center"
        >
          {message.title}
        </motion.h1>

        {/* Messaggio */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-700 mb-8 text-center leading-relaxed"
        >
          {message.message}
        </motion.p>

        {/* Checkbox */}
        <motion.label
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-start space-x-3 mb-8 cursor-pointer"
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              isChecked 
                ? 'bg-green-500 border-green-500 scale-110' 
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              {isChecked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>
          </div>
          <span className="text-gray-700 leading-tight">
            {message.checkboxText}
          </span>
        </motion.label>

        {/* Pulsanti */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <CustomButton
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1"
          >
            {message.skipButton}
          </CustomButton>
          
          <CustomButton
            onClick={handleContinue}
            disabled={!isChecked || isSubmitting}
            className={`flex-1 transition-all duration-200 ${
              isChecked 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {message.continueButton}
          </CustomButton>
        </motion.div>

        {/* Footer informativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Puoi modificare le tue preferenze in qualsiasi momento
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 