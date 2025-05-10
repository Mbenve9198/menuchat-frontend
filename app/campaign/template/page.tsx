"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Link as LinkIcon,
  Phone,
  Loader2,
  Languages,
  Ban,
  Clock,
  Calendar
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CampaignTemplatePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedCount, setSelectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generatingText, setGeneratingText] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  
  // Template data
  const [templateText, setTemplateText] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imagePrompt, setImagePrompt] = useState("")
  const [ctaType, setCtaType] = useState<"url" | "phone">("url")
  const [ctaValue, setCtaValue] = useState("")
  const [ctaText, setCtaText] = useState("")
  const [languageCode, setLanguageCode] = useState("it")
  
  // Mock delle lingue disponibili (basato sui contatti selezionati)
  const availableLanguages = [
    { code: "it", name: "Italiano" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" }
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    // Recupera i contatti selezionati dal local storage
    const storedIds = localStorage.getItem("selectedContactIds")
    if (storedIds) {
      const ids = JSON.parse(storedIds)
      setSelectedIds(ids)
      setSelectedCount(ids.length)
    } else {
      // Se non ci sono contatti selezionati, torna alla pagina precedente
      router.push("/campaign")
    }
    
    setLoading(false)
  }, [router])

  const generateTextWithAI = async () => {
    try {
      setGeneratingText(true)
      
      // In produzione, questa chiamata andrebbe all'API che utilizza Claude 3.7
      const response = await fetch("/api/generate-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantId: session?.user?.restaurantId,
          language: languageCode,
          contactCount: selectedCount
        })
      })
      
      if (!response.ok) {
        throw new Error("Errore nella generazione del testo")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTemplateText(data.text)
        // Se l'AI genera anche il testo del CTA, lo impostiamo
        if (data.ctaText) {
          setCtaText(data.ctaText)
        }
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }
    } catch (error) {
      console.error("Error generating text:", error)
      toast({
        title: "Errore",
        description: "Impossibile generare il testo con l'AI",
        variant: "destructive",
      })
    } finally {
      setGeneratingText(false)
    }
  }

  const generateImageWithAI = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Prompt richiesto",
        description: "Inserisci un prompt per generare l'immagine",
        variant: "destructive",
      })
      return
    }
    
    try {
      setGeneratingImage(true)
      
      // In produzione, questa chiamata andrebbe all'API che utilizza OpenAI DALL-E
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          restaurantId: session?.user?.restaurantId
        })
      })
      
      if (!response.ok) {
        throw new Error("Errore nella generazione dell'immagine")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSelectedImage(data.imageUrl)
      } else {
        throw new Error(data.error || "Errore sconosciuto")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Errore",
        description: "Impossibile generare l'immagine con OpenAI",
        variant: "destructive",
      })
    } finally {
      setGeneratingImage(false)
    }
  }

  const handleNextStep = () => {
    if (!templateText.trim()) {
      toast({
        title: "Testo richiesto",
        description: "Inserisci il testo del messaggio",
        variant: "destructive",
      })
      return
    }
    
    if (!ctaText.trim() || !ctaValue.trim()) {
      toast({
        title: "CTA incompleto",
        description: "Compila tutti i campi della call-to-action",
        variant: "destructive",
      })
      return
    }
    
    // Salva i dati del template
    const templateData = {
      text: templateText,
      image: selectedImage,
      ctaType,
      ctaValue,
      ctaText,
      language: languageCode
    }
    
    localStorage.setItem("campaignTemplateData", JSON.stringify(templateData))
    router.push("/campaign/schedule")
  }

  // Per il mockup WhatsApp
  const WhatsAppMockup = () => {
    return (
      <div className="flex justify-center my-4">
        <div className="w-[320px] border-[8px] border-gray-800 rounded-3xl overflow-hidden shadow-xl bg-white relative">
          {/* Notch superiore */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-gray-800 rounded-b-lg z-10"></div>
          
          {/* Barra superiore */}
          <div className="bg-[#075E54] text-white p-3 pt-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M10 0a10 10 0 100 20 10 10 0 000-20zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-semibold truncate max-w-[180px]">Ristorante</div>
                <div className="text-xs opacity-80">online</div>
              </div>
            </div>
          </div>
          
          {/* Corpo chat */}
          <div className="bg-[#E5DDD5] h-[320px] p-3 overflow-y-auto" style={{ 
            backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')",
            backgroundRepeat: "repeat"
          }}>
            <div className="flex flex-col gap-3">
              {/* Data */}
              <div className="flex justify-center mb-1">
                <div className="bg-white bg-opacity-80 px-2 py-1 rounded-lg text-[10px] text-gray-500">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              
              {/* Messaggio del ristorante */}
              <div className="self-start max-w-[85%]">
                <div className="bg-white p-3 rounded-lg shadow-sm relative">
                  {/* Se c'è un'immagine selezionata, mostrala */}
                  {selectedImage && (
                    <div className="mb-2">
                      <img src={selectedImage} alt="Campaign" className="w-full rounded-md" />
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{templateText || "Il testo del messaggio apparirà qui"}</p>
                  
                  {/* Call to Action */}
                  {ctaText && (
                    <div className="mt-2 border-t pt-2">
                      <div className="flex justify-center w-full">
                        <button className="bg-[#e9f2fd] text-[#127def] text-xs py-1 px-3 rounded-3xl font-medium">
                          {ctaText}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-right mt-1">
                    <span className="text-[10px] text-gray-500">{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Barra inferiore */}
          <div className="bg-[#F0F0F0] p-2">
            <div className="flex items-center">
              <div className="flex-grow bg-white rounded-full px-3 py-2 flex items-center">
                <span className="text-gray-400 text-sm">Type a message</span>
              </div>
              <div className="ml-2 w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1B9AAA]"></div>
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200 pb-20">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-6">
        {/* Header Section */}
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => router.push("/campaign")}
                className="mr-3 p-2 rounded-full hover:bg-white/50"
              >
                <ArrowLeft className="w-5 h-5 text-[#1B9AAA]" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1B9AAA]">Creazione Template</h1>
                <p className="text-sm text-gray-700">
                  {selectedCount} contatti selezionati
                </p>
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

          {/* Lingua del Messaggio */}
          <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
            <div className="flex items-center mb-3">
              <Languages className="w-5 h-5 text-[#1B9AAA] mr-2" />
              <h3 className="font-medium text-gray-800">Lingua del messaggio</h3>
            </div>
            
            <Select value={languageCode} onValueChange={setLanguageCode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleziona lingua" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="w-full max-w-md mb-4">
          <WhatsAppMockup />
        </div>

        {/* Tabs for Content and CTA */}
        <div className="w-full max-w-md mb-6">
          <Tabs defaultValue="message" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="message" className="text-xs sm:text-sm">
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Messaggio
              </TabsTrigger>
              <TabsTrigger value="media" className="text-xs sm:text-sm">
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Immagine
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="message" className="mt-4">
              <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-800">Testo del messaggio</h3>
                  <CustomButton 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={generateTextWithAI}
                    disabled={generatingText}
                  >
                    {generatingText ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        Genera con AI
                      </>
                    )}
                  </CustomButton>
                </div>
                
                <Textarea
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  placeholder="Scrivi il messaggio della tua campagna..."
                  className="min-h-[150px]"
                />
                
                <p className="text-xs text-gray-500">
                  Puoi usare {"{name}"} per inserire il nome del contatto nel messaggio.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="mt-4">
              <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">Immagine della campagna</h3>
                  {selectedImage && (
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="text-red-500 text-xs flex items-center"
                    >
                      <Ban className="w-3 h-3 mr-1" />
                      Rimuovi
                    </button>
                  )}
                </div>
                
                {selectedImage ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={selectedImage} 
                      alt="Campaign" 
                      className="w-full object-cover rounded-lg" 
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="image-prompt" className="text-sm font-medium">
                    Prompt per l'immagine
                  </Label>
                  <Input
                    id="image-prompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Descrivi l'immagine che vuoi generare..."
                    className="w-full"
                  />
                  
                  <CustomButton 
                    className="w-full"
                    onClick={generateImageWithAI}
                    disabled={!imagePrompt.trim() || generatingImage}
                  >
                    {generatingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando l'immagine...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Genera con OpenAI
                      </>
                    )}
                  </CustomButton>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Call to Action Section */}
        <div className="w-full max-w-md mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center mb-1">
              <h3 className="font-medium text-gray-800">Call to Action</h3>
            </div>
            
            <RadioGroup 
              value={ctaType} 
              onValueChange={(val) => setCtaType(val as "url" | "phone")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="cta-url" />
                <Label htmlFor="cta-url" className="flex items-center cursor-pointer">
                  <LinkIcon className="w-4 h-4 mr-1.5 text-blue-600" />
                  Link
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="cta-phone" />
                <Label htmlFor="cta-phone" className="flex items-center cursor-pointer">
                  <Phone className="w-4 h-4 mr-1.5 text-green-600" />
                  Telefono
                </Label>
              </div>
            </RadioGroup>
            
            <div className="space-y-3">
              <Label htmlFor="cta-value" className="text-sm font-medium">
                {ctaType === "url" ? "URL del link" : "Numero di telefono"}
              </Label>
              <Input
                id="cta-value"
                value={ctaValue}
                onChange={(e) => setCtaValue(e.target.value)}
                placeholder={ctaType === "url" ? "https://example.com" : "+39 123 456 7890"}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="cta-text" className="text-sm font-medium">
                Testo del pulsante
              </Label>
              <Input
                id="cta-text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Prenota ora"
                className="w-full"
              />
            </div>
            
            <div className="mt-2 pt-3 border-t border-gray-100">
              <div className="flex items-center">
                <input 
                  id="add-optout" 
                  type="checkbox" 
                  className="h-4 w-4 text-[#1B9AAA] focus:ring-[#1B9AAA] border-gray-300 rounded"
                  checked
                  disabled
                />
                <label htmlFor="add-optout" className="ml-2 block text-sm text-gray-600">
                  Aggiungi opzione di opt-out automatica
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Verrà aggiunto un secondo pulsante per permettere agli utenti di cancellarsi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Template
            </p>
            <p className="text-xs text-gray-500">Passo 2 di 3</p>
          </div>
          <CustomButton
            onClick={handleNextStep}
            disabled={!templateText.trim() || !ctaText.trim() || !ctaValue.trim()}
            className="flex items-center gap-1"
          >
            Avanti
            <ArrowRight className="w-4 h-4 ml-1" />
          </CustomButton>
        </div>
      </div>
    </main>
  )
} 