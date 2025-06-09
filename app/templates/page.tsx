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
  RefreshCw,
  Upload,
  File,
  Link,
  Trophy
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
  menuButtonText = "Menu"
}: { 
  message: string, 
  userMessage?: string, 
  restaurantName?: string, 
  restaurantPhoto?: string,
  showMenuPdf?: boolean,
  showMenuUrl?: boolean,
  showReviewCta?: boolean,
  reviewButtonText?: string,
  menuButtonText?: string
}) {
  // Determina il testo del pulsante corretto in base al tipo
  const buttonText = showMenuUrl ? menuButtonText : reviewButtonText;
  
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
          
          <p className="text-sm md:text-base whitespace-pre-wrap">{message.replace('{customerName}', 'Marco')}</p>
          
          {/* Se il menu è un URL o è una recensione con CTA, mostra il pulsante appropriato */}
          {(showMenuUrl || showReviewCta) && (
            <div className="mt-3 border-t pt-2 border-gray-200">
              <div className="flex justify-center w-full">
                <button className="bg-[#e9f2fd] text-[#127def] text-xs sm:text-sm py-2 px-4 rounded-3xl font-medium">
                  {buttonText}
                </button>
              </div>
            </div>
          )}
          
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
  editedButtonText,
  isGenerating,
  botConfig,
  restaurantPhoto,
  onCheckStatus,
  isCheckingStatus,
  restaurantName
}: { 
  template: Template, 
  onRegenerate: () => void,
  editMode: boolean,
  editedMessage: string,
  editedButtonText: string,
  isGenerating: boolean,
  botConfig: {triggerWord: string} | null,
  restaurantPhoto: string,
  onCheckStatus: (templateId: string) => void,
  isCheckingStatus: string | null,
  restaurantName?: string
}) {
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-500'
      case 'REJECTED':
        return 'text-red-500'
      default:
        return 'text-amber-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✅'
      case 'REJECTED':
        return '❌'
      case 'PENDING':
        return '⏳'
      default:
        return '❓'
    }
  }

  // Determina quale messaggio visualizzare nel mockup
  const displayMessage = editMode ? editedMessage : template.components.body.text;
  const isMenuPdf = template.type === 'MEDIA';
  const isMenuUrl = template.type === 'CALL_TO_ACTION';
  const isReview = template.type === 'REVIEW';
  
  // Ottieni il testo del pulsante dal template o usa quello modificato
  const getButtonText = () => {
    if (editMode) {
      return editedButtonText;
    }
    
    // Per i template di tipo CALL_TO_ACTION, prendi il testo dal pulsante
    if (isMenuUrl && template.components.buttons && template.components.buttons.length > 0) {
      return template.components.buttons[0].text;
    }
    
    // Per i template di recensione
    if (isReview && template.components.buttons && template.components.buttons.length > 0) {
      return template.components.buttons[0].text;
    }
    
    // Valori di default in base alla lingua
    const defaultTexts: Record<string, string> = {
      'it': isMenuUrl ? 'Menu' : 'Lascia Recensione',
      'en': isMenuUrl ? 'Menu' : 'Leave Review',
      'es': isMenuUrl ? 'Menú' : 'Dejar Reseña',
      'de': isMenuUrl ? 'Menü' : 'Bewertung abgeben',
      'fr': isMenuUrl ? 'Menu' : 'Laisser Avis'
    };
    
    return defaultTexts[template.language] || (isMenuUrl ? 'Menu' : 'Leave Review');
  };
  
  return (
    <div className="mb-8 sm:mb-10">
      {/* Status container */}
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md mb-4 sm:mb-5">
        <div className="flex flex-col items-center justify-center">
          <div 
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(template.status)} bg-opacity-10 mb-1`}
          >
            <span className="text-lg mr-1">{getStatusIcon(template.status)}</span>
            {template.status}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Impedisce la propagazione al genitore
                onCheckStatus(template._id);
              }}
              className="flex items-center justify-center w-6 h-6 ml-1 text-gray-500 hover:text-blue-500 transition-colors"
              title="Aggiorna stato approvazione"
              disabled={isCheckingStatus === template._id}
            >
              {isCheckingStatus === template._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Last update: {new Date(template.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {template.status === 'REJECTED' && template.rejectionReason && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100">
            <p className="text-[10px] sm:text-xs text-red-700">
              <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
              Rejection reason: {template.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* WhatsApp messages - now without container */}
      <WhatsAppMockup 
        message={displayMessage} 
        userMessage={isReview ? "Order completed! 🎉" : `${getTriggerWord(restaurantName || "Restaurant", botConfig)}`}
        restaurantName={restaurantName || cleanRestaurantName(template.name)}
        restaurantPhoto={restaurantPhoto}
        showMenuPdf={isMenuPdf}
        showMenuUrl={isMenuUrl}
        showReviewCta={isReview}
        reviewButtonText={isReview ? getButtonText() : "Leave Review"}
        menuButtonText={isMenuUrl ? getButtonText() : "Menu"}
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
  const [editedButtonText, setEditedButtonText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>("") // Per il tab delle lingue
  const [activeTab, setActiveTab] = useState("menu") // menu o review
  const [botConfig, setBotConfig] = useState<{triggerWord: string} | null>(null) // Configurazione bot
  const [restaurantProfileImage, setRestaurantProfileImage] = useState<string>("")
  const [restaurantName, setRestaurantName] = useState<string>("Restaurant") // Nome effettivo del ristorante
  const [reviewSettings, setReviewSettings] = useState<{
    reviewLink: string;
    reviewPlatform: 'google' | 'yelp' | 'tripadvisor' | 'custom';
  }>({
    reviewLink: '',
    reviewPlatform: 'google'
  })
  const [isEditingReviewSettings, setIsEditingReviewSettings] = useState(false)
  const [isUpdatingReviewSettings, setIsUpdatingReviewSettings] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState<string | null>(null)
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
      setIsLoading(true)
      const response = await fetch(`/api/templates?restaurantId=${restaurantId}&reviewSettings=true`)
      const data = await response.json()
      
      if (data.success && data.reviewSettings) {
        setReviewSettings({
          reviewLink: data.reviewSettings.reviewLink || '',
          reviewPlatform: data.reviewSettings.reviewPlatform || 'google'
        })
      }
    } catch (error) {
      console.error('Error fetching review settings:', error)
      toast({
        title: "Errore",
        description: "Impossibile caricare le impostazioni di recensione",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    if (!restaurantId) return

    try {
      setIsLoading(true);
      const response = await fetch(`/api/templates?restaurantId=${restaurantId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load templates')
      }
      
      if (!data.success || !data.templates) {
        throw new Error('Invalid response format')
      }

      // Separa i template per tipo
      const menuTypes = ['MEDIA', 'CALL_TO_ACTION'];
      const menuTemplates = data.templates.filter((t: Template) => menuTypes.includes(t.type));
      const reviewTemplates = data.templates.filter((t: Template) => t.type === 'REVIEW');

      // Debug dei dati dei template
      console.log('Menu Templates:', menuTemplates);
      console.log('Review Templates:', reviewTemplates);
      
      // Carica le informazioni sul ristorante se non presenti nel template
      const restaurantResponse = await fetch(`/api/restaurants?restaurantId=${restaurantId}&basicInfo=true`);
      const restaurantData = await restaurantResponse.json();
      
      if (restaurantResponse.ok && restaurantData.success && restaurantData.restaurant) {
        const realRestaurantName = restaurantData.restaurant.name;
        // Salva il nome reale del ristorante nello stato
        setRestaurantName(realRestaurantName);
        
        // Aggiungi il nome del ristorante ai template se mancante
        menuTemplates.forEach((t: Template) => {
          if (!t.name) {
            t.name = realRestaurantName;
          } else if (t.name.includes('_menu_') || t.name.includes('.pdf')) {
            // Se il nome sembra essere un nome di file (contiene "_menu_" o ".pdf")
            // lo sostituiamo con il nome del ristorante
            t.name = realRestaurantName;
          }
        });
        
        reviewTemplates.forEach((t: Template) => {
          if (!t.name) {
            t.name = realRestaurantName;
          } else if (t.name.includes('_menu_') || t.name.includes('.pdf')) {
            t.name = realRestaurantName;
          }
        });
      }

      setMenuTemplates(menuTemplates);
      setReviewTemplates(reviewTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Errore",
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
      }
      
      // Carica il testo del pulsante se è un template di recensione
      if (template.type === 'REVIEW') {
        fetchButtonText(template._id);
      }
    }
  }

  const fetchButtonText = async (templateId: string) => {
    if (!templateId) return;

    try {
      const response = await fetch(`/api/templates?templateId=${templateId}&buttonText=true`);
      const data = await response.json();
      
      if (data.success && data.buttonText) {
        setEditedButtonText(data.buttonText);
      }
    } catch (error) {
      console.error('Error fetching button text:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il testo del pulsante",
        variant: "destructive",
      });
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
      
      const template = templateToSave;
      const isTypeChanged = 
        (menuType === "url" && template.type === "MEDIA") || 
        (menuType === "file" && template.type === "CALL_TO_ACTION");
      
      // Se è cambiato il tipo di template (da PDF a URL o viceversa), dobbiamo creare un nuovo template
      if (isTypeChanged && template.type !== 'REVIEW') {
        // Creiamo un nuovo template con il tipo corretto
        const newTemplateType = menuType === "url" ? "CALL_TO_ACTION" : "MEDIA";
        
        toast({
          title: "Cambio tipo template",
          description: `Conversione da ${template.type} a ${newTemplateType} in corso...`,
        });
        
        const requestBody: any = {
          message: editedMessage,
          newType: newTemplateType,
          updateAllLanguages: updateAllLanguages
        };
        
        // Aggiungi i dati specifici per il tipo di menu
        if (menuType === "url" && menuUrl) {
          requestBody.menuUrl = menuUrl;
        } else if (menuType === "file" && menuPdfUrl) {
          requestBody.menuPdfUrl = menuPdfUrl;
        }
        
        // Invia richiesta per creare nuovo template
        const response = await fetch(`/api/templates/${template._id}/convert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to convert template');
        }
        
        if (!data.success) {
          throw new Error('Invalid response format');
        }
        
        // Imposta il messaggio di successo e mostra l'animazione
        setSuccessMessage(updateAllLanguages 
          ? "Template convertito in tutte le lingue!" 
          : "Template convertito con successo!");
        setShowSuccessAnimation(true);
        
        // Refresh templates
        await fetchTemplates();
        setIsEditorOpen(false);
        setSelectedTemplate(null);
        setMenuFile(null);
        setMenuUrl("");
        setMenuPdfUrl("");
        setIsSaving(false);
        setTemplateToSave(null);
        return;
      }
      
      // Se è un template di recensione
      if (template.type === 'REVIEW') {
      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: editedMessage,
            buttonText: editedButtonText,
            updateAllLanguages: updateAllLanguages
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update template')
      }

      if (!data.success) {
        throw new Error('Invalid response format')
      }

        // Imposta il messaggio di successo e mostra l'animazione
        setSuccessMessage(updateAllLanguages 
          ? "Template aggiornato in tutte le lingue!" 
          : "Template aggiornato con successo!");
        setShowSuccessAnimation(true);

      // Refresh templates
      await fetchTemplates()
        setIsEditorOpen(false);
        setSelectedTemplate(null);
        return
      }
      
      // Per i template di menu
      let requestBody: any = {
        message: editedMessage,
        updateAllLanguages: updateAllLanguages
      };
      
      // Aggiungi i dati specifici per il tipo di menu
      if (menuType === "url" && menuUrl) {
        requestBody.menuUrl = menuUrl;
      } else if (menuType === "file" && menuPdfUrl) {
        requestBody.menuPdfUrl = menuPdfUrl;
      }

      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update template')
      }

      if (!data.success) {
        throw new Error('Invalid response format')
      }

      // Imposta il messaggio di successo e mostra l'animazione
      setSuccessMessage(updateAllLanguages 
        ? "Template aggiornato in tutte le lingue!" 
        : "Template aggiornato con successo!");
      setShowSuccessAnimation(true);

      // Refresh templates
      await fetchTemplates();
      setIsEditorOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiornare il template",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false);
      setTemplateToSave(null);
      setMenuFile(null);
      setMenuUrl("");
      setMenuPdfUrl("");
    }
  }

  const regenerateWithAI = async (template: Template) => {
    try {
      setIsGenerating(true)
      
      // Debug info
      console.log("Regenerating with language:", currentLanguage);
      console.log("Template original language:", template.language);
      
      // Prima otteniamo i dettagli del ristorante
      const restaurantResponse = await fetch(`/api/restaurants?restaurantId=${template.restaurant}`);
      const restaurantData = await restaurantResponse.json();
      
      if (!restaurantResponse.ok || !restaurantData.success) {
        throw new Error('Impossibile recuperare i dettagli del ristorante');
      }
      
      const restaurant = restaurantData.restaurant;
      
      const endpoint = template.type === 'REVIEW' 
        ? '/api/review'
        : '/api/welcome'

      // Ora usiamo i dati corretti del ristorante
      const requestData = {
        restaurantId: template.restaurant,
        restaurantName: restaurant.name,
        restaurantDetails: {
          name: restaurant.name,
          rating: restaurant.googleRating?.rating || 4.5,
          ratingsTotal: restaurant.googleRating?.reviewCount || 100,
          cuisineTypes: restaurant.cuisineTypes || ['Italian'],
          reviews: restaurant.reviews || []
        },
        type: template.type === 'MEDIA' ? 'pdf' : 'url',
        menuType: template.type === 'MEDIA' ? 'pdf' : 'url',
        language: currentLanguage,
        forceLanguage: true // Aggiungiamo questo flag per forzare l'uso della lingua corrente
      }

      console.log("Request data:", requestData);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('Impossibile generare il messaggio')
      }

      const data = await response.json()
      console.log("Response from API:", data);
      
      // Gestisce sia i template di menu che quelli di recensione
      if (template.type === 'REVIEW') {
        setEditedMessage(data.templates?.[0] || '')
      } else {
        setEditedMessage(data.message || '')
      }
    } catch (error) {
      console.error('Error generating message:', error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile generare il messaggio",
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
          reviewPlatform: reviewSettings.reviewPlatform
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

  // Controlla lo stato del template chiamando l'API
  const checkTemplateStatus = async (templateId: string) => {
    if (!templateId) return;
    
    try {
      setIsCheckingStatus(templateId);
      
      const response = await fetch(`/api/templates/${templateId}/status`);
      
      if (!response.ok) {
        throw new Error('Impossibile recuperare lo stato del template');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Errore nel controllo dello stato');
      }
      
      // Aggiorna lo stato di TUTTI i template in tutte le categorie e lingue
      const updateAllTemplates = (templates: Template[]) => {
        return templates.map(t => {
          // Aggiorniamo tutti i template indipendentemente dal tipo
          return {
            ...t,
            status: data.template.status,
            rejectionReason: data.template.rejectionReason
          };
        });
      };
      
      // Aggiorna sia i template di menu che quelli di review
      setMenuTemplates(prev => {
        const updated = updateAllTemplates(prev);
        return updated;
      });
      
      setReviewTemplates(prev => {
        const updated = updateAllTemplates(prev);
        return updated;
      });
      
      toast({
        title: "Successo",
        description: "Stato di tutti i template aggiornato",
      });
    } catch (error) {
      console.error('Error checking template status:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile controllare lo stato del template",
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(null);
    }
  };

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
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1B9AAA]">WhatsApp Templates</h1>
              <p className="text-sm sm:text-base text-gray-700">Manage your message templates</p>
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
                <span>Menu Template</span>
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Review Template</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="space-y-3 sm:space-y-4">
              {menuTemplates.length === 0 ? (
                <div className="bg-white rounded-xl p-4 sm:p-6 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">No menu templates available</p>
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
                          editedButtonText={editedButtonText}
                        isGenerating={isGenerating}
                          botConfig={botConfig}
                          restaurantPhoto={restaurantProfileImage}
                          onCheckStatus={(id: string) => {
                            // Solo aggiorna lo stato senza aprire il pannello di editing
                            checkTemplateStatus(id);
                          }}
                          isCheckingStatus={isCheckingStatus}
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
                  <p className="text-gray-500 text-sm sm:text-base">No review templates available</p>
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
                          <Label htmlFor="reviewPlatform" className="text-xs sm:text-sm mb-1 block">
                            Piattaforma di recensione
                          </Label>
                          <select
                            id="reviewPlatform"
                            value={reviewSettings.reviewPlatform}
                            onChange={(e) => setReviewSettings({
                              ...reviewSettings,
                              reviewPlatform: e.target.value as 'google' | 'yelp' | 'tripadvisor' | 'custom'
                            })}
                            className="w-full text-xs sm:text-sm p-2 border border-gray-300 rounded-md"
                          >
                            <option value="google">Google</option>
                            <option value="yelp">Yelp</option>
                            <option value="tripadvisor">TripAdvisor</option>
                            <option value="custom">Personalizzato</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label htmlFor="reviewLink" className="text-xs sm:text-sm mb-1 block">
                            URL per le recensioni
                          </Label>
                          <input
                            id="reviewLink"
                            type="text"
                            value={reviewSettings.reviewLink}
                            onChange={(e) => setReviewSettings({
                              ...reviewSettings,
                              reviewLink: e.target.value
                            })}
                            placeholder="https://..."
                            className="w-full text-xs sm:text-sm p-2 border border-gray-300 rounded-md"
                          />
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
                          <span className="font-medium">Piattaforma: </span>
                          <span className="text-gray-600 capitalize">{reviewSettings.reviewPlatform}</span>
                        </div>
                        <div>
                          <span className="font-medium">URL: </span>
                          <span className="text-gray-600 break-all">
                            {reviewSettings.reviewLink || 'Non impostato'}
                          </span>
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
                          editedButtonText={editedButtonText}
                        isGenerating={isGenerating}
                          botConfig={botConfig}
                          restaurantPhoto={restaurantProfileImage}
                          onCheckStatus={(id: string) => {
                            // Solo aggiorna lo stato senza aprire il pannello di editing
                            checkTemplateStatus(id);
                          }}
                          isCheckingStatus={isCheckingStatus}
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
                
                {/* Campo per modificare il testo del pulsante, solo per i template di recensione */}
                {selectedTemplate.type === 'REVIEW' && (
                  <div className="mb-3">
                    <Label htmlFor="buttonText" className="text-sm md:text-base mb-1 block">
                      Testo del pulsante
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="buttonText"
                        type="text"
                        value={editedButtonText}
                        onChange={(e) => setEditedButtonText(e.target.value)}
                        placeholder="Testo del pulsante"
                        className="flex-1 text-sm md:text-base p-3 border border-gray-300 rounded-md"
                      />
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