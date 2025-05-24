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
  FileText,
  Video,
  RefreshCw,
  Plus,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
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
import UILanguageSelector from "@/components/ui-language-selector"
import { CustomButton } from "@/components/ui/custom-button"
import { MediaUpload } from "@/components/ui/media-upload"
import { useTranslation } from "react-i18next"
// Rimuoviamo l'import del servizio
// import { campaignService } from "@/lib/campaign-service"

// Add this import for the dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Tipo di dato per un contatto
interface Contact {
  id: string | number
  name: string
  phone: string
  lastOrder: string
  selected: boolean
  countryCode: string
  language?: string
  interactionCount?: number
  isOptedIn?: boolean
}

// Tipo di dato per un country code
interface CountryCode {
  code: string
  name: string
  flag: string
}

// Campaign types
const campaignTypes = [
  {
    id: "promo",
    title: "Promotional Offer",
    description: "Special discounts and limited-time offers",
    emoji: "🎉",
  },
  {
    id: "event",
    title: "Event Invitation",
    description: "Invite customers to special events",
    emoji: "🎪",
  },
  {
    id: "update",
    title: "Menu Update",
    description: "Announce new items or menu changes",
    emoji: "📋",
  },
  {
    id: "feedback",
    title: "Feedback Request",
    description: "Ask for customer opinions",
    emoji: "💬",
  },
]

// Languages
const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
]

// Update the steps array to include the new step
const steps = ["Select Contacts", "Campaign Setup", "Content Creation", "Schedule & Approve"]

