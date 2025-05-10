"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  Search,
  Check,
  Users,
  Globe,
  Sparkles,
  MessageSquare,
  ImageIcon,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import BubbleBackground from "@/components/bubble-background"
import { CustomButton } from "@/components/ui/custom-button"

// Definizione dell'interfaccia Contact
interface Contact {
  _id: string;
  name: string;
  phoneNumber: string;
  countryCode: string;
  lastVisit?: string;
  totalInteractions?: number;
  optIn: boolean;
  selected?: boolean;
}

// Country codes for filtering
const countryCodes = [
  { code: "+39", name: "Italy" },
  { code: "+1", name: "United States/Canada" },
  { code: "+34", name: "Spain" },
  { code: "+44", name: "United Kingdom" },
  { code: "+33", name: "France" },
  { code: "+49", name: "Germany" },
  { code: "+86", name: "China" },
  { code: "+52", name: "Mexico" },
  { code: "+91", name: "India" },
  { code: "+966", name: "Saudi Arabia" },
]

// Campaign types
const campaignTypes = [
  { id: "promo", name: "Promotional Offer", description: "Special discounts and limited-time offers" },
  { id: "event", name: "Event Invitation", description: "Invite customers to special events" },
  { id: "update", name: "Menu Update", description: "Announce new items or menu changes" },
  { id: "feedback", name: "Feedback Request", description: "Ask for customer opinions" },
]

// Languages
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
]

// Update the steps array to include the new step
const steps = ["Select Contacts", "Campaign Setup", "Content Creation", "Schedule & Approve"]

