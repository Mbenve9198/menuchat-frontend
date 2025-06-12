"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Send,
  FileText,
  Globe,
  Upload,
  File,
  Link,
  Trophy,
  Settings
} from "lucide-react"
import Image from "next/image"
import { CustomButton } from "@/components/ui/custom-button"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { useParams } from 'next/navigation'
import BubbleBackground from "@/components/bubble-background"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FileUpload } from "@/components/ui/file-upload"

interface Template {
  _id: string
  type: 'MEDIA' | 'CALL_TO_ACTION' | 'REVIEW'
  name: string
  language: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  restaurant: string
  components: {
    body: {
      text: string
    }
    buttons?: Array<{
      type: string
      text: string
      url: string
    }>
    header?: {
      type: string
      format: string
      example: string
    }
  }
  createdAt: string
  updatedAt: string
  rejectionReason?: string
}

// Componente per il mockup di WhatsApp
function WhatsAppMockup({ 
  message, 
  userMessage = "Hello", 
  restaurantName = "Restaurant", 
  restaurantPhoto = "",
  showMenuPdf = false,
  showMenuUrl = false,
  showReviewCta = false,
  reviewButtonText = "Leave Review",
  menuButtonText = "Menu",
  menuUrl = "",
  reviewUrl = ""
}: { 
  message: string, 
  userMessage?: string, 
  restaurantName?: string, 
  restaurantPhoto?: string,
  showMenuPdf?: boolean,
  showMenuUrl?: boolean,
  showReviewCta?: boolean,
  reviewButtonText?: string,
  menuButtonText?: string,
  menuUrl?: string,
  reviewUrl?: string
}) {
  // Funzione per formattare il messaggio come lo fa il nuovo sistema RestaurantMessage
  const formatMessageLikeBackend = () => {
    // Sostituisce {{1}} con il nome del cliente e eventuali altre variabili
    let formattedMessage = message.replace(/\{\{1\}\}/g, 'Marco');
    formattedMessage = formattedMessage.replace(/\{restaurantName\}/g, restaurantName);
    
    // Aggiungi la CTA esattamente come fa il backend RestaurantMessage.generateFinalMessage()
    // Il backend aggiunge: finalMessage += `\n\n${this.ctaText}: ${this.ctaUrl}`;
    if (showMenuUrl && menuUrl) {
      formattedMessage += `\n\n${menuButtonText}: ${menuUrl}`;
    }
    
    if (showReviewCta && reviewUrl) {
      formattedMessage += `\n\n${reviewButtonText}: ${reviewUrl}`;
    }
    
    return formattedMessage;
  };

  return (
    <div className="flex flex-col gap-3 py-4">
      {/* Data */}
      <div className="flex justify-center mb-1">
        <div className="bg-white/80 px-2 py-1 rounded-lg text-[10px] md:text-xs text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {/* Messaggio dell'utente */}
      <motion.div 
        className="self-end max-w-[90%]"
        animate={{ y: [0, -4, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut" 
        }}
      >
        <div className="bg-[#DCF8C6] p-3 md:p-4 rounded-xl shadow-sm relative">
          <p className="text-sm md:text-base">{userMessage}</p>
          <div className="text-right mt-1">
            <span className="text-[10px] md:text-xs text-gray-500">{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs text-[#4FC3F7] ml-1">✓✓</span>
          </div>
        </div>
      </motion.div>
      
      {/* Messaggio del ristorante */}
      <motion.div 
        className="self-start max-w-[90%]"
        animate={{ y: [0, -4, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 3.5,
          ease: "easeInOut",
          delay: 0.5 
        }}
      >
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-md relative">
          {/* Intestazione con nome ristorante e foto */}
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0 mr-2">
              {restaurantPhoto ? (
                <img 
                  src={restaurantPhoto} 
                  alt={restaurantName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M10 0a10 10 0 100 20 10 10 0 000-20zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span className="font-medium text-sm md:text-base">{restaurantName}</span>
          </div>
          
          {/* Se il menu è un PDF, mostra l'anteprima del file */}
          {showMenuPdf && (
            <div className="mb-3 flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded flex items-center justify-center text-white text-xs md:text-sm font-bold">
                PDF
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-900">Menu.pdf</p>
                <p className="text-[10px] md:text-xs text-gray-500">PDF Document</p>
              </div>
            </div>
          )}
          
          {/* Corpo del messaggio con CTA integrate */}
          <p className="text-sm md:text-base whitespace-pre-wrap">{formatMessageLikeBackend()}</p>
          
          <div className="text-right mt-2">
            <span className="text-[10px] md:text-xs text-gray-500">{new Date().getHours()}:{(new Date().getMinutes() + 1).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Funzione per ottenere il trigger word basato sul nome del ristorante e la configurazione
function getTriggerWord(restaurantName: string, botConfig: {triggerWord: string} | null): string {
  // Dato che l'API non è implementata nel backend, usiamo "Menu" come trigger word di default
  return "Menu";
}

// Funzione per pulire il nome del ristorante da suffissi o nomi di file
function cleanRestaurantName(name: string): string {
  if (!name) return "Restaurant";
  
  // Rimuovi eventuali suffissi come "_menu_pdf_123"
  const cleanName = name.replace(/_(menu|pdf).*$/i, '');
  
  // Rimuovi eventuali estensioni di file
  const withoutExtension = cleanName.replace(/\.(pdf|docx?|jpe?g|png)$/i, '');
  
  // Converti underscore in spazi
  const withSpaces = withoutExtension.replace(/_/g, ' ');
  
  // Capitalizziamo ogni parola
  const capitalized = withSpaces.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return capitalized;
}

// Componente per una singola template card
function TemplateCard({ 
  template, 
  onRegenerate, 
  editMode,
  editedMessage,
  isGenerating,
  botConfig,
  restaurantPhoto,
  restaurantName,
  reviewSettings
}: { 
  template: Template, 
  onRegenerate: () => void,
  editMode: boolean,
  editedMessage: string,
  isGenerating: boolean,
  botConfig: {triggerWord: string} | null,
  restaurantPhoto: string,
  restaurantName?: string,
  reviewSettings?: {
    reviewLink: string;
    reviewPlatform: string;
    reviewTimer: number;
    messagingHours: any;
  }
}) {
  const { toast } = useToast()

  // Determina quale messaggio visualizzare nel mockup
  const displayMessage = editMode ? editedMessage : template.components.body.text;
  const isMenuPdf = template.type === 'MEDIA';
  const isMenuUrl = template.type === 'CALL_TO_ACTION';
  const isReview = template.type === 'REVIEW';
  
  // Ottieni il testo del pulsante dal template o usa quello modificato
  const getButtonText = () => {
    // Per i template di recensione, usa sempre il testo hardcoded dal backend
    if (isReview) {
      // Valori hardcoded dal backend per le recensioni - allineati con RestaurantMessage.js
      const reviewButtonTexts: Record<string, string> = {
        'it': '⭐ Lascia una recensione',
        'en': '⭐ Leave a review', 
        'es': '⭐ Deja una reseña',
        'de': '⭐ Bewertung abgeben',
        'fr': '⭐ Laisser un avis'
      };
      return reviewButtonTexts[template.language] || '⭐ Lascia una recensione';
    }
    
    // Per i template di tipo CALL_TO_ACTION (menu), prendi il testo dal pulsante
    if (isMenuUrl && template.components.buttons && template.components.buttons.length > 0) {
      return template.components.buttons[0].text;
    }
    
    // Valori di default per menu
    const defaultTexts: Record<string, string> = {
      'it': '🔗 Menu',
      'en': '🔗 Menu',
      'es': '🔗 Menú',
      'de': '🔗 Menü',
      'fr': '🔗 Menu'
    };
    
    return defaultTexts[template.language] || '🔗 Menu';
  };

  // Ottieni gli URL per il mockup
  const getMenuUrl = () => {
    if (isMenuUrl && template.components.buttons && template.components.buttons.length > 0) {
      return template.components.buttons[0].url;
    }
    return "";
  };

  const getReviewUrl = () => {
    if (isReview) {
      // Prima controlla se il template ha un URL specifico
      if (template.components.buttons && template.components.buttons.length > 0) {
        return template.components.buttons[0].url;
      }
      // Fallback all'URL dalle impostazioni del ristorante
      return reviewSettings?.reviewLink || "";
    }
    return "";
  };
  
  return (
    <div className="mb-8 sm:mb-10">
      {/* WhatsApp messages mockup */}
      <WhatsAppMockup 
        message={displayMessage} 
        userMessage={isReview ? "Order completed! 🎉" : `${getTriggerWord(restaurantName || "Restaurant", botConfig)}`}
        restaurantName={restaurantName || cleanRestaurantName(template.name)}
        restaurantPhoto={restaurantPhoto}
        showMenuPdf={isMenuPdf}
        showMenuUrl={isMenuUrl}
        showReviewCta={isReview}
        reviewButtonText={getButtonText()}
        menuButtonText={isMenuUrl ? getButtonText() : "Menu"}
        menuUrl={getMenuUrl()}
        reviewUrl={getReviewUrl()}
      />
    </div>
  );
}

export default function TemplatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.restaurantId as string || session?.user?.restaurantId
  const [menuTemplates, setMenuTemplates] = useState<Template[]>([])
  const [reviewTemplates, setReviewTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editedMessage, setEditedMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>("") // Per il tab delle lingue
  const [activeTab, setActiveTab] = useState("menu") // menu o review
  const [botConfig, setBotConfig] = useState<{triggerWord: string} | null>(null) // Configurazione bot
  const [restaurantProfileImage, setRestaurantProfileImage] = useState<string>("")
  const [restaurantName, setRestaurantName] = useState<string>("Restaurant") // Nome effettivo del ristorante
  const [reviewSettings, setReviewSettings] = useState<{
    reviewLink: string;
    reviewPlatform: 'google' | 'yelp' | 'tripadvisor' | 'custom';
    reviewTimer: number;
    messagingHours: {
      enabled: boolean;
      startHour: number;
      endHour: number;
      timezone: string;
    };
  }>({
    reviewLink: '',
    reviewPlatform: 'google',
    reviewTimer: 120,
    messagingHours: {
      enabled: true,
      startHour: 9,
      endHour: 23,
      timezone: 'Europe/Rome'
    }
  })
  const [isEditingReviewSettings, setIsEditingReviewSettings] = useState(false)
  const [isUpdatingReviewSettings, setIsUpdatingReviewSettings] = useState(false)
  const { toast } = useToast()
  
  // Stato per la dialog di conferma
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [templateToSave, setTemplateToSave] = useState<Template | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Ref al template selezionato
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  
  // Stati per la gestione del menu
  const [menuType, setMenuType] = useState<"url" | "file">("url")
  const [menuUrl, setMenuUrl] = useState("")
  const [menuFile, setMenuFile] = useState<File | null>(null)
  const [menuPdfUrl, setMenuPdfUrl] = useState("")
  const [isUploadingMenu, setIsUploadingMenu] = useState(false)
  const [showTypeChangeAlert, setShowTypeChangeAlert] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  // Stato per l'URL di recensione in modifica nel banner
  const [editedReviewUrl, setEditedReviewUrl] = useState("")

  // Ottenere tutte le lingue disponibili nei template
  const availableLanguages = () => {
    const templates = activeTab === "menu" 
      ? menuTemplates 
      : reviewTemplates;
      
    // Estrai le lingue uniche e ordina, ma metti sempre l'inglese per primo se presente
    const languages = Array.from(new Set(templates.map(t => t.language)));
    
    // Riordina l'array mettendo 'en' in prima posizione se presente
    if (languages.includes('en')) {
      const result = ['en', ...languages.filter(lang => lang !== 'en')];
      return result;
    }
    
    return languages.sort();
  }

  useEffect(() => {
    // Aggiorna la lingua corrente quando cambiano i templates o il tab
    const languages = availableLanguages();
    if (languages.length > 0) {
      // Se la lingua corrente è tra quelle disponibili, mantienila
      if (currentLanguage && languages.includes(currentLanguage)) {
        return;
      }
      // Se c'è "en" tra le lingue disponibili e non c'è una lingua corrente, usa "en"
      if (languages.includes('en') && !currentLanguage) {
        setCurrentLanguage('en');
      } 
      // Se non c'è una lingua corrente o non è tra quelle disponibili, prendi la prima
      else if (!currentLanguage || !languages.includes(currentLanguage)) {
        setCurrentLanguage(languages[0]);
      }
    }
  }, [menuTemplates, reviewTemplates, activeTab]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }

    if (status === "authenticated" && session.user.restaurantId) {
      fetchTemplates()
      fetchRestaurantProfileImage()
      fetchReviewSettings()
    }
  }, [status, session])

  const fetchRestaurantProfileImage = async () => {
    if (!restaurantId) return

    try {
      const response = await fetch(`/api/restaurants?restaurantId=${restaurantId}&profileImage=true`)
      const data = await response.json()
      
      if (data.success && data.profileImage) {
        setRestaurantProfileImage(data.profileImage)
      }
    } catch (error) {
      console.error('Error fetching restaurant profile image:', error)
    }
  }

  const fetchReviewSettings = async () => {
    if (!restaurantId) return

    try {
      const response = await fetch(`/api/templates?restaurantId=${restaurantId}&reviewSettings=true`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Nel nuovo sistema, le review settings sono salvate nel ristorante e bot configuration
        if (data.reviewSettings) {
        setReviewSettings({
          reviewLink: data.reviewSettings.reviewLink || '',
            reviewPlatform: data.reviewSettings.reviewPlatform || 'google',
            reviewTimer: data.reviewSettings.reviewTimer || 120,
            messagingHours: data.reviewSettings.messagingHours || {
              enabled: true,
              startHour: 9,
              endHour: 23,
              timezone: 'Europe/Rome'
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching review settings:', error)
      // Non mostriamo errore per le review settings, è una funzionalità secondaria
    }
  }

  const fetchTemplates = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/templates?restaurantId=${restaurantId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Impossibile caricare i template')
      }

      if (data.success) {
        // I dati sono già nel formato RestaurantMessage
        const menuMessages = data.messages.filter((msg: any) => msg.messageType === 'menu')
        const reviewMessages = data.messages.filter((msg: any) => msg.messageType === 'review')
        
        // Trasforma i RestaurantMessage nel formato Template per compatibilità con l'UI
        const transformToTemplate = (message: any): Template => ({
          _id: message._id,
          type: message.messageType === 'menu' && message.mediaUrl ? 'MEDIA' : 
                message.messageType === 'menu' ? 'CALL_TO_ACTION' : 'REVIEW',
          name: `${message.restaurant.name} - ${message.messageType} - ${message.language}`,
          language: message.language,
          status: 'APPROVED', // I RestaurantMessage sono sempre approvati
          restaurant: message.restaurant._id,
          components: {
            body: {
              text: message.messageBody
            },
            ...(message.messageType === 'menu' && message.ctaUrl && {
              buttons: [{
                type: 'URL',
                text: message.ctaText || 'Menu',
                url: message.ctaUrl
              }]
            }),
            ...(message.messageType === 'review' && message.ctaUrl && {
              buttons: [{
                type: 'URL',
                text: message.ctaText || 'Leave Review',
                url: message.ctaUrl
              }]
            }),
            ...(message.mediaUrl && {
              header: {
                type: 'DOCUMENT',
                format: 'DOCUMENT',
                example: message.mediaUrl
              }
            })
          },
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        })
        
        setMenuTemplates(menuMessages.map(transformToTemplate))
        setReviewTemplates(reviewMessages.map(transformToTemplate))
        
        // Aggiorna il nome del ristorante se disponibile
        if (data.messages.length > 0 && data.messages[0].restaurant?.name) {
          setRestaurantName(data.messages[0].restaurant.name)
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Errore nel caricamento",
        description: error instanceof Error ? error.message : "Impossibile caricare i template",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (template: Template) => {
    if (selectedTemplate?._id === template._id && isEditorOpen) {
      // Se è già selezionato, chiudi l'editor
      setIsEditorOpen(false);
      setSelectedTemplate(null);
    } else {
      // Altrimenti, seleziona il template e apri l'editor
      setSelectedTemplate(template);
      setEditedMessage(template.components.body.text);
      setIsEditorOpen(true);
      
      // Determina il tipo di menu in base al tipo di template
      if (template.type === 'MEDIA') {
        setMenuType("file");
        setMenuPdfUrl(template.components.header?.example || "");
        setMenuUrl("");
      } else if (template.type === 'CALL_TO_ACTION') {
        setMenuType("url");
        setMenuUrl(template.components.buttons?.[0]?.url || "");
        setMenuPdfUrl("");
        setMenuFile(null);
      } else if (template.type === 'REVIEW') {
        // Per i template di recensione, carica l'URL di recensione dal template specifico
        const templateReviewUrl = template.components.buttons?.[0]?.url || "";
        setEditedReviewUrl(templateReviewUrl || reviewSettings.reviewLink || "");
      }
    }
  }

  const initiateTemplateSave = () => {
    if (!selectedTemplate) return;
    setTemplateToSave(selectedTemplate);
    setSaveDialogOpen(true);
  }
  
  const cancelEdit = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
    setMenuFile(null);
    setMenuUrl("");
    setMenuPdfUrl("");
    setEditedReviewUrl("");
    setShowTypeChangeAlert(false);
  }
  
  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setMenuFile(null);
      setMenuPdfUrl("");
      return;
    }
    
    setMenuFile(file);
    setMenuType("file");
    setIsUploadingMenu(true);
    
    try {
      // Creiamo un FormData per la richiesta
      const formData = new FormData();
      formData.append('file', file);
      formData.append('languageCode', currentLanguage);
      
      if (selectedTemplate) {
        formData.append('restaurantName', selectedTemplate.name || 'restaurant');
      }
      
      // Inviamo la richiesta al nostro endpoint di upload
      const response = await fetch('/api/upload/menu-pdf', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante il caricamento del file');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMenuPdfUrl(data.file.url);
        toast({
          title: "Upload completato",
          description: `Il menu PDF è stato caricato con successo.`,
        });
      } else {
        throw new Error(data.error || 'Errore durante il caricamento del file');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Errore di caricamento",
        description: error.message || "Si è verificato un errore durante il caricamento del file.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingMenu(false);
    }
  }
  
  const handleUrlChange = (url: string) => {
    setMenuUrl(url);
    if (url) setMenuType("url");
  }
  
  const saveTemplate = async (updateAllLanguages: boolean) => {
    if (!templateToSave) return;
    
    try {
      setIsSaving(true);
      setSaveDialogOpen(false);
      
      const menuData = menuType === "file" ? { 
        menuPdfUrl,
        menuFile: menuFile ? {
          name: menuFile.name,
          type: menuFile.type,
          size: menuFile.size
        } : null
      } : { menuUrl };
      
      // Per messaggi normali, creiamo la struttura del messaggio
      const messageData = {
        messageBody: editedMessage,
        messageType: templateToSave.type === 'MEDIA' ? 'media' : 
                    templateToSave.type === 'CALL_TO_ACTION' ? 'menu_url' : 'review',
        menuUrl: menuType === "url" ? menuUrl : "",
        mediaUrl: menuType === "file" ? menuPdfUrl : "",
        language: templateToSave.language,
        restaurantId
      };
      
      // Se è un template di recensione, salva anche l'URL di recensione
      if (templateToSave.type === 'REVIEW' && editedReviewUrl !== reviewSettings.reviewLink) {
        // Prima aggiorna le impostazioni del ristorante
        const reviewUpdateResponse = await fetch(`/api/templates`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            restaurantId,
            reviewLink: editedReviewUrl,
            reviewPlatform: reviewSettings.reviewPlatform,
            reviewTimer: reviewSettings.reviewTimer,
            messagingHours: reviewSettings.messagingHours
          })
        });

        if (!reviewUpdateResponse.ok) {
          const errorData = await reviewUpdateResponse.json();
          throw new Error(errorData.error || 'Errore nel salvare l\'URL di recensione');
        }
        
        // Aggiorna lo stato locale
        setReviewSettings(prev => ({
          ...prev,
          reviewLink: editedReviewUrl
        }));
      }
      
      // Per la gestione multi-lingua, se updateAllLanguages è true
      const languagesToUpdate = updateAllLanguages ? 
        availableLanguages() : 
        [templateToSave.language];
      
      // Aggiorna i messaggi per tutte le lingue selezionate
      for (const langCode of languagesToUpdate) {
        const response = await fetch(`/api/templates/${templateToSave._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...messageData,
            language: langCode,
            updateAllLanguages: updateAllLanguages && langCode === templateToSave.language
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Errore nel salvare il messaggio per ${langCode}`);
        }
      }
      
      toast({
        title: "Messaggio salvato!",
        description: updateAllLanguages ? 
          "Il messaggio è stato aggiornato per tutte le lingue" : 
          "Il messaggio è stato aggiornato con successo",
      });
      
      // Ricarica i template aggiornati
      await fetchTemplates();
      
      // Chiudi l'editor
      setIsEditorOpen(false);
      setSelectedTemplate(null);
      
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Errore nel salvare",
        description: error instanceof Error ? error.message : "Impossibile salvare il messaggio",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setTemplateToSave(null);
    }
  }

  const regenerateWithAI = async (template: Template) => {
    try {
      setIsGenerating(true)
      
      // Prepara i dati per la rigenerazione del messaggio
      const regenerationData: any = {
        restaurantId,
        language: template.language,
        messageType: template.type === 'MEDIA' ? 'media' : 
                    template.type === 'CALL_TO_ACTION' ? 'menu_url' : 'review'
      }
      
      // Se è un messaggio di menu, aggiungi i dati del menu
      if (template.type === 'MEDIA' || template.type === 'CALL_TO_ACTION') {
        if (template.type === 'MEDIA' && template.components.header?.example) {
          regenerationData.menuPdfUrl = template.components.header.example
        } else if (template.type === 'CALL_TO_ACTION' && template.components.buttons?.[0]?.url) {
          regenerationData.menuUrl = template.components.buttons[0].url
        }
      }
      
      // Se è un messaggio di recensione, aggiungi i dati della recensione
      if (template.type === 'REVIEW') {
        regenerationData.reviewLink = reviewSettings.reviewLink
        regenerationData.reviewPlatform = reviewSettings.reviewPlatform
      }
      
      const response = await fetch(`/api/templates/${template._id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regenerationData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nella rigenerazione del messaggio')
      }
      
      if (!data.success) {
        throw new Error('Formato di risposta non valido')
      }
      
      toast({
        title: "Messaggio rigenerato!",
        description: "Il messaggio è stato ricreato con IA",
      })
      
      // Ricarica i template per mostrare il messaggio aggiornato
      await fetchTemplates()
      
    } catch (error) {
      console.error('Error regenerating message:', error)
      toast({
        title: "Errore nella rigenerazione",
        description: error instanceof Error ? error.message : "Impossibile rigenerare il messaggio",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const updateReviewSettings = async () => {
    if (!restaurantId) return

    try {
      setIsUpdatingReviewSettings(true)
      const response = await fetch(`/api/templates`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId,
          reviewLink: reviewSettings.reviewLink,
          reviewPlatform: reviewSettings.reviewPlatform,
          reviewTimer: reviewSettings.reviewTimer,
          messagingHours: reviewSettings.messagingHours
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Impossibile aggiornare le impostazioni di recensione')
      }

      toast({
        title: "Successo",
        description: "Impostazioni di recensione aggiornate con successo",
      })

      setIsEditingReviewSettings(false)
      
      // Aggiorna i template se necessario
      if (data.updatedTemplates > 0) {
        fetchTemplates()
      }
    } catch (error) {
      console.error('Error updating review settings:', error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiornare le impostazioni di recensione",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingReviewSettings(false)
    }
  }

  // Funzione per ottenere l'emoji della bandiera in base al codice lingua
  const getFlagEmoji = (langCode: string) => {
    // Mappatura tra codici lingua e emoji bandiere
    const flagMap: Record<string, string> = {
      'it': '🇮🇹',
      'en': '🇬🇧',
      'es': '🇪🇸',
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'pt': '🇵🇹',
      'nl': '🇳🇱',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ru': '🇷🇺',
      'ar': '🇸🇦'
    };
    
    return flagMap[langCode] || '🌐';
  }

  // Aggiungi questa funzione per verificare il cambio di tipo
  const handleMenuTypeChange = (value: "url" | "file") => {
    if (selectedTemplate) {
      const isTypeChanging = 
        (value === "url" && selectedTemplate.type === "MEDIA") || 
        (value === "file" && selectedTemplate.type === "CALL_TO_ACTION");
      
      if (isTypeChanging) {
        setShowTypeChangeAlert(true);
      }
    }
    
    setMenuType(value);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  // Ottieni i template per il tab e la lingua corrente
  const getFilteredTemplates = () => {
    const templates = activeTab === "menu" ? menuTemplates : reviewTemplates;
    return templates.filter(t => t.language === currentLanguage);
  }

  const getSelectedTemplateType = () => {
    if (!selectedTemplate) return '';
    if (selectedTemplate.type === 'REVIEW') return 'Review';
    // Determina il tipo in base alla selezione corrente dell'utente
    return menuType === "file" ? 'Menu PDF' : 'Menu URL';
  }

  // Modifica la TemplateCard per usare il nome del ristorante dallo stato
  const TemplateCardWithRestaurantName = (props: any) => {
    return (
      <TemplateCard 
        {...props}
        restaurantName={restaurantName} // Passa il nome del ristorante come prop separata
        reviewSettings={reviewSettings} // Passa le impostazioni di recensione
      />
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200 pb-24">
      <BubbleBackground />

      {/* Overlay scuro quando la modifica è attiva */}
      {isEditorOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-10"
          onClick={cancelEdit}
        ></div>
      )}

      {/* Animazione di successo */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => {
              setTimeout(() => {
                setShowSuccessAnimation(false);
              }, 2000);
            }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center max-w-xs w-full relative overflow-hidden"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
            >
              {/* Sfondo colorato con pattern confetti */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-10" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.1 }}
              />
              
              {/* Confetti che cadono */}
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#ffcc00', '#ff6699', '#33ccff', '#99ff66'][i % 4],
                    left: `${Math.random() * 100}%`,
                    top: `-5%`
                  }}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ 
                    y: ['0%', '100%'], 
                    opacity: [0, 1, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 1.5 + Math.random(), 
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                />
              ))}
              
              {/* Icona e messaggio */}
              <motion.div 
                className="relative z-10 flex flex-col items-center"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.2, 1] }}
                  transition={{ times: [0, 0.5, 1], duration: 0.6 }}
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  
                  {/* Raggi attorno all'icona */}
                  <motion.div
                    className="absolute inset-0 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-4 bg-yellow-400 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          transformOrigin: 'center',
                          transform: `rotate(${i * 45}deg) translateY(-14px)`
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1, 0] }}
                        transition={{ 
                          times: [0, 0.5, 1],
                          duration: 0.6, 
                          delay: 0.2 + (i * 0.05),
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
                
                <motion.h3
                  className="mt-4 text-xl font-bold text-center text-green-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {successMessage}
                </motion.h3>
                
                {/* Immagine mascotte */}
                <motion.div
                  className="absolute -bottom-4 -right-4 w-16 h-16"
                  initial={{ opacity: 0, y: 20, rotate: -10 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
                    alt="Mascot"
                    width={64}
                    height={64}
                    className="drop-shadow-lg"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finestra di dialogo per la conferma */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiorna template in tutte le lingue?</DialogTitle>
            <DialogDescription className="pt-2">
              Puoi scegliere di aggiornare solo questo template o tradurre automaticamente il messaggio e aggiornare tutte le lingue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex sm:justify-between gap-2">
            <CustomButton
              variant="outline"
              onClick={() => saveTemplate(false)}
              disabled={isSaving}
              className="flex-1"
            >
              Solo questa lingua
            </CustomButton>
            <CustomButton 
              onClick={() => saveTemplate(true)}
              disabled={isSaving}
              className="flex-1"
            >
              Tutte le lingue
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className={`relative z-${isEditorOpen ? '5' : '10'} flex flex-col items-center min-h-screen px-2 sm:px-4 py-4 sm:py-6`}>
        <div className="w-full max-w-md mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B9AAA]">Messaggi Menu e Recensioni</h1>
              <p className="text-sm sm:text-base text-gray-700">Gestisci i tuoi messaggi automatici</p>
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

          {/* Tab principale: Menu vs Review */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-3 sm:mb-4">
            <TabsList className="grid grid-cols-2 mb-2 w-full">
              <TabsTrigger value="menu" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Messaggi Menu</span>
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Messaggi Recensioni</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="space-y-3 sm:space-y-4">
              {menuTemplates.length === 0 ? (
                <div className="bg-white rounded-xl p-4 sm:p-6 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">Nessun messaggio di menu disponibile</p>
                </div>
              ) : (
                <>
                  {/* Tab Lingue */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md mb-3 sm:mb-4 overflow-x-auto">
                    <div className="flex justify-center space-x-2 sm:space-x-3">
                      {availableLanguages().map(lang => (
                        <button
                          key={lang}
                          onClick={() => setCurrentLanguage(lang)}
                          className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap rounded-lg flex items-center gap-1.5 sm:gap-2 min-w-[60px] justify-center ${
                            currentLanguage === lang 
                              ? 'bg-blue-100 text-blue-700 font-medium shadow-sm' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-lg">{getFlagEmoji(lang)}</span>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Template Cards */}
                  <div>
                    {getFilteredTemplates().map(template => (
                      <div 
                        key={template._id}
                        onClick={() => !isEditorOpen && handleEdit(template)}
                        className="cursor-pointer"
                      >
                        <TemplateCardWithRestaurantName
                        template={template}
                        onRegenerate={() => regenerateWithAI(template)}
                          editMode={selectedTemplate?._id === template._id && isEditorOpen}
                        editedMessage={editedMessage}
                        isGenerating={isGenerating}
                          botConfig={botConfig}
                          restaurantPhoto={restaurantProfileImage}
                          reviewSettings={reviewSettings}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="review" className="space-y-3 sm:space-y-4">
              {reviewTemplates.length === 0 ? (
                <div className="bg-white rounded-xl p-4 sm:p-6 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">Nessun messaggio di recensione disponibile</p>
                </div>
              ) : (
                <>
                  {/* Pannello impostazioni di recensione */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-800">Impostazioni recensione</h3>
                      <button
                        onClick={() => setIsEditingReviewSettings(!isEditingReviewSettings)}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        {isEditingReviewSettings ? 'Annulla' : 'Modifica'}
                      </button>
                    </div>
                    
                    {isEditingReviewSettings ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="reviewTimer" className="text-xs sm:text-sm mb-1 block">
                            Timer di scheduling (minuti dopo il trigger)
                          </Label>
                          <div className="space-y-2">
                            <input
                              id="reviewTimer"
                              type="range"
                              min="60"
                              max="1440"
                              step="60"
                              value={reviewSettings.reviewTimer}
                              onChange={(e) => setReviewSettings({
                                ...reviewSettings,
                                reviewTimer: parseInt(e.target.value)
                              })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>1h</span>
                              <span className="font-medium text-blue-600">
                                {Math.floor(reviewSettings.reviewTimer / 60)}h {reviewSettings.reviewTimer % 60 > 0 ? `${reviewSettings.reviewTimer % 60}m` : ''}
                              </span>
                              <span>24h</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Il messaggio di recensione verrà inviato automaticamente dopo questo tempo dal primo messaggio del cliente
                          </p>
                        </div>
                        
                        {/* Sezione Fasce Orarie */}
                        <div className="border-t pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs sm:text-sm font-medium">
                              Fasce orarie di invio
                            </Label>
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={reviewSettings.messagingHours.enabled}
                                onChange={(e) => setReviewSettings({
                                  ...reviewSettings,
                                  messagingHours: {
                                    ...reviewSettings.messagingHours,
                                    enabled: e.target.checked
                                  }
                                })}
                                className="sr-only"
                              />
                              <div className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                                reviewSettings.messagingHours.enabled ? 'bg-blue-600' : 'bg-gray-300'
                              }`}>
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  reviewSettings.messagingHours.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                                }`} />
                              </div>
                            </label>
                          </div>
                          
                          {reviewSettings.messagingHours.enabled && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="startHour" className="text-xs text-gray-600 mb-1 block">
                                    Ora inizio
                          </Label>
                          <select
                                    id="startHour"
                                    value={reviewSettings.messagingHours.startHour}
                            onChange={(e) => setReviewSettings({
                              ...reviewSettings,
                                      messagingHours: {
                                        ...reviewSettings.messagingHours,
                                        startHour: parseInt(e.target.value)
                                      }
                                    })}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}:00
                                      </option>
                                    ))}
                          </select>
                        </div>
                        <div>
                                  <Label htmlFor="endHour" className="text-xs text-gray-600 mb-1 block">
                                    Ora fine
                          </Label>
                                  <select
                                    id="endHour"
                                    value={reviewSettings.messagingHours.endHour}
                            onChange={(e) => setReviewSettings({
                              ...reviewSettings,
                                      messagingHours: {
                                        ...reviewSettings.messagingHours,
                                        endHour: parseInt(e.target.value)
                                      }
                                    })}
                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}:59
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500">
                                I messaggi verranno inviati solo nell'orario specificato. 
                                {reviewSettings.messagingHours.startHour <= reviewSettings.messagingHours.endHour 
                                  ? `Attualmente: dalle ${reviewSettings.messagingHours.startHour.toString().padStart(2, '0')}:00 alle ${reviewSettings.messagingHours.endHour.toString().padStart(2, '0')}:59`
                                  : `Attualmente: dalle ${reviewSettings.messagingHours.startHour.toString().padStart(2, '0')}:00 alle ${reviewSettings.messagingHours.endHour.toString().padStart(2, '0')}:59 (attraversa la mezzanotte)`
                                }
                              </p>
                            </div>
                          )}
                          
                          {!reviewSettings.messagingHours.enabled && (
                            <p className="text-xs text-gray-500">
                              Le fasce orarie sono disabilitate. I messaggi verranno inviati in qualsiasi momento.
                            </p>
                          )}
                        </div>
                        
                        <div className="pt-2">
                          <CustomButton
                            size="sm"
                            onClick={updateReviewSettings}
                            disabled={isUpdatingReviewSettings}
                            className="w-full text-xs sm:text-sm justify-center"
                          >
                            {isUpdatingReviewSettings ? (
                              <>
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 animate-spin" />
                                Aggiornamento...
                              </>
                            ) : (
                              'Salva impostazioni'
                            )}
                          </CustomButton>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm">
                        <div className="mb-1">
                          <span className="font-medium">Timer di scheduling: </span>
                          <span className="text-gray-600">
                            {Math.floor(reviewSettings.reviewTimer / 60)}h {reviewSettings.reviewTimer % 60 > 0 ? `${reviewSettings.reviewTimer % 60}m` : ''} dopo il trigger
                          </span>
                        </div>
                        <div className="mb-1">
                          <span className="font-medium">Piattaforma: </span>
                          <span className="text-gray-600 capitalize">{reviewSettings.reviewPlatform}</span>
                        </div>
                        <div>
                          <span className="font-medium">Fasce orarie: </span>
                          {reviewSettings.messagingHours.enabled ? (
                            <span className="text-gray-600">
                              {reviewSettings.messagingHours.startHour <= reviewSettings.messagingHours.endHour 
                                ? `${reviewSettings.messagingHours.startHour.toString().padStart(2, '0')}:00 - ${reviewSettings.messagingHours.endHour.toString().padStart(2, '0')}:59`
                                : `${reviewSettings.messagingHours.startHour.toString().padStart(2, '0')}:00 - ${reviewSettings.messagingHours.endHour.toString().padStart(2, '0')}:59 (attraversa mezzanotte)`
                              }
                          </span>
                          ) : (
                            <span className="text-gray-600">Sempre attive</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tab Lingue */}
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md mb-3 sm:mb-4 overflow-x-auto">
                    <div className="flex justify-center space-x-2 sm:space-x-3">
                      {availableLanguages().map(lang => (
                        <button
                          key={lang}
                          onClick={() => setCurrentLanguage(lang)}
                          className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap rounded-lg flex items-center gap-1.5 sm:gap-2 min-w-[60px] justify-center ${
                            currentLanguage === lang 
                              ? 'bg-blue-100 text-blue-700 font-medium shadow-sm' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-lg">{getFlagEmoji(lang)}</span>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Template Cards */}
                  <div>
                    {getFilteredTemplates().map(template => (
                      <div 
                        key={template._id}
                        onClick={() => !isEditorOpen && handleEdit(template)}
                        className="cursor-pointer"
                      >
                        <TemplateCardWithRestaurantName
                        template={template}
                        onRegenerate={() => regenerateWithAI(template)}
                          editMode={selectedTemplate?._id === template._id && isEditorOpen}
                        editedMessage={editedMessage}
                        isGenerating={isGenerating}
                          botConfig={botConfig}
                          restaurantPhoto={restaurantProfileImage}
                          reviewSettings={reviewSettings}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Banner fisso in basso per modificare il template */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-20 bg-white shadow-lg transition-all duration-300 rounded-t-2xl ${
          isEditorOpen 
            ? 'h-[60vh] max-h-[600px]' 
            : 'h-16'
        }`}
      >
        <div className="container mx-auto max-w-md p-4 h-full flex flex-col">
          {isEditorOpen && selectedTemplate ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm md:text-base font-medium">
                  Modifica {getSelectedTemplateType()} Template ({currentLanguage})
                </h3>
                <button 
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              {/* Link alla configurazione opt-in marketing (solo per menu) */}
              {selectedTemplate.type !== 'REVIEW' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Opt-in Marketing</p>
                        <p className="text-xs text-blue-600">Raccogli consensi prima del menu</p>
                      </div>
                    </div>
                    <CustomButton
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/templates/marketing-optin')}
                      className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Configura
                    </CustomButton>
                  </div>
                </div>
              )}
              
              <div className="flex-grow overflow-y-auto mb-4">
                {/* Avviso cambio tipo template */}
                {showTypeChangeAlert && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Stai cambiando il tipo di template
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          {menuType === "url" 
                            ? "Stai passando da PDF a URL. Questo creerà un nuovo template con un pulsante invece del PDF." 
                            : "Stai passando da URL a PDF. Questo creerà un nuovo template con un PDF invece del pulsante link."}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Il template originale verrà disattivato e dovremo inviare il nuovo template per approvazione.
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <button
                        onClick={() => setShowTypeChangeAlert(false)}
                        className="text-xs text-amber-800 hover:text-amber-900"
                      >
                        Ho capito
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Input per modificare il messaggio */}
                <Textarea
                  value={editedMessage}
                  onChange={(e) => setEditedMessage(e.target.value)}
                  className="w-full mb-3 min-h-[80px] text-sm md:text-base rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  placeholder="Write your message..."
                />
                
                {/* Opzioni per il tipo di menu (solo per i template di tipo menu) */}
                {selectedTemplate.type !== 'REVIEW' && (
                  <div className="mb-3">
                    <Tabs
                      value={menuType}
                      onValueChange={(value) => handleMenuTypeChange(value as "url" | "file")}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 mb-3">
                        <TabsTrigger value="url" className="flex items-center gap-1.5">
                          <Link className="w-3.5 h-3.5" />
                          Menu URL
                        </TabsTrigger>
                        <TabsTrigger value="file" className="flex items-center gap-1.5">
                          <File className="w-3.5 h-3.5" />
                          Upload PDF
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="url" className="space-y-3 mt-2">
                        <Label htmlFor="menu-url" className="text-gray-700 text-sm">
                          Menu URL
                        </Label>
                        <Input
                          id="menu-url"
                          placeholder="https://your-restaurant.com/menu"
                          value={menuUrl}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </TabsContent>

                      <TabsContent value="file" className="space-y-3 mt-2">
                        <Label className="text-gray-700 text-sm block mb-2">
                          Upload PDF Menu
                        </Label>
                        
                        {menuPdfUrl ? (
                          <div className="space-y-3">
                            <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-50">
                              <File className="w-8 h-8 text-green-500 mb-2" />
                              <p className="text-sm text-green-700 mb-1">PDF caricato con successo</p>
                              <a 
                                href={menuPdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline mb-2"
                              >
                                Visualizza PDF attuale
                              </a>
                              <CustomButton
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setMenuPdfUrl("");
                                  setMenuFile(null);
                                }}
                                className="text-xs"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Sostituisci PDF
                              </CustomButton>
                            </div>
                          </div>
                        ) : (
                          <FileUpload
                            selectedFile={menuFile}
                            onFileSelect={handleFileChange}
                            accept=".pdf"
                            maxSize={5}
                          />
                        )}
                        
                        {isUploadingMenu && (
                          <div className="flex items-center mt-2 text-blue-600">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span className="text-xs">Caricamento in corso...</span>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
                
                {/* Opzioni per i template di recensione */}
                {selectedTemplate.type === 'REVIEW' && (
                  <div className="mb-3">
                    <Label className="text-gray-700 text-sm block mb-2">
                      Impostazioni Recensione
                    </Label>
                    <p className="text-xs text-gray-500 mb-3">
                      Il testo del pulsante è automaticamente "⭐ Lascia una recensione" e il timer di scheduling è configurabile nelle impostazioni sopra.
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="review-url" className="text-gray-700 text-sm">
                          URL Recensione
                        </Label>
                        <Input
                          id="review-url"
                          placeholder="https://g.page/your-restaurant/review"
                          value={editedReviewUrl}
                          onChange={(e) => setEditedReviewUrl(e.target.value)}
                          className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Questo URL verrà usato nel pulsante di recensione del messaggio
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <CustomButton
                  variant="outline"
                  className="text-sm py-3 justify-center"
                  onClick={cancelEdit}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="outline"
                  className="text-sm py-3 justify-center"
                  onClick={() => regenerateWithAI(selectedTemplate)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Regenerate
                    </>
                  )}
                </CustomButton>
                <CustomButton
                  className="text-sm py-3 justify-center"
                  onClick={initiateTemplateSave}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Save
                </CustomButton>
              </div>
            </>
          ) : (
            <div className="flex justify-center h-full items-center">
              <CustomButton
                className="w-full text-center flex items-center justify-center py-2 px-4"
                onClick={() => {
                  if (getFilteredTemplates().length > 0) {
                    handleEdit(getFilteredTemplates()[0])
                  }
                }}
                disabled={getFilteredTemplates().length === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Message
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 