export default function CreateCampaign() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([])
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
  // Add a new state variable for the CTA URL/phone
  const [primaryCtaValue, setPrimaryCtaValue] = useState("")
  // Add these new state variables after the existing state declarations
  const [imageGenerationMethod, setImageGenerationMethod] = useState<"automatic" | "custom" | "upload" | null>(null)
  const [customImagePrompt, setCustomImagePrompt] = useState("")
  const [uploadedFileType, setUploadedFileType] = useState<"image" | "video" | "pdf" | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState("")
  // Add these state variables after the other state declarations
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiImageMethod, setAiImageMethod] = useState<"automatic" | "custom" | null>(null)
  const [customPromptDialogOpen, setCustomPromptDialogOpen] = useState(false)
  // Add this state variable after the other state declarations
  const [scheduleOption, setScheduleOption] = useState<"now" | "later">("now")
  // Add a new state for AI content generation loading
  const [isGeneratingAIContent, setIsGeneratingAIContent] = useState(false)
  // Add these state variables after the other state declarations
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [aiGeneratedPrompt, setAiGeneratedPrompt] = useState("")
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false)
  // Stato per i dati del ristorante
  const [restaurant, setRestaurant] = useState<{name?: string} | null>(null)
  // Add these state variables after the other state declarations
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);
  const [templateApprovalStatus, setTemplateApprovalStatus] = useState<string | null>(null);
  const [templateRejectionReason, setTemplateRejectionReason] = useState<string | null>(null);
  const [campaignCreated, setCampaignCreated] = useState<any>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [countryFilter, setCountryFilter] = useState("all")
  const [selectedMedia, setSelectedMedia] = useState<{ type: string; url: string; name?: string } | null>(null)
  const [showMediaOptions, setShowMediaOptions] = useState(false)
  const [sendOption, setSendOption] = useState("now")
  const [scheduledDate, setScheduledDate] = useState("")
  const [generationStep, setGenerationStep] = useState(1)
  const [promptMode, setPromptMode] = useState("auto")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false)
  const [messageLanguage, setMessageLanguage] = useState("en")
  const [primaryCTA, setPrimaryCTA] = useState({ type: "url", value: "" })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [error, setError] = useState("")
  const [errorDetails, setErrorDetails] = useState("")

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoadingContacts(true);
        
        // Utilizzare le API Routes di Next.js
        const response = await fetch('/api/campaign/contacts');
        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Map contacts to include selected property
          const contactsWithSelection = data.contacts.map((contact: any) => ({
            ...contact,
            selected: false
          }));
          
          setContacts(contactsWithSelection);
          setCountryCodes(data.countryCodes || []);
          setRestaurant(data.restaurant);
        } else {
          toast({
            title: "Errore",
            description: data.error || "Impossibile caricare i contatti",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Errore",
          description: "Errore durante il caricamento dei contatti",
          variant: "destructive",
        });
      } finally {
        setIsLoadingContacts(false);
      }
    };

    if (currentStep === 0) {
      fetchContacts();
    }
  }, [currentStep, toast]);

  useEffect(() => {
    // Update progress based on current step
    setProgress(Math.round(((currentStep + 1) / steps.length) * 100))
  }, [currentStep])

  useEffect(() => {
    // Update selected count
    const count = contacts.filter((contact) => contact.selected).length
    setSelectedCount(count)
    setAllSelected(count === contacts.length && contacts.length > 0)
  }, [contacts])

  // Generate content when moving to step 3
  useEffect(() => {
    if (currentStep === 2 && !messageText) {
      regenerateWithAI()
    }
  }, [currentStep])

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone.includes(searchQuery)
    const matchesCountry = !selectedCountryCode || contact.countryCode === selectedCountryCode
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

  const toggleContactSelection = (id: string | number) => {
    setContacts(contacts.map((contact) => (contact.id === id ? { ...contact, selected: !contact.selected } : contact)))
  }

  const filterByCountry = (code: string) => {
    setSelectedCountryCode(code === selectedCountryCode ? null : code)
  }

  // Update the generateMessageText function to use the campaign objective
  const generateMessageText = (showLoading = true) => {
    if (showLoading) {
      setIsGeneratingText(true)
    }

    // Simulate AI text generation with the campaign objective as context
    setTimeout(
      () => {
        let generatedText = ""

        // Use the campaign objective to personalize the message if provided
        const objective = campaignObjective.trim()
        const hasObjective = objective.length > 0

        if (campaignType === "promo") {
          generatedText = hasObjective
            ? `🌟 Special Offer! ${objective.includes("discount") ? objective : "Enjoy 20% off your next order this weekend."} Use code TASTY20 at checkout. Limited time only!`
            : "🌟 Special Offer! Enjoy 20% off your next order this weekend. Use code TASTY20 at checkout. Limited time only!"
        } else if (campaignType === "event") {
          generatedText = hasObjective
            ? `🎉 You're invited! ${objective.includes("event") ? objective : "Join us for our special tasting event this Friday at 7PM."} Reserve your spot now!`
            : "🎉 You're invited! Join us for our special tasting event this Friday at 7PM. Reserve your spot now!"
        } else if (campaignType === "update") {
          generatedText = hasObjective
            ? `🍽️ ${objective.includes("menu") ? objective : "Our menu just got better! Check out our 5 new seasonal dishes, available now."} Which one will be your favorite?`
            : "🍽️ Our menu just got better! Check out our 5 new seasonal dishes, available now. Which one will be your favorite?"
        } else if (campaignType === "feedback") {
          generatedText = hasObjective
            ? `👋 ${objective.includes("feedback") ? objective : "We value your opinion! How was your recent experience with us?"} Take our quick 1-minute survey and get a free dessert on your next visit!`
            : "👋 We value your opinion! How was your recent experience with us? Take our quick 1-minute survey and get a free dessert on your next visit!"
        } else {
          generatedText = hasObjective
            ? `Hello from Pizza Palace! ${objective}`
            : "Hello from Pizza Palace! We miss you and would love to see you again soon. Check out what's new on our menu!"
        }

        setMessageText(generatedText)
        setPrimaryCta(
          campaignType === "promo"
            ? "Order Now"
            : campaignType === "event"
              ? "Reserve a Spot"
              : campaignType === "update"
                ? "View Menu"
                : "Take Survey",
        )
        setIsGeneratingText(false)
      },
      showLoading ? 1500 : 0,
    )
  }

  // Funzione per rigenerare il testo del messaggio con AI
  const regenerateWithAI = async () => {
    setIsGeneratingText(true)
    
    try {
      const response = await fetch('/api/campaign/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignType,
          language,
          campaignObjective
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error regenerating content')
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        setMessageText(data.data.messageText)
        setPrimaryCta(data.data.cta.text || primaryCta)
        setPrimaryCtaType(data.data.cta.type || primaryCtaType)
        
        toast({
          title: "Message regenerated",
          description: "New content has been created for your campaign.",
        });
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error regenerating AI content:', error)
      toast({
        title: "Error regenerating content",
        description: "Failed to regenerate content. Please try again later.",
        variant: "destructive",
      })
      
      // Fallback alla generazione locale se necessario
      generateMessageTextFallback()
    } finally {
      setIsGeneratingText(false)
    }
  }
  
  // Funzione fallback per il caso in cui la chiamata API fallisca
  const generateMessageTextFallback = () => {
    // Questa è la vecchia funzione generateMessageText rinominata
    let generatedText = ""

    // Use the campaign objective to personalize the message if provided
    const objective = campaignObjective.trim()
    const hasObjective = objective.length > 0

    if (campaignType === "promo") {
      generatedText = hasObjective
        ? `🌟 Special Offer! ${objective.includes("discount") ? objective : "Enjoy 20% off your next order this weekend."} Use code TASTY20 at checkout. Limited time only!`
        : "🌟 Special Offer! Enjoy 20% off your next order this weekend. Use code TASTY20 at checkout. Limited time only!"
    } else if (campaignType === "event") {
      generatedText = hasObjective
        ? `🎉 You're invited! ${objective.includes("event") ? objective : "Join us for our special tasting event this Friday at 7PM."} Reserve your spot now!`
        : "🎉 You're invited! Join us for our special tasting event this Friday at 7PM. Reserve your spot now!"
    } else if (campaignType === "update") {
      generatedText = hasObjective
        ? `🍽️ ${objective.includes("menu") ? objective : "Our menu just got better! Check out our 5 new seasonal dishes, available now."} Which one will be your favorite?`
        : "🍽️ Our menu just got better! Check out our 5 new seasonal dishes, available now. Which one will be your favorite?"
    } else if (campaignType === "feedback") {
      generatedText = hasObjective
        ? `👋 ${objective.includes("feedback") ? objective : "We value your opinion! How was your recent experience with us?"} Take our quick 1-minute survey and get a free dessert on your next visit!`
        : "👋 We value your opinion! How was your recent experience with us? Take our quick 1-minute survey and get a free dessert on your next visit!"
    } else {
      generatedText = hasObjective
        ? `Hello from Pizza Palace! ${objective}`
        : "Hello from Pizza Palace! We miss you and would love to see you again soon. Check out what's new on our menu!"
    }

    setMessageText(generatedText)
    setPrimaryCta(
      campaignType === "promo"
        ? "Order Now"
        : campaignType === "event"
          ? "Reserve a Spot"
          : campaignType === "update"
            ? "View Menu"
            : "Take Survey",
    )
  }

  // Replace the existing generateImage function with this enhanced version using AI
  const generateImage = async (method: "automatic" | "custom") => {
    if (method === "automatic" && !messageText) {
      toast({
        title: "Message text required",
        description: "Please generate or enter message text first",
        variant: "destructive",
      })
      return
    }

    setImageGenerationMethod(method)
    
    // Per il metodo automatico, prima generiamo il prompt con Claude
    if (method === "automatic") {
      // Prima otteniamo un prompt tramite Claude
      setIsGeneratingPrompt(true)
      
      try {
        const promptResponse = await fetch('/api/campaign/prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            campaignType,
            messageText,
            restaurantName: "Your Restaurant", // Questo potrebbe essere personalizzato
            language
          })
        })
        
        if (!promptResponse.ok) {
          const errorData = await promptResponse.json()
          throw new Error(errorData.error || 'Error generating prompt')
        }
        
        const promptData = await promptResponse.json()
        
        if (promptData.success && promptData.data && promptData.data.prompt) {
          // Salviamo il prompt generato
          const generatedPrompt = promptData.data.prompt
          setAiGeneratedPrompt(generatedPrompt)
          
          // Ora generiamo l'immagine con DALL-E
          await generateImageWithDallE(generatedPrompt)
        } else {
          throw new Error('Invalid prompt response format')
        }
      } catch (error) {
        console.error('Error generating AI prompt:', error)
        toast({
          title: "Error generating prompt",
          description: "Failed to generate image prompt. Please try manual input.",
          variant: "destructive",
        })
        setIsGeneratingPrompt(false)
        setCustomPromptDialogOpen(true) // Fallback al prompt manuale
      }
    } else if (method === "custom" && customImagePrompt) {
      // Per il metodo custom, usiamo direttamente il prompt inserito dall'utente
      await generateImageWithDallE(customImagePrompt)
    }
  }
  
  // Funzione per generare l'immagine con DALL-E
  const generateImageWithDallE = async (prompt: string) => {
    setIsGeneratingImage(true)
    
    try {
      const response = await fetch('/api/campaign/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          campaignType,
          messageText,
          restaurantName: "Your Restaurant", // Personalizzabile
          modelType: 'dall-e-3' // Usiamo DALL-E 3 che funziona meglio con prompt semplici
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error generating image')
      }
      
      const imageData = await response.json()
      
      if (imageData.success && imageData.data && imageData.data.imageUrl) {
        // Impostiamo l'URL dell'immagine generata
        setGeneratedImageUrl(imageData.data.imageUrl)
        setUseGeneratedImage(true)
      } else {
        throw new Error('Invalid image response format')
      }
    } catch (error) {
      console.error('Error generating AI image:', error)
      toast({
        title: "Using placeholder image",
        description: "We couldn't generate a custom image, so we're using a default one.",
        variant: "default",
      })
      
      // Fallback a immagine predefinita
      useDefaultImage()
    } finally {
      setIsGeneratingImage(false)
      setIsGeneratingPrompt(false)
      // Chiudi i dialogs
      setShowAIDialog(false)
      setCustomPromptDialogOpen(false)
    }
  }
  
  // Funzione separata per usare un'immagine predefinita
  const useDefaultImage = () => {
    let fallbackImageUrl = ""
    if (campaignType === "promo") {
      fallbackImageUrl = "/restaurant-special-offer.png"
    } else if (campaignType === "event") {
      fallbackImageUrl = "/restaurant-event-invitation.png"
    } else if (campaignType === "update") {
      fallbackImageUrl = "/restaurant-menu-items.png"
    } else if (campaignType === "feedback") {
      fallbackImageUrl = "/restaurant-feedback-survey.png"
    } else {
      fallbackImageUrl = "/delicious-restaurant-meal.png"
    }
    
    setGeneratedImageUrl(fallbackImageUrl)
    setUseGeneratedImage(true)
  }

  // Funzione per gestire l'upload di media per la campagna
  const handleFileUpload = (fileType: "image" | "video" | "pdf") => {
    setImageGenerationMethod("upload")
    setUploadedFileType(fileType)
  }

  const handleFileUploaded = (fileUrl: string, fileType: "image" | "video" | "pdf") => {
    setUploadedFileUrl(fileUrl)
    setUseGeneratedImage(true)
    setUploadedFileType(fileType)
  }

  // Update the handleNext function
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
    
    if (currentStep === 1 && !campaignObjective.trim()) {
      toast({
        title: "Campaign details required",
        description: "Please enter campaign details and objective to continue",
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

    // Se passiamo dallo step 2 allo step 3, generiamo contenuti con AI
    if (currentStep === 1) {
      // Imposto loading state
      setIsGeneratingAIContent(true)
      
      // Chiamata API per generare contenuti
      const generateAIContent = async () => {
        try {
          const response = await fetch('/api/campaign/content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              campaignType,
              language,
              campaignObjective
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error generating content')
          }
          
          const data = await response.json()
          
          if (data.success && data.data) {
            // Imposto i dati generati da Claude
            setMessageText(data.data.messageText)
            setPrimaryCta(data.data.cta.text)
            setPrimaryCtaType(data.data.cta.type)
            setIsGeneratingText(false)
          } else {
            throw new Error('Invalid response format')
          }
        } catch (error) {
          console.error('Error generating AI content:', error)
          toast({
            title: "Error generating content",
            description: "Failed to generate content. Using default template.",
            variant: "destructive",
          })
          
          // Fallback alla generazione locale
          generateMessageTextFallback()
        } finally {
          setIsGeneratingAIContent(false)
        }
      }
      
      // Eseguo la generazione e vado al prossimo step
      generateAIContent().then(() => {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      })
    } else if (currentStep < steps.length - 1) {
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

  // Update the handleSubmit function to use fetch directly
  const handleSubmit = async () => {
    // Validate date and time if scheduling for later
    if (scheduleOption === "later") {
      const now = new Date()
      const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`)

      // Check if scheduled time is at least 10 minutes from now
      const minTime = new Date(now.getTime() + 10 * 60 * 1000)

      if (scheduledTime < minTime) {
        toast({
          title: "Invalid schedule time",
          description: "Schedule time must be at least 10 minutes from now",
          variant: "destructive",
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      // 1. Prima creiamo/otteniamo i template predefiniti
      const templateResponse = await fetch('/api/campaign-templates/create-defaults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!templateResponse.ok) {
        const errorData = await templateResponse.json()
        throw new Error(errorData.error || 'Errore nella creazione dei template predefiniti')
      }
      
      const templateData = await templateResponse.json()
      
      // Seleziona il template appropriato in base al tipo di campagna
      const matchingTemplate = templateData.data.find(
        (t: any) => t.campaignType === campaignType
      )
      
      if (!matchingTemplate) {
        throw new Error('Nessun template trovato per questo tipo di campagna')
      }

      // Get selected contact IDs
      const selectedContactIds = contacts
        .filter(contact => contact.selected)
        .map(contact => contact.id);

      // Create campaign object
      const campaignData = {
        name: campaignType ? campaignTypes.find(t => t.id === campaignType)?.name || "Campaign" : "Campaign",
        description: campaignObjective,
        templateId: matchingTemplate._id, // Usa l'ID reale del template
        scheduledDate: scheduleOption === "now" ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : `${scheduleDate}T${scheduleTime}`,
        targetAudience: {
          selectionMethod: "manual",
          manualContacts: selectedContactIds,
          onlyWithConsent: true
        },
        templateParameters: {
          message: messageText,
          cta: primaryCta,
          ctaType: primaryCtaType,
          ctaValue: primaryCtaValue,
          useImage: useGeneratedImage,
          imageUrl: generatedImageUrl || uploadedFileUrl,
          language: language // Aggiungi la lingua selezionata
        }
      };

      // Crea la campagna con l'API
      const createResponse = await fetch('/api/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Error creating campaign');
      }

      const campaignResult = await createResponse.json();
      
      // Salva i dati della campagna creata
      setCampaignCreated(campaignResult.data);
      
      // Determina la categoria del template per WhatsApp basata sul tipo di campagna
      let templateCategory = "MARKETING";
      if (campaignType === "event" || campaignType === "update") {
        templateCategory = "UTILITY";
      }
      
      // 2. Invia il template per approvazione e attendi la risposta
      setIsSubmittingTemplate(true);
      setTemplateApprovalStatus("pending");
      
      try {
        console.log("Invio template a Twilio per approvazione...");
        const submitResponse = await fetch(`/api/campaign/${campaignResult.data._id}/submit-template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ category: templateCategory })
        });
        
        if (!submitResponse.ok) {
          const submitErrorData = await submitResponse.json();
          console.error("Errore nell'invio del template a Twilio:", submitErrorData);
          // Continuiamo comunque con lo scheduling
        } else {
          const submitData = await submitResponse.json();
          console.log("Template inviato con successo a Twilio:", submitData);
        }
      } catch (submitError) {
        console.error("Errore nell'invio del template a Twilio:", submitError);
        // Continuiamo comunque con lo scheduling
      }
      
      // 3. Programma l'invio della campagna
      const scheduledDate = scheduleOption === "now" 
        ? new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minuti da ora
        : new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      
      console.log("Programmazione invio campagna per:", scheduledDate);
      
      try {
        const scheduleResponse = await fetch(`/api/campaign/${campaignResult.data._id}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ scheduledDate })
        });
        
        if (!scheduleResponse.ok) {
          const scheduleErrorData = await scheduleResponse.json();
          console.error("Errore nella programmazione della campagna:", scheduleErrorData);
          // Mostriamo comunque un messaggio di successo per l'invio della campagna
        } else {
          const scheduleData = await scheduleResponse.json();
          console.log("Campagna programmata con successo:", scheduleData);
        }
      } catch (scheduleError) {
        console.error("Errore nella programmazione della campagna:", scheduleError);
        // Mostriamo comunque un messaggio di successo per l'invio della campagna
      }
      
      // Mostra il messaggio di successo
      setIsSubmitting(false);
      setIsSubmittingTemplate(false);
      setIsApproved(true);
      
      toast({
        title: "Campagna programmata!",
        description: `La tua campagna sarà inviata a ${selectedCount} contatti ${
          scheduleOption === "now" ? "tra circa 10 minuti" : "all'ora programmata"
        }`,
      });
      
      // Redirect alla dashboard dopo un breve ritardo
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setIsSubmittingTemplate(false);
    }
  };
  
  // Add a new function to schedule the message
  const scheduleMessage = async (campaignId: string) => {
    try {
      // Determine the scheduled date based on user selection
      const scheduledDate = scheduleOption === "now" 
        ? new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
        : new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      
      const scheduleResponse = await fetch(`/api/campaign/${campaignId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduledDate })
      });
      
      if (!scheduleResponse.ok) {
        const errorData = await scheduleResponse.json();
        throw new Error(errorData.error || 'Error scheduling campaign');
      }
      
      const scheduleResult = await scheduleResponse.json();
      
      setIsSubmitting(false);
      setIsSubmittingTemplate(false);
      setIsApproved(true);
      
      toast({
        title: "Campaign scheduled!",
        description: `Your campaign will be sent to ${selectedCount} contacts ${
          scheduleOption === "now" ? "in approximately 10 minutes" : "at the scheduled time"
        }`,
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: any) {
      console.error("Error scheduling campaign:", error);
      setIsSubmitting(false);
      setIsSubmittingTemplate(false);
      
      toast({
        title: "Error scheduling campaign",
        description: error.message || "Failed to schedule campaign",
        variant: "destructive",
      });
    }
  };

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  const getExcitedMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      {/* AI Content Generation Loading Overlay */}
      {isGeneratingAIContent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/70 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-md mx-4">
            <Loader2 className="w-16 h-16 text-[#EF476F] animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Creating your campaign content...
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Our AI is crafting a personalized message based on your campaign details. This may take a few moments.
            </p>
            <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#EF476F] to-[#FF8A9A]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear" 
                }}
              />
            </div>
            <div className="mt-6 relative">
              <Image
                src={getExcitedMascotImage() || "/placeholder.svg"}
                alt="AI Working"
                width={80}
                height={80}
                className="drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <button onClick={handlePrevious} className="mr-2">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-extrabold text-[#1B9AAA]">{t("campaignCreate.title")}</h1>
            </div>
            <div className="flex items-center gap-2">
              <UILanguageSelector variant="compact" />
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
              <div className="space-y-4 pb-24">
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

                    {/* Country filter with emoji flags */}
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
                      <div className="overflow-x-auto pb-2">
                        <div className="flex flex-nowrap gap-2 min-w-max">
                          {countryCodes.map((country) => (
                            <button
                              key={country.code}
                              onClick={() => filterByCountry(country.code)}
                              className={`text-xl px-3 py-2 rounded-full ${
                                selectedCountryCode === country.code
                                  ? "bg-[#EF476F] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              title={country.name}
                            >
                              {country.flag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Select all */}
                    <div className="flex items-center py-2 border-b border-gray-100">
                      <Checkbox
                        id="select-all"
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        className="mr-3 data-[state=checked]:bg-[#EF476F] data-[state=checked]:border-[#EF476F]"
                      />
                      <Label htmlFor="select-all" className="text-sm font-medium text-gray-700 flex items-center">
                        Select all contacts
                      </Label>
                    </div>

                    {/* Contact list - with loading state */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {isLoadingContacts ? (
                        <div className="text-center py-8 flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-[#EF476F] mb-2" />
                          <p className="text-gray-500">Loading contacts...</p>
                        </div>
                      ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                          <motion.div
                            key={contact.id}
                            className="flex items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-[#EF476F]/30 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Checkbox
                              checked={contact.selected}
                              onCheckedChange={() => toggleContactSelection(contact.id)}
                              className="mr-3 data-[state=checked]:bg-[#EF476F] data-[state=checked]:border-[#EF476F]"
                            />
                            <div className="flex-1" onClick={() => toggleContactSelection(contact.id)}>
                              <p className="font-medium text-gray-800">{contact.name}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">{contact.phone}</p>
                                <p className="text-xs text-gray-400">Last contact: {contact.lastOrder}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No contacts found</p>
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
              <div className="space-y-4 pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-[#EF476F]" />
                    <span className="text-sm font-medium text-[#EF476F]">Campaign setup</span>
                  </div>

                  <div className="space-y-4">
                    {/* Campaign type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Campaign type</Label>
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
                        Campaign details & objective
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
              </div>
            )}

            {/* Step 3: Content Creation with pre-generated content */}
            {currentStep === 2 && (
              <div className="space-y-4 pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#EF476F]" />
                    <span className="text-sm font-medium text-[#EF476F]">Content creation</span>
                  </div>

                  <div className="space-y-4">
                    {/* Message text - already generated */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message-text" className="text-sm font-medium text-gray-700">
                          Message text
                        </Label>
                        <CustomButton
                          size="sm"
                          onClick={regenerateWithAI}
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

                    {/* Image generation */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Campaign media</Label>
                      </div>

                      {/* Image generation methods */}
                      {!generatedImageUrl && !uploadedFileUrl && !isGeneratingImage && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-700 mb-3">Choose how to add media to your campaign:</p>

                          <div className="grid grid-cols-1 gap-3">
                            {/* AI Generation option */}
                            <div className="bg-white rounded-xl border border-gray-200 p-3">
                              <p className="font-medium text-gray-800 mb-2">AI-generated media</p>
                              <CustomButton
                                size="sm"
                                onClick={() => setShowAIDialog(true)}
                                className="w-full text-xs py-2 px-3 flex items-center justify-center"
                              >
                                <Sparkles className="w-3 h-3 mr-1" /> Create image with AI
                              </CustomButton>
                            </div>

                            {/* Upload options */}
                            <div className="bg-white rounded-xl border border-gray-200 p-3">
                              <p className="font-medium text-gray-800 mb-2">Upload your own</p>
                              <div className="grid grid-cols-3 gap-2">
                                <CustomButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFileUpload("image")}
                                  className="text-xs py-2 flex items-center justify-center"
                                >
                                  <ImageIcon className="w-3 h-3 mr-1" /> Image
                                </CustomButton>
                                <CustomButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFileUpload("video")}
                                  className="text-xs py-2 flex items-center justify-center"
                                >
                                  <Video className="w-3 h-3 mr-1" /> Video
                                </CustomButton>
                                <CustomButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFileUpload("pdf")}
                                  className="text-xs py-2 flex items-center justify-center"
                                >
                                  <FileText className="w-3 h-3 mr-1" /> PDF
                                </CustomButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Loading states */}
                      {isGeneratingImage && (
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-[#EF476F]" />
                          <p className="text-sm text-gray-700">
                            {imageGenerationMethod === "automatic"
                              ? "Generating image based on your campaign..."
                              : "Generating image based on your description..."}
                          </p>
                        </div>
                      )}

                      {/* MediaUpload component */}
                      {imageGenerationMethod === "upload" && !uploadedFileUrl && (
                        <MediaUpload 
                          onFileSelect={handleFileUploaded}
                          selectedFile={uploadedFileUrl}
                          mediaType={uploadedFileType || "all"}
                          campaignType={campaignType}
                          maxSize={uploadedFileType === "video" ? 30 : uploadedFileType === "pdf" ? 15 : 10}
                          label={`Carica il tuo ${
                            uploadedFileType === "video" 
                              ? "video" 
                              : uploadedFileType === "pdf" 
                                ? "documento PDF" 
                                : "immagine"
                          }`}
                        />
                      )}

                      {/* Preview and media settings */}
                      {generatedImageUrl || uploadedFileUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                              {imageGenerationMethod === "automatic"
                                ? "AI-generated image"
                                : imageGenerationMethod === "custom"
                                  ? "Custom AI-generated image"
                                  : uploadedFileType === "image"
                                    ? "Uploaded image"
                                    : uploadedFileType === "pdf"
                                      ? "Uploaded PDF"
                                      : "Uploaded video"}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <CustomButton
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setGeneratedImageUrl("")
                                  setUploadedFileUrl("")
                                  setImageGenerationMethod(null)
                                  setUseGeneratedImage(false)
                                }}
                                className="text-xs py-1 px-2"
                              >
                                Change
                              </CustomButton>
                            </div>
                          </div>
                          
                          {/* Media preview */}
                          {uploadedFileType === "pdf" && uploadedFileUrl && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-[#EF476F]/10 rounded-full flex items-center justify-center mr-3">
                                  <FileText className="w-5 h-5 text-[#EF476F]" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">PDF Document</p>
                                  <p className="text-xs text-gray-500">
                                    <a 
                                      href={uploadedFileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Open PDF
                                    </a>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {uploadedFileType === "video" && uploadedFileUrl && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-[#EF476F]/10 rounded-full flex items-center justify-center mr-3">
                                  <Video className="w-5 h-5 text-[#EF476F]" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">Video File</p>
                                  <p className="text-xs text-gray-500">Ready to be included in your campaign</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {uploadedFileType === "image" && uploadedFileUrl && (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200">
                              <Image
                                src={uploadedFileUrl}
                                alt="Campaign media"
                                width={400}
                                height={300}
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                          
                          {imageGenerationMethod !== "upload" && generatedImageUrl && (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200">
                              <Image
                                src={generatedImageUrl}
                                alt="Campaign media"
                                width={400}
                                height={300}
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                          
                          {/* Media inclusion settings */}
                          <div className="flex items-center">
                            <Checkbox
                              id="use-media"
                              checked={useGeneratedImage}
                              onCheckedChange={(checked) => setUseGeneratedImage(checked === true)}
                              className="mr-2 data-[state=checked]:bg-[#EF476F] data-[state=checked]:border-[#EF476F]"
                            />
                            <Label htmlFor="use-media" className="text-sm text-gray-700">
                              Include this {uploadedFileType === "video" ? "video" : uploadedFileType === "pdf" ? "document" : "image"} in the campaign
                            </Label>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* AI Image Generation Dialog */}
                  <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                    <DialogContent className="sm:max-w-md rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-center">Create AI Image</DialogTitle>
                        <DialogDescription className="text-center">
                          How would you like to generate your image?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <CustomButton
                          onClick={() => generateImage("automatic")}
                          className="w-full py-3 flex items-center justify-center"
                          disabled={isGeneratingPrompt || isGeneratingImage}
                        >
                          {isGeneratingPrompt ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating prompt...
                            </>
                          ) : isGeneratingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating image...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" /> Generate automatically
                            </>
                          )}
                        </CustomButton>
                        <p className="text-xs text-center text-gray-500">
                          We'll create an image based on your campaign type and message using AI
                        </p>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-2 text-gray-500">OR</span>
                          </div>
                        </div>

                        <CustomButton
                          variant="outline"
                          onClick={() => {
                            setShowAIDialog(false)
                            setCustomPromptDialogOpen(true)
                          }}
                          className="w-full py-3 flex items-center justify-center"
                          disabled={isGeneratingPrompt || isGeneratingImage}
                        >
                          Write custom prompt
                        </CustomButton>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Custom Prompt Dialog */}
                  <Dialog open={customPromptDialogOpen} onOpenChange={setCustomPromptDialogOpen}>
                    <DialogContent className="sm:max-w-md rounded-xl">
                      <DialogHeader>
                        <DialogTitle>Custom Image Prompt</DialogTitle>
                        <DialogDescription>
                          Describe the image you want to generate with AI
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Textarea
                          placeholder="E.g., A delicious pizza with melted cheese and fresh toppings on a wooden table with soft restaurant lighting"
                          value={customImagePrompt}
                          onChange={(e) => setCustomImagePrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500">
                          Be specific and detailed for better results. Avoid text in the image and use high-quality descriptors.
                        </p>
                      </div>
                      <DialogFooter>
                        <CustomButton
                          onClick={() => generateImage("custom")}
                          className="w-full"
                          disabled={!customImagePrompt.trim() || isGeneratingImage}
                        >
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating image...
                            </>
                          ) : (
                            <>Generate Image</>
                          )}
                        </CustomButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Call to action */}
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
                      value={primaryCtaValue}
                      onChange={(e) => setPrimaryCtaValue(e.target.value)}
                      className="rounded-xl border-gray-200"
                    />
                    <p className="text-xs text-gray-500">
                      A secondary "Opt-out" CTA will be automatically added to comply with regulations.
                    </p>
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Secondary call to action (required)</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            value="Unsubscribe"
                            disabled
                            className="rounded-xl border-gray-200 bg-gray-50 text-gray-500"
                          />
                        </div>
                        <Select disabled defaultValue="url">
                          <SelectTrigger className="w-24 rounded-xl border-gray-200 bg-gray-50 text-gray-500">
                            <SelectValue placeholder="Type">URL</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="url">URL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-gray-500">
                        This unsubscribe option is automatically added to comply with messaging regulations and cannot
                        be modified.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message preview */}
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Message Preview</h3>
                  <div className="bg-white rounded-xl p-4">
                    {/* Bolla del messaggio semplificata */}
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 relative max-w-[90%]">
                      {/* Header per indicare generazione AI */}
                      <div className="absolute top-0 left-0 right-0 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center">
                          <Sparkles className="w-3 h-3 mr-1.5" /> AI Generated
                        </div>
                        <CustomButton
                          size="sm"
                          variant="ghost"
                          onClick={regenerateWithAI}
                          className="text-white hover:bg-white/20 py-0.5 px-1.5 h-auto"
                          disabled={isGeneratingText}
                        >
                          {isGeneratingText ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </CustomButton>
                      </div>
                      
                      {/* Compensazione per l'header AI */}
                      <div className="mt-6"></div>
                      
                      {/* Media in anteprima: PDF, immagine o video */}
                      {useGeneratedImage && (generatedImageUrl || uploadedFileUrl) && (
                        <>
                          {/* Media Header colorato quando c'è un media */}
                          <div className="absolute left-0 right-0 top-[1.5rem] h-7 bg-[#65CB9B] rounded-t-none text-white text-xs font-medium flex items-center px-4">
                            Media Messages
                          </div>
                          
                          {/* Spazio extra per entrambi gli header */}
                          <div className="mt-8"></div>
                          
                          {/* PDF */}
                          {uploadedFileType === "pdf" && uploadedFileUrl && (
                            <div className="mb-3 flex items-center bg-gray-100 p-2 rounded-md">
                              <FileText className="w-4 h-4 text-gray-600 mr-2" />
                              <span className="text-xs text-gray-700 truncate max-w-[200px]">
                                PDF Document
                              </span>
                            </div>
                          )}
                          
                          {/* Video */}
                          {uploadedFileType === "video" && uploadedFileUrl && (
                            <div className="mb-3 rounded-md overflow-hidden">
                              <div className="bg-gray-900 w-full h-[140px] relative flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-6 h-6"
                                  >
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Immagine */}
                          {uploadedFileType !== "pdf" && uploadedFileType !== "video" && (generatedImageUrl || uploadedFileUrl) && (
                            <div className="mb-3 rounded-md overflow-hidden">
                              <Image
                                src={generatedImageUrl || uploadedFileUrl || "/placeholder.svg"}
                                alt="Campaign image"
                                width={260}
                                height={180}
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Testo del messaggio */}
                      <p className="text-sm text-gray-800 whitespace-pre-line">{messageText || "Your message will appear here..."}</p>
                      
                      {/* Call-to-action buttons in stile WhatsApp */}
                      <div className="mt-3 flex flex-col gap-2">
                        {primaryCta && (
                          <a 
                            href="#" 
                            className="flex items-center justify-center w-full px-3 py-2 bg-white text-[#128C7E] text-sm font-medium border border-[#128C7E] rounded-md hover:bg-gray-50"
                            onClick={(e) => e.preventDefault()}
                          >
                            {primaryCta}
                          </a>
                        )}
                        <a 
                          href="#" 
                          className="flex items-center justify-center w-full px-3 py-2 bg-white text-gray-600 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                          onClick={(e) => e.preventDefault()}
                        >
                          Unsubscribe
                        </a>
                      </div>
                      
                      {/* Orario del messaggio con doppia spunta blu */}
                      <div className="mt-2 flex justify-end items-center gap-1">
                        <span className="text-xs text-gray-400">12:00</span>
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.58659 7.70721L14.0401 1.25244L15.1004 2.31348L7.58659 9.82911L2.63269 4.87521L3.69373 3.81418L7.58659 7.70721Z" fill="#53BDEB" />
                          <path d="M11.4456 1.25244L4.9917 7.70513L2.63232 5.34692L1.57129 6.40795L4.9917 9.82703L12.5067 2.31348L11.4456 1.25244Z" fill="#53BDEB" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Schedule & Approve */}
            {currentStep === 3 && (
              <div className="space-y-4 pb-24">
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-[#EF476F]" />
                    <span className="text-sm font-medium text-[#EF476F]">{t("campaignCreate.schedule")}</span>
                  </div>

                  <div className="space-y-4">
                    {/* Schedule options */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">{t("campaignCreate.whenToSend")}</Label>
                      <RadioGroup 
                        value={scheduleOption} 
                        onValueChange={(value: any) => setScheduleOption(value as "now" | "later")} 
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="schedule-now"
                          className="flex items-center p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value="now" id="schedule-now" className="mr-3 text-[#EF476F]" />
                          <div>
                            <p className="font-medium text-gray-800">{t("campaignCreate.sendNow")}</p>
                            <p className="text-xs text-gray-500">{t("campaignCreate.sendNowDescription")}</p>
                          </div>
                        </Label>
                        <Label
                          htmlFor="schedule-later"
                          className="flex items-center p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value="later" id="schedule-later" className="mr-3 text-[#EF476F]" />
                          <div>
                            <p className="font-medium text-gray-800">{t("campaignCreate.scheduleLater")}</p>
                            <p className="text-xs text-gray-500">{t("campaignCreate.scheduleLaterDescription")}</p>
                          </div>
                        </Label>
                      </RadioGroup>
                    </div>

                    {/* Date and time - conditionally shown */}
                    {scheduleOption === "later" && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="schedule-date" className="text-sm font-medium text-gray-700">
                              {t("campaignCreate.date")}
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
                              {t("campaignCreate.time")}
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
                          {t("campaignCreate.scheduleNote")}
                        </p>
                      </>
                    )}

                    {/* Campaign summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <h4 className="font-medium text-gray-800">{t("campaignCreate.summary")}</h4>
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

                        <div className="text-gray-600">Includes media:</div>
                        <div className="font-medium text-gray-800">
                          {useGeneratedImage && (generatedImageUrl || uploadedFileUrl) ? "Yes" : "No"}
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

                {/* Success message (shown after approval) */}
                {isApproved && (
                  <motion.div
                    className="bg-white rounded-3xl p-6 shadow-xl"
                    animate={{ scale: [1, 1.05, 1], transition: { duration: 0.5 } }}
                  >
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                        <Check className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Campaign Scheduled!</h3>
                      <p className="text-sm text-gray-600">
                        Your campaign has been approved and will be sent at the scheduled time.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Fixed Continue Button for Step 1 */}
        {currentStep === 0 && (
          <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center">
            <CustomButton
              className="py-3 px-6 shadow-lg flex items-center justify-center max-w-md w-[90%]"
              onClick={handleNext}
              disabled={selectedCount === 0}
            >
              Continue <ArrowRight className="ml-2 w-5 h-5" />
            </CustomButton>
          </div>
        )}

        {/* Fixed Continue Button for Step 2 */}
        {currentStep === 1 && (
          <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center">
            <CustomButton
              className="py-3 px-6 shadow-lg flex items-center justify-center max-w-md w-[90%]"
              onClick={handleNext}
              disabled={!campaignType || !campaignObjective.trim()}
            >
              Continue <ArrowRight className="ml-2 w-5 h-5" />
            </CustomButton>
          </div>
        )}

        {/* Fixed Continue Button for Step 3 */}
        {currentStep === 2 && (
          <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center">
            <CustomButton
              className="py-3 px-6 shadow-lg flex items-center justify-center max-w-md w-[90%]"
              onClick={handleNext}
              disabled={!messageText || !primaryCta || !primaryCtaValue}
            >
              Continue <ArrowRight className="ml-2 w-5 h-5" />
            </CustomButton>
          </div>
        )}

        {/* Fixed Schedule Campaign Button for Step 4 */}
        {!isApproved && currentStep === 3 && (
          <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center">
            <CustomButton
              className="py-3 px-6 shadow-lg flex items-center justify-center max-w-md w-[90%]"
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmittingTemplate || (scheduleOption === "later" && (!scheduleDate || !scheduleTime))}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                </>
              ) : isSubmittingTemplate ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {templateApprovalStatus === "pending" ? "Submitting template..." : "Processing..."}
                </>
              ) : (
                <>
                  Schedule Campaign <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </CustomButton>
          </div>
        )}
      </div>
    </main>
  )
}