export default function CreateCampaign() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [allSelected, setAllSelected] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [campaignType, setCampaignType] = useState("")
  const [language, setLanguage] = useState("en")
  const [messageText, setMessageText] = useState("")
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState("")
  const [useGeneratedImage, setUseGeneratedImage] = useState(false)
  const [primaryCta, setPrimaryCta] = useState("")
  const [primaryCtaType, setPrimaryCtaType] = useState("url")
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  // Add a new state variable for campaign details/objective
  const [campaignObjective, setCampaignObjective] = useState("")
  const [imagePrompt, setImagePrompt] = useState("")
  const [showImagePromptDialog, setShowImagePromptDialog] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Recupera i contatti dal backend
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchContacts()
    }
  }, [status, session, router])
  
  const fetchContacts = async () => {
    try {
      setIsLoadingContacts(true)
      console.log("Fetching contacts for restaurant:", session?.user?.restaurantId)
      const response = await fetch(`/api/contacts?restaurantId=${session?.user?.restaurantId}`)
      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Data received:", data.success ? "success" : "failure", "contacts:", data.contacts?.length || 0)
      
      if (data.success) {
        // Aggiungiamo il campo selected a ogni contatto
        const contactsWithSelection = data.contacts.map((contact: any) => ({
          ...contact,
          selected: false,
          // Format last visit date
          lastVisit: contact.lastVisit ? formatDate(new Date(contact.lastVisit)) : 'N/A',
        }))
        
        setContacts(contactsWithSelection)
        
        // Mostra un messaggio se la risposta contiene un messaggio
        if (data.message) {
          console.log("Message from API:", data.message)
          toast({
            title: "Informazione",
            description: data.message,
            variant: "default",
          })
        }
      } else if (data.error) {
        console.error("API error:", data.error)
        toast({
          title: "Errore",
          description: data.error || "Errore durante il caricamento dei contatti",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Errore",
        description: "Impossibile caricare i contatti",
        variant: "destructive",
      })
    } finally {
      setIsLoadingContacts(false)
    }
  }
  
  // Helper per formattare la data
  const formatDate = (date: Date): string => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return "Oggi"
    } else if (diffDays === 1) {
      return "Ieri"
    } else if (diffDays < 7) {
      return `${diffDays} giorni fa`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'settimana' : 'settimane'} fa`
    } else {
      return new Date(date).toLocaleDateString()
    }
  }

  useEffect(() => {
    // Update progress based on current step
    setProgress(Math.round(((currentStep + 1) / steps.length) * 100))
  }, [currentStep])

  useEffect(() => {
    // Update selected count
    const count = contacts.filter((contact) => contact.selected).length
    setSelectedCount(count)
    setAllSelected(count === contacts.length)
  }, [contacts])

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      contact.phoneNumber.includes(searchQuery)
    
    // Ottieni il prefisso del paese dal numero di telefono
    const getPrefix = (phone: string) => {
      if (phone.startsWith('+')) {
        // Trova il primo spazio o trattino dopo il +
        const match = phone.match(/^\+(\d+)[\s-]/)
        if (match) {
          return '+' + match[1]
        }
        // Se non c'è uno spazio, prendi i primi 2-3 caratteri
        return phone.substring(0, Math.min(phone.length, 3))
      }
      return ''
    }
    
    const phonePrefix = getPrefix(contact.phoneNumber)
    const matchesCountry = !selectedCountryCode || phonePrefix === selectedCountryCode
    
    return matchesSearch && matchesCountry
  })

  const toggleSelectAll = () => {
    const newAllSelected = !allSelected
    setAllSelected(newAllSelected)
    setContacts(
      contacts.map((contact) => ({
        ...contact,
        selected: newAllSelected,
      })),
    )
  }

  const toggleContactSelection = (id: string) => {
    setContacts(contacts.map((contact) => (contact._id === id ? { ...contact, selected: !contact.selected } : contact)))
  }

  const filterByCountry = (code: string) => {
    setSelectedCountryCode(code === selectedCountryCode ? null : code)
  }

  // Funzione aggiornata per generare il testo del messaggio usando Claude 3.7
  const generateMessageText = async () => {
    setIsGeneratingText(true)
    
    try {
      // Effettua una chiamata API a Claude 3.7
      const response = await fetch("/api/generate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignType,
          language,
          objective: campaignObjective,
          restaurantId: session?.user?.restaurantId
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setMessageText(data.messageText)
        setPrimaryCta(data.cta)
        setPrimaryCtaType(data.ctaType || "url")
      } else {
        throw new Error(data.error || "Errore nella generazione del messaggio")
      }
    } catch (error) {
      console.error("Error generating message:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile generare il messaggio",
        variant: "destructive",
      })
      // Messaggio fallback in caso di errore
      setMessageText(
        campaignType === "promo"
          ? `🌟 Offerta Speciale! ${campaignObjective.trim() ? campaignObjective : "Approfitta del 20% di sconto sul tuo prossimo ordine questo weekend."}`
          : campaignType === "event"
          ? `🎉 Sei invitato! ${campaignObjective.trim() ? campaignObjective : "Partecipa al nostro evento speciale questo venerdì alle 19:00."}`
          : campaignType === "update"
          ? `🍽️ ${campaignObjective.trim() ? campaignObjective : "Il nostro menu è migliorato! Scopri i nostri 5 nuovi piatti stagionali, disponibili ora."}`
          : `👋 ${campaignObjective.trim() ? campaignObjective : "La tua opinione è importante! Com'è stata la tua recente esperienza con noi?"}`
      )
      setPrimaryCta(
        campaignType === "promo"
          ? "Ordina Ora"
          : campaignType === "event"
          ? "Prenota"
          : campaignType === "update"
          ? "Vedi Menu"
          : "Rispondi"
      )
    } finally {
      setIsGeneratingText(false)
    }
  }

  // Funzione per preparare e mostrare il prompt per la generazione dell'immagine
  const prepareImagePrompt = () => {
    // Crea un prompt basato sul tipo di campagna e sull'obiettivo
    let basePrompt = ""
    
    if (campaignType === "promo") {
      basePrompt = "Un'immagine accattivante per una promozione di un ristorante che mostra cibo delizioso con effetto sconto"
    } else if (campaignType === "event") {
      basePrompt = "Un'immagine elegante per un evento in un ristorante, con tavoli ben allestiti e un'atmosfera accogliente"
    } else if (campaignType === "update") {
      basePrompt = "Un'immagine di piatti nuovi e colorati per un aggiornamento del menu di un ristorante"
    } else if (campaignType === "feedback") {
      basePrompt = "Un'immagine che rappresenta il concetto di feedback cliente in un ristorante, con elementi visivi di valutazione"
    } else {
      basePrompt = "Un'immagine accattivante di cibo per un ristorante"
    }
    
    // Aggiungi dettagli specifici dal messaggio o dall'obiettivo della campagna
    if (campaignObjective.trim()) {
      basePrompt += `. ${campaignObjective}`
    }
    
    setImagePrompt(basePrompt)
    setShowImagePromptDialog(true)
  }

  // Funzione per generare l'immagine con DALL-E
  const generateImage = async () => {
    setShowImagePromptDialog(false)
    setIsGeneratingImage(true)
    
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          restaurantId: session?.user?.restaurantId
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedImageUrl(data.imageUrl)
        setUseGeneratedImage(true)
      } else {
        throw new Error(data.error || "Errore nella generazione dell'immagine")
      }
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile generare l'immagine",
        variant: "destructive",
      })
      setGeneratedImageUrl("/fallback-image.jpg")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Funzione per caricare un'immagine personalizzata
  const handleUploadImage = async (file: File | null) => {
    if (!file) {
      setUploadedImage(null)
      setUploadedImageUrl("")
      return
    }
    
    setUploadedImage(file)
    setIsUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/upload/campaign-image", {
        method: "POST",
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUploadedImageUrl(data.file.url)
        setGeneratedImageUrl(data.file.url)
        setUseGeneratedImage(true)
        toast({
          title: "Successo",
          description: "Immagine caricata con successo",
        })
      } else {
        throw new Error(data.error || "Errore durante il caricamento dell'immagine")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile caricare l'immagine",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Aggiungi useEffect per generare automaticamente il messaggio quando si passa allo step 3
  useEffect(() => {
    if (currentStep === 2 && !messageText && campaignType) {
      generateMessageText()
    }
  }, [currentStep, campaignType])

  // Update the handleNext function to validate the new step
  const handleNext = () => {
    if (currentStep === 0 && selectedCount === 0) {
      toast({
        title: "No contacts selected",
        description: "Please select at least one contact to continue",
        variant: "destructive",
      })
      return
    }

    if (currentStep === 1 && !campaignType) {
      toast({
        title: "Campaign type required",
        description: "Please select a campaign type to continue",
        variant: "destructive",
      })
      return
    }

    if (currentStep === 2 && !messageText) {
      toast({
        title: "Message text required",
        description: "Please generate or enter message text",
        variant: "destructive",
      })
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSubmit = () => {
    // Validate date and time
    const now = new Date()
    const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`)

    // Check if scheduled time is at least 10 minutes from now
    const minTime = new Date(now.getTime() + 10 * 60000)

    if (scheduledTime < minTime) {
      toast({
        title: "Invalid schedule time",
        description: "Schedule time must be at least 10 minutes from now",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call to Twilio
    setTimeout(() => {
      setIsApproved(true)
      setIsSubmitting(false)

      toast({
        title: "Campaign scheduled!",
        description: `Your campaign will be sent to ${selectedCount} contacts at the scheduled time`,
      })

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    }, 2000)
  }

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  const getExcitedMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <button onClick={handlePrevious} className="mr-2">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-extrabold text-[#1B9AAA]">Create Campaign</h1>
            </div>
            <div className="relative w-10 h-10">
              <Image
                src={getMascotImage() || "/placeholder.svg"}
                alt="Mascot"
                width={40}
                height={40}
                className="drop-shadow-lg"
              />
            </div>
          </div>

          <div className="mb-6">
            <Progress
              value={progress}
              className="h-3 bg-gray-100"
              indicatorClassName="bg-gradient-to-r from-[#EF476F] to-[#FF8A9A] transition-all duration-700 ease-in-out"
            />
            <div className="mt-2 flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`text-xs font-medium ${
                    index === currentStep ? "text-[#EF476F]" : index < currentStep ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Step 1: Select Contacts */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-[#EF476F]" />
                    <span className="text-sm font-medium text-[#EF476F]">Select your audience</span>
                  </div>

                  <div className="space-y-4">
                    {/* Search and filter */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-gray-200"
                      />
                    </div>

                    {/* Country filter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-700 flex items-center">
                          <Globe className="w-4 h-4 mr-1" /> Filter by country
                        </Label>
                        {selectedCountryCode && (
                          <button
                            onClick={() => setSelectedCountryCode(null)}
                            className="text-xs text-[#EF476F] font-medium"
                          >
                            Clear filter
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            onClick={() => filterByCountry(country.code)}
                            className={`text-xs px-2 py-1 rounded-full ${
                              selectedCountryCode === country.code
                                ? "bg-[#EF476F] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {country.code}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Select all */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <Label htmlFor="select-all" className="text-sm font-medium text-gray-700 flex items-center">
                        Select all contacts
                      </Label>
                      <Checkbox
                        id="select-all"
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        className="data-[state=checked]:bg-[#EF476F] data-[state=checked]:border-[#EF476F]"
                      />
                    </div>

                    {/* Contact list */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {isLoadingContacts ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-[#EF476F] animate-spin" />
                          <span className="ml-2 text-gray-500">Loading contacts...</span>
                        </div>
                      ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                          <motion.div
                            key={contact._id}
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-[#EF476F]/30 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex-1" onClick={() => toggleContactSelection(contact._id)}>
                              <p className="font-medium text-gray-800">{contact.name}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                                <p className="text-xs text-gray-400">Last interaction: {contact.lastVisit}</p>
                              </div>
                            </div>
                            <Checkbox
                              checked={contact.selected}
                              onCheckedChange={() => toggleContactSelection(contact._id)}
                              className="ml-4 data-[state=checked]:bg-[#EF476F] data-[state=checked]:border-[#EF476F]"
                            />
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No contacts found</p>
                          {!searchQuery && contacts.length === 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-500 mb-2">
                                No contacts in database yet.
                              </p>
                              <p className="text-sm text-gray-500">
                                Contacts will be added automatically when customers message your restaurant via WhatsApp.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected count */}
                <motion.div
                  className="bg-white rounded-3xl p-4 shadow-xl flex items-center justify-between"
                  animate={{
                    scale: selectedCount > 0 ? [1, 1.05, 1] : 1,
                    transition: { duration: 0.5 },
                  }}
                >
                  <div>
                    <p className="text-sm text-gray-700">Selected contacts</p>
                    <p className="text-2xl font-extrabold text-[#EF476F]">{selectedCount}</p>
                  </div>
                  {selectedCount > 0 && (
                    <div className="relative">
                      <Image
                        src={getExcitedMascotImage() || "/placeholder.svg"}
                        alt="Excited Mascot"
                        width={50}
                        height={50}
                        className="drop-shadow-lg"
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Step 2: Create Template */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-[#EF476F]" />
                    <span className="text-sm font-medium text-[#EF476F]">Campaign setup</span>
                  </div>

                  <div className="space-y-4">
                    {/* Campaign type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Campaign type <span className="text-[#EF476F]">*</span></Label>
                      <RadioGroup value={campaignType} onValueChange={setCampaignType} className="space-y-2">
                        {campaignTypes.map((type) => (
                          <Label
                            key={type.id}
                            htmlFor={type.id}
                            className="flex items-center p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <RadioGroupItem value={type.id} id={type.id} className="mr-3 text-[#EF476F]" />
                            <div>
                              <p className="font-medium text-gray-800">{type.name}</p>
                              <p className="text-xs text-gray-500">{type.description}</p>
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                        Message language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language" className="rounded-xl border-gray-200">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Campaign objective/details */}
                    <div className="space-y-2">
                      <Label htmlFor="campaign-objective" className="text-sm font-medium text-gray-700">
                        Campaign details & objective <span className="text-[#EF476F]">*</span>
                      </Label>
                      <Textarea
                        id="campaign-objective"
                        placeholder="Describe what you want to achieve with this campaign and any specific details to include..."
                        value={campaignObjective}
                        onChange={(e) => setCampaignObjective(e.target.value)}
                        className="rounded-xl min-h-[120px] border-gray-200"
                      />
                      <p className="text-xs text-gray-500">
                        Provide as much detail as possible to help our AI generate better content for your campaign.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Example preview */}
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">What happens next?</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={getMascotImage() || "/placeholder.svg"}
                          alt="Mascot"
                          width={40}
                          height={40}
                          className="drop-shadow-lg"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">
                          In the next step, our AI will generate a complete message, image suggestion, and
                          call-to-action based on your campaign type and details.
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          You'll be able to edit everything before finalizing your campaign.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add a new Step 3 (Content Creation) with the AI-generated content */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#EF476F]" />
                    <span className="text-sm font-medium text-[#EF476F]">Content creation</span>
                  </div>

                  <div className="space-y-4">
                    {/* Loading indicator per generazione testo */}
                    {isGeneratingText && (
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-[#EF476F] animate-spin" />
                          <p className="text-sm text-gray-700">Generazione del messaggio in corso...</p>
                        </div>
                      </div>
                    )}

                    {/* Message text */}
                    {messageText && !isGeneratingText && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="message-text" className="text-sm font-medium text-gray-700">
                            Message text
                          </Label>
                          <CustomButton
                            size="sm"
                            onClick={generateMessageText}
                            className="text-xs py-1 px-3 flex items-center"
                            disabled={isGeneratingText}
                          >
                            {isGeneratingText ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Regenerating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" /> Regenerate
                              </>
                            )}
                          </CustomButton>
                        </div>
                        <Textarea
                          id="message-text"
                          placeholder="Your AI-generated message will appear here..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="rounded-xl min-h-[120px] border-gray-200"
                        />
                      </div>
                    )}

                    {/* Image generation */}
                    {messageText && !isGeneratingText && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-700">Campaign image</Label>
                          <div className="flex gap-2">
                            <CustomButton
                              size="sm"
                              onClick={prepareImagePrompt}
                              className="text-xs py-1 px-3 flex items-center"
                              disabled={isGeneratingImage}
                            >
                              {isGeneratingImage ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...
                                </>
                              ) : generatedImageUrl ? (
                                <>
                                  <ImageIcon className="w-3 h-3 mr-1" /> Regenerate image
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-3 h-3 mr-1" /> Generate image
                                </>
                              )}
                            </CustomButton>
                          </div>
                        </div>

                        {/* Generatore di immagini e uploader */}
                        <div className="mt-3 border rounded-xl overflow-hidden">
                          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700">Campaign image</h4>
                            <div className="flex gap-2">
                              <div className="relative">
                                <input
                                  type="file"
                                  id="imageUpload"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={(e) => handleUploadImage(e.target.files?.[0] || null)}
                                  accept="image/*"
                                />
                                <CustomButton
                                  size="sm"
                                  variant="outline"
                                  className="text-xs py-1 px-3"
                                  disabled={isUploadingImage}
                                >
                                  {isUploadingImage ? "Uploading..." : "Upload image"}
                                </CustomButton>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col items-center">
                            {generatedImageUrl ? (
                              <div className="relative">
                                <Image
                                  src={generatedImageUrl}
                                  alt="Campaign image"
                                  width={300}
                                  height={200}
                                  className="max-h-[200px] w-auto object-contain"
                                />
                              </div>
                            ) : isGeneratingImage ? (
                              <div className="h-[200px] w-full flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="w-8 h-8 text-[#EF476F] animate-spin" />
                                  <p className="text-sm text-gray-500">Generating image...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="h-[200px] w-full flex items-center justify-center border-2 border-dashed rounded-lg">
                                <div className="text-center">
                                  <ImageIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                                  <p className="text-sm text-gray-500">
                                    Generate an image or upload your own
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {generatedImageUrl && (
                          <div className="flex items-center">
                            <Checkbox
                              id="use-image"
                              checked={useGeneratedImage}
                              onCheckedChange={(checked) => setUseGeneratedImage(checked === true)}
                              className="mr-2 data-[state=checked]:bg-[#EF476F] data-[state=checked]:border-[#EF476F]"
                            />
                            <Label htmlFor="use-image" className="text-sm text-gray-700">
                              Include this image in the campaign
                            </Label>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Call to action */}
                    {messageText && !isGeneratingText && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Primary call to action</Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder="CTA text (e.g., Order Now)"
                              value={primaryCta}
                              onChange={(e) => setPrimaryCta(e.target.value)}
                              className="rounded-xl border-gray-200"
                            />
                          </div>
                          <Select value={primaryCtaType} onValueChange={setPrimaryCtaType}>
                            <SelectTrigger className="w-24 rounded-xl border-gray-200">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          placeholder={primaryCtaType === "url" ? "https://example.com" : "+1 555-123-4567"}
                          className="rounded-xl border-gray-200"
                        />
                        <p className="text-xs text-gray-500">
                          A secondary "Opt-out" CTA will be automatically added to comply with regulations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message preview */}
                {messageText && !isGeneratingText && (
                  <div className="bg-white rounded-3xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Message Preview</h3>
                    <div className="bg-gray-100 rounded-xl p-4">
                      <div className="flex flex-col gap-3">
                        <div className="self-start bg-white rounded-lg p-3 shadow-sm max-w-[280px]">
                          {useGeneratedImage && generatedImageUrl && (
                            <div className="mb-2 rounded-md overflow-hidden">
                              <Image
                                src={generatedImageUrl || "/placeholder.svg"}
                                alt="Campaign image"
                                width={260}
                                height={180}
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                          <p className="text-sm">{messageText || "Your message will appear here..."}</p>
                          {primaryCta && (
                            <div className="mt-2 bg-[#EF476F] text-white text-sm font-medium py-1 px-3 rounded-md inline-block">
                              {primaryCta}
                            </div>
                          )}
                          <div className="mt-1 bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded-md inline-block">
                            Opt-out
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dialog per modificare il prompt dell'immagine */}
                {showImagePromptDialog && (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full space-y-4 animate-in zoom-in-95">
                      <h3 className="text-lg font-bold text-gray-800">Personalizza il prompt per l'immagine</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="image-prompt" className="text-sm font-medium text-gray-700">
                          Descrivi l'immagine che vorresti generare
                        </Label>
                        <Textarea
                          id="image-prompt"
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          className="rounded-xl min-h-[120px] border-gray-200"
                          placeholder="Descrivi l'immagine che vorresti generare per la tua campagna..."
                        />
                        <p className="text-xs text-gray-500">
                          Fornisci dettagli specifici per ottenere risultati migliori, ad esempio stile, colori, soggetti, atmosfera.
                        </p>
                      </div>
                      
                      <div className="flex justify-end gap-3">
                        <CustomButton
                          variant="outline"
                          onClick={() => setShowImagePromptDialog(false)}
                          className="text-gray-800"
                        >
                          Annulla
                        </CustomButton>
                        <CustomButton
                          onClick={generateImage}
                          disabled={!imagePrompt.trim()}
                        >
                          Genera Immagine
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Update the Step 4 (previously Step 3) to reflect the new step number */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-[#EF476F]" />
                    <span className="text-sm font-medium text-[#EF476F]">Schedule your campaign</span>
                  </div>

                  <div className="space-y-4">
                    {/* Date and time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="schedule-date" className="text-sm font-medium text-gray-700">
                          Date
                        </Label>
                        <Input
                          id="schedule-date"
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="rounded-xl border-gray-200"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schedule-time" className="text-sm font-medium text-gray-700">
                          Time
                        </Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="rounded-xl border-gray-200"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Note: Campaign must be scheduled at least 10 minutes from now.
                    </p>

                    {/* Campaign summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <h4 className="font-medium text-gray-800">Campaign Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Recipients:</div>
                        <div className="font-medium text-gray-800">{selectedCount} contacts</div>

                        <div className="text-gray-600">Campaign type:</div>
                        <div className="font-medium text-gray-800">
                          {campaignTypes.find((t) => t.id === campaignType)?.name || "Not selected"}
                        </div>

                        <div className="text-gray-600">Language:</div>
                        <div className="font-medium text-gray-800">
                          {languages.find((l) => l.code === language)?.name || "English"}
                        </div>

                        <div className="text-gray-600">Includes image:</div>
                        <div className="font-medium text-gray-800">
                          {useGeneratedImage && generatedImageUrl ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>

                    {/* Final approval */}
                    <div className="bg-[#FFE14D]/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={getExcitedMascotImage() || "/placeholder.svg"}
                            alt="Excited Mascot"
                            width={50}
                            height={50}
                            className="drop-shadow-lg"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Ready to send your campaign?</p>
                          <p className="text-sm text-gray-600">
                            Your campaign will be sent to {selectedCount} contacts at the scheduled time after approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <motion.div
                  className="bg-white rounded-3xl p-6 shadow-xl"
                  animate={isApproved ? { scale: [1, 1.05, 1], transition: { duration: 0.5 } } : {}}
                >
                  {!isApproved ? (
                    <CustomButton
                      onClick={handleSubmit}
                      className="w-full py-3 flex items-center justify-center"
                      disabled={isSubmitting || !scheduleDate || !scheduleTime}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Schedule Campaign <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </CustomButton>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Campaign Scheduled!</h3>
                      <p className="text-sm text-gray-600">
                        Your campaign has been approved and will be sent at the scheduled time.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        {!isApproved && (
          <div className="w-full max-w-md mt-6 flex justify-between">
            <CustomButton variant="outline" onClick={handlePrevious} className="text-gray-800 py-2 px-4">
              {currentStep === 0 ? "Cancel" : "Back"}
            </CustomButton>

            {currentStep < steps.length - 1 && (
              <CustomButton 
                onClick={handleNext} 
                className="py-2 px-4"
                disabled={
                  (currentStep === 0 && selectedCount === 0) ||
                  (currentStep === 1 && (!campaignType || !campaignObjective.trim())) ||
                  (currentStep === 2 && !messageText)
                }
              >
                Continue
              </CustomButton>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
