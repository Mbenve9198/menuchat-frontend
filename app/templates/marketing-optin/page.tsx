"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Settings,
  Sparkles,
  Eye,
  Users,
  UserCheck,
  UserX,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Wand2,
  ArrowRight
} from "lucide-react"
import Image from "next/image"
import { CustomButton } from "@/components/ui/custom-button"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import BubbleBackground from "@/components/bubble-background"

interface OptinMessage {
  title: string
  message: string
  acceptButton: string
  skipButton: string
}

interface OptinConfig {
  enabled: boolean
  messages: Record<string, OptinMessage>
  stats: {
    totalViews: number
    totalOptins: number
    totalSkips: number
  }
}

// Componente per l'anteprima del dialog
function OptinPreview({ 
  message, 
  restaurantName = "Il Tuo Ristorante",
  restaurantPhoto = "",
  customerName = "Marco"
}: { 
  message: OptinMessage, 
  restaurantName?: string,
  restaurantPhoto?: string,
  customerName?: string
}) {
  const [isChecked, setIsChecked] = useState(false)

  // Personalizza il messaggio con nome cliente e ristorante
  const personalizedMessage = message.message
    .replace(/\{customerName\}/g, customerName)
    .replace(/\{restaurantName\}/g, restaurantName)

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white p-4 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {/* Header con logo ristorante */}
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-3">
            {restaurantPhoto ? (
              <img 
                src={restaurantPhoto} 
                alt={restaurantName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {restaurantName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{restaurantName}</h3>
            <p className="text-xs text-gray-500">MenuChat</p>
          </div>
        </div>

        {/* Saluto personalizzato */}
        <div className="text-center mb-3">
          <p className="text-sm text-gray-700">Ciao <span className="font-semibold text-blue-600">{customerName}</span>!</p>
        </div>

        {/* Titolo */}
        <h1 className="text-lg font-bold text-gray-900 mb-3 text-center">
          {message.title}
        </h1>

        {/* Messaggio personalizzato */}
        <p className="text-gray-700 mb-4 text-center leading-relaxed text-sm">
          {personalizedMessage}
        </p>

        {/* Nota sulla revoca del consenso */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 text-center">
            ℹ️ Potrai revocare il consenso in qualsiasi momento cliccando il pulsante "Unsubscribe" nei messaggi promozionali.
          </p>
        </div>

        {/* Pulsanti */}
        <div className="flex flex-col gap-2">
          <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center">
            <ArrowRight className="w-3 h-3 mr-2" />
            {message.acceptButton}
          </button>
          
          <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm">
            {message.skipButton}
          </button>
        </div>

        {/* Footer informativo */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Potrai sempre modificare le tue preferenze
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MarketingOptinPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [config, setConfig] = useState<OptinConfig>({
    enabled: false,
    messages: {},
    stats: {
      totalViews: 0,
      totalOptins: 0,
      totalSkips: 0
    }
  })
  
  const [currentLanguage, setCurrentLanguage] = useState("it")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [restaurantName, setRestaurantName] = useState("Il Tuo Ristorante")
  const [restaurantPhoto, setRestaurantPhoto] = useState("")
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  const restaurantId = session?.user?.restaurantId

  // Lingue disponibili
  const availableLanguages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }

    if (status === "authenticated" && restaurantId) {
      fetchConfig()
      fetchRestaurantInfo()
    }
  }, [status, restaurantId])

  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/marketing-optin?restaurantId=${restaurantId}`)
      const data = await response.json()
      
      console.log('📥 Fetched config from backend:', data)
      
      if (response.ok && data.success) {
        console.log('✅ Setting config:', data.config)
        console.log('📝 Messages received:', data.config.messages)
        
        // Pulisci i messaggi dai campi obsoleti
        const cleanMessages: Record<string, OptinMessage> = {};
        Object.entries(data.config.messages).forEach(([lang, message]: [string, any]) => {
          cleanMessages[lang] = {
            title: message.title || "🍽️ Prima di accedere al menu...",
            message: message.message || "Ciao {customerName}! Prima di mostrarti il delizioso menu di {restaurantName}, vorresti ricevere le nostre offerte esclusive e novità direttamente su WhatsApp? Solo contenuti di qualità, promesso! 🌟",
            acceptButton: message.acceptButton || "Accetta e Continua",
            skipButton: message.skipButton || "Continua senza accettare"
          };
        });
        
        setConfig({
          ...data.config,
          messages: cleanMessages
        });
      } else {
        console.error('❌ Failed to fetch config:', data)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast({
        title: "Errore",
        description: "Impossibile caricare la configurazione",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRestaurantInfo = async () => {
    try {
      const response = await fetch(`/api/restaurants?restaurantId=${restaurantId}&profileImage=true`)
      const data = await response.json()
      
      if (data.success) {
        if (data.name) setRestaurantName(data.name)
        if (data.profileImage) setRestaurantPhoto(data.profileImage)
      }
    } catch (error) {
      console.error('Error fetching restaurant info:', error)
    }
  }

  const saveConfig = async () => {
    try {
      setIsSaving(true)
      
      console.log('💾 Saving config to backend:', config)
      console.log('📝 Messages being saved:', config.messages)
      
      const response = await fetch('/api/marketing-optin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          config
        }),
      })

      const data = await response.json()
      
      console.log('📤 Save response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nel salvare la configurazione')
      }

      toast({
        title: "Configurazione salvata!",
        description: "Le impostazioni dell'opt-in marketing sono state aggiornate",
      })
    } catch (error) {
      console.error('Error saving config:', error)
      toast({
        title: "Errore nel salvare",
        description: error instanceof Error ? error.message : "Impossibile salvare la configurazione",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt richiesto",
        description: "Inserisci una descrizione di cosa vorresti comunicare",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGeneratingAi(true)
      const response = await fetch('/api/marketing-optin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          prompt: aiPrompt,
          language: currentLanguage,
          restaurantName
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nella generazione AI')
      }

      // Aggiorna il messaggio per la lingua corrente
      setConfig(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [currentLanguage]: data.message
        }
      }))

      setShowAiDialog(false)
      setAiPrompt("")
      
      toast({
        title: "Messaggio generato!",
        description: "Il messaggio è stato creato con l'AI",
      })
    } catch (error) {
      console.error('Error generating with AI:', error)
      toast({
        title: "Errore nella generazione",
        description: error instanceof Error ? error.message : "Impossibile generare il messaggio",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const updateMessage = (field: keyof OptinMessage, value: string) => {
    setConfig(prev => {
      // Ottieni il messaggio esistente o crea uno nuovo con i valori di default
      const currentMessage = prev.messages[currentLanguage] || {
        title: "🍽️ Prima di accedere al menu...",
        message: "Ciao {customerName}! Prima di mostrarti il delizioso menu di {restaurantName}, vorresti ricevere le nostre offerte esclusive e novità direttamente su WhatsApp? Solo contenuti di qualità, promesso! 🌟",
        acceptButton: "Accetta e Continua",
        skipButton: "Continua senza accettare"
      };

      // Crea il nuovo messaggio pulito senza campi obsoleti
      const cleanMessage = {
        title: currentMessage.title,
        message: currentMessage.message,
        acceptButton: currentMessage.acceptButton,
        skipButton: currentMessage.skipButton,
        [field]: value
      };

      return {
        ...prev,
        messages: {
          ...prev.messages,
          [currentLanguage]: cleanMessage
        }
      };
    });
  }

  const getCurrentMessage = (): OptinMessage => {
    // Se abbiamo un messaggio per la lingua corrente, usalo
    if (config.messages[currentLanguage]) {
      return config.messages[currentLanguage];
    }
    
    // Se abbiamo un messaggio in italiano, usalo come fallback
    if (config.messages.it) {
      return config.messages.it;
    }
    
    // Solo se non abbiamo nessun messaggio dal backend, usa i default aggiornati
    return {
      title: "🍽️ Prima di accedere al menu...",
      message: "Ciao {customerName}! Prima di mostrarti il delizioso menu di {restaurantName}, vorresti ricevere le nostre offerte esclusive e novità direttamente su WhatsApp? Solo contenuti di qualità, promesso! 🌟",
      acceptButton: "Accetta e Continua",
      skipButton: "Continua senza accettare"
    };
  }

  const getConversionRate = () => {
    const { totalViews, totalOptins } = config.stats
    if (totalViews === 0) return 0
    return Math.round((totalOptins / totalViews) * 100)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200 pb-24">
      <BubbleBackground />
      
      {/* Dialog per generazione AI */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-500" />
              Genera con AI
            </DialogTitle>
            <DialogDescription>
              Descrivi cosa vorresti comunicare ai tuoi clienti e l'AI creerà un messaggio accattivante
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">La tua idea</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Es: Voglio offrire uno sconto del 10% sui primi piatti per chi si iscrive..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Suggerimenti:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Offri uno sconto o promozione speciale</li>
                    <li>• Anticipa nuovi piatti o eventi</li>
                    <li>• Crea un senso di esclusività</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <CustomButton
              variant="outline"
              onClick={() => setShowAiDialog(false)}
            >
              Annulla
            </CustomButton>
            <CustomButton 
              onClick={generateWithAI}
              disabled={isGeneratingAi || !aiPrompt.trim()}
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Genera
                </>
              )}
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <CustomButton
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Indietro
              </CustomButton>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1B9AAA]">Opt-in Marketing</h1>
                <p className="text-gray-700">Configura il dialog per raccogliere consensi marketing</p>
              </div>
            </div>
            <div className="relative w-8 h-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
                alt="Mascot"
                width={32}
                height={32}
                className="absolute -top-1 -right-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pannello di configurazione */}
            <div className="space-y-6">
              {/* Toggle principale */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Funzionalità Opt-in</h3>
                    <p className="text-sm text-gray-600">Attiva il dialog per i menu con URL esterni</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.enabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                {config.enabled && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700">
                        Il dialog apparirà prima dei menu con URL esterni
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Statistiche */}
              {config.enabled && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Eye className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-blue-700">{config.stats.totalViews}</div>
                      <div className="text-xs text-blue-600">Visualizzazioni</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <UserCheck className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-green-700">{config.stats.totalOptins}</div>
                      <div className="text-xs text-green-600">Opt-in</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <UserX className="w-6 h-6 text-red-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-red-700">{config.stats.totalSkips}</div>
                      <div className="text-xs text-red-600">Skip</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Users className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-purple-700">{getConversionRate()}%</div>
                      <div className="text-xs text-purple-600">Conversione</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurazione messaggi */}
              {config.enabled && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Personalizza Messaggi</h3>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAiDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Genera con AI
                    </CustomButton>
                  </div>

                  {/* Tab lingue */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {availableLanguages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setCurrentLanguage(lang.code)}
                        className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                          currentLanguage === lang.code 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        {lang.code}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titolo</Label>
                      <Input
                        id="title"
                        value={getCurrentMessage().title}
                        onChange={(e) => updateMessage('title', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Messaggio</Label>
                      <Textarea
                        id="message"
                        value={getCurrentMessage().message}
                        onChange={(e) => updateMessage('message', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="accept">Pulsante Accetta</Label>
                      <Input
                        id="accept"
                        value={getCurrentMessage().acceptButton}
                        onChange={(e) => updateMessage('acceptButton', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="skip">Pulsante Rifiuto</Label>
                      <Input
                        id="skip"
                        value={getCurrentMessage().skipButton}
                        onChange={(e) => updateMessage('skipButton', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pulsante salva */}
              <CustomButton
                onClick={saveConfig}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Salva Configurazione
                  </>
                )}
              </CustomButton>
            </div>

            {/* Anteprima */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Anteprima Dialog</h3>
                <div className="bg-gray-100 p-6 rounded-xl">
                  <OptinPreview 
                    message={getCurrentMessage()}
                    restaurantName={restaurantName}
                    restaurantPhoto={restaurantPhoto}
                  />
                </div>
              </div>

              {config.enabled && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-2">Come funziona:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Il dialog appare solo per menu con URL esterni</li>
                        <li>• I clienti possono scegliere di ricevere offerte</li>
                        <li>• Le preferenze vengono salvate per ogni contatto</li>
                        <li>• Compatibile con GDPR e privacy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 