"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink
} from "lucide-react"
import Image from "next/image"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"

interface OptinMessage {
  title: string
  message: string
}

interface RestaurantInfo {
  name: string
  profileImage?: string
}

interface PrivacyPolicyConfig {
  enabled: boolean
  type: 'url' | 'pdf'
  url: string
  linkText: Record<string, string>
}

export default function OptinPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const restaurantId = params.restaurantId as string
  const menuUrl = searchParams.get('menuUrl')
  const phoneNumber = searchParams.get('phone')
  const customerName = searchParams.get('customerName') || 'Cliente'
  const language = searchParams.get('lang') || 'it'
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<OptinMessage | null>(null)
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null)
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicyConfig | null>(null)
  const [customProfileImage, setCustomProfileImage] = useState<string | null>(null)
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
      
      // Fetch configurazione opt-in (endpoint pubblico)
      const optinResponse = await fetch(`/api/marketing-optin/public?restaurantId=${restaurantId}`)
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
      
      // Ottieni la configurazione della privacy policy se abilitata
      if (optinData.config.privacyPolicy?.enabled && optinData.config.privacyPolicy?.url) {
        setPrivacyPolicy(optinData.config.privacyPolicy)
      }
      
      // Ottieni la foto profilo personalizzata se presente
      if (optinData.config.customProfileImage) {
        setCustomProfileImage(optinData.config.customProfileImage)
      }
      
      // Fetch info ristorante pubbliche
      try {
        const restaurantResponse = await fetch(`/api/restaurants?restaurantId=${restaurantId}&profileImage=true`)
        const restaurantData = await restaurantResponse.json()
        
        if (restaurantData.success) {
          setRestaurant({
            name: restaurantData.name || 'Ristorante',
            profileImage: restaurantData.profileImage
          })
        }
      } catch (error) {
        console.error('Error fetching restaurant info:', error)
        // Fallback con nome generico se non riesce a caricare
        setRestaurant({
          name: 'Ristorante',
          profileImage: undefined
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

  const handleAccept = () => {
    handleSubmit(true)
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

  // Testi dei pulsanti hardcoded per lingua
  const buttonTexts = {
    it: { accept: "Accetta e Continua", skip: "Continua senza accettare" },
    en: { accept: "Accept and Continue", skip: "Continue without accepting" },
    es: { accept: "Aceptar y Continuar", skip: "Continuar sin aceptar" },
    fr: { accept: "Accepter et Continuer", skip: "Continuer sans accepter" },
    de: { accept: "Akzeptieren und Weiter", skip: "Ohne Akzeptieren fortfahren" }
  };

  const buttons = buttonTexts[language as keyof typeof buttonTexts] || buttonTexts.it;

  // Personalizza il messaggio con nome cliente e ristorante
  const personalizedMessage = message.message
    .replace(/\{customerName\}/g, customerName)
    .replace(/\{restaurantName\}/g, restaurant.name)

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
            {/* Usa foto personalizzata optin se presente, altrimenti quella generale */}
            {(customProfileImage || restaurant.profileImage) ? (
              <img 
                src={customProfileImage || restaurant.profileImage} 
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

        {/* Saluto personalizzato */}
        {customerName !== 'Cliente' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-4"
          >
            <p className="text-lg text-gray-700">Ciao <span className="font-semibold text-blue-600">{customerName}</span>!</p>
          </motion.div>
        )}

        {/* Titolo */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-4 text-center"
        >
          {message.title}
        </motion.h1>

        {/* Messaggio personalizzato */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-700 mb-6 text-center leading-relaxed"
        >
          {personalizedMessage}
        </motion.p>

        {/* Nota sulla revoca del consenso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-gray-600 text-center">
            ℹ️ Potrai revocare il consenso in qualsiasi momento cliccando il pulsante "Unsubscribe" nei messaggi promozionali.
          </p>
        </motion.div>

        {/* Pulsanti */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <CustomButton
            onClick={handleAccept}
            disabled={isSubmitting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2 text-black" />
            )}
            {buttons.accept}
          </CustomButton>
          
          <CustomButton
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full"
          >
            {buttons.skip}
          </CustomButton>
        </motion.div>

        {/* Privacy Policy Link */}
        {privacyPolicy?.enabled && privacyPolicy.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center"
          >
            <a 
              href={privacyPolicy.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center justify-center gap-1"
            >
              {privacyPolicy.type === 'pdf' ? (
                <FileText className="w-3 h-3" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
              {privacyPolicy.linkText[language] || privacyPolicy.linkText['it'] || 'Privacy Policy'}
            </a>
          </motion.div>
        )}

        {/* Footer informativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Potrai sempre modificare le tue preferenze
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 