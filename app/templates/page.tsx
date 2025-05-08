"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
  Globe
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
  reviewButtonText = "Leave a Review"
}: { 
  message: string, 
  userMessage?: string, 
  restaurantName?: string, 
  restaurantPhoto?: string,
  showMenuPdf?: boolean,
  showMenuUrl?: boolean,
  showReviewCta?: boolean,
  reviewButtonText?: string
}) {
  return (
    <div className="flex justify-center mt-3 mb-4">
      <div className="w-full max-w-xs border-[6px] md:border-[8px] border-gray-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl bg-white relative">
        {/* Notch superiore */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/4 h-4 bg-gray-800 rounded-b-lg z-10"></div>
        
        {/* Barra superiore */}
        <div className="bg-[#075E54] text-white p-2 md:p-3 pt-5 md:pt-6">
          <div className="flex items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
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
            <div className="ml-2 md:ml-3">
              <div className="text-sm md:text-base font-semibold truncate max-w-[120px] md:max-w-[180px]">{restaurantName}</div>
              <div className="text-[10px] md:text-xs opacity-80">online</div>
            </div>
            <div className="ml-auto flex gap-2 md:gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Corpo chat */}
        <div className="bg-[#E5DDD5] h-[280px] md:h-[350px] p-2 md:p-3 overflow-y-auto" style={{ 
          backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')",
          backgroundRepeat: "repeat"
        }}>
          <div className="flex flex-col gap-2 md:gap-3">
            {/* Data */}
            <div className="flex justify-center mb-1">
              <div className="bg-white bg-opacity-80 px-2 py-1 rounded-lg text-[8px] md:text-[10px] text-gray-500">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {/* Messaggio dell'utente */}
            <div className="self-end max-w-[85%]">
              <div className="bg-[#DCF8C6] p-1.5 md:p-2 rounded-lg shadow-sm relative">
                <p className="text-xs md:text-sm">{userMessage}</p>
                <div className="text-right mt-1">
                  <span className="text-[8px] md:text-[10px] text-gray-500">{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                  <span className="text-[8px] md:text-[10px] text-[#4FC3F7] ml-1">✓✓</span>
                </div>
              </div>
            </div>
            
            {/* Messaggio del ristorante */}
            <div className="self-start max-w-[85%]">
              <div className="bg-white p-1.5 md:p-2 rounded-lg shadow-sm relative">
                {/* Se il menu è un PDF, mostra l'anteprima del file */}
                {showMenuPdf && (
                  <div className="mb-2 flex items-center gap-1 md:gap-2 p-1.5 md:p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500 rounded flex items-center justify-center text-white text-[8px] md:text-xs font-bold">
                      PDF
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] md:text-xs font-medium text-gray-900">Menu.pdf</p>
                      <p className="text-[8px] md:text-[10px] text-gray-500">PDF Document</p>
                    </div>
                  </div>
                )}
                
                <p className="text-xs md:text-sm whitespace-pre-wrap">{message.replace('{customerName}', 'Marco')}</p>
                
                {/* Se il menu è un URL o è una recensione con CTA, mostra il pulsante appropriato */}
                {(showMenuUrl || showReviewCta) && (
                  <div className="mt-2 border-t pt-1.5 md:pt-2">
                    <button className="w-full text-center py-1.5 md:py-2 text-[#0277BD] text-xs md:text-sm font-medium hover:bg-gray-50 rounded transition-colors">
                      {showReviewCta ? reviewButtonText : "View Menu"}
                    </button>
                  </div>
                )}
                
                <div className="text-right mt-1">
                  <span className="text-[8px] md:text-[10px] text-gray-500">{new Date().getHours()}:{(new Date().getMinutes() + 1).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra inferiore */}
        <div className="bg-[#F0F0F0] p-1.5 md:p-2">
          <div className="flex items-center">
            <div className="flex-grow bg-white rounded-full px-3 py-1.5 md:py-2 flex items-center">
              <span className="text-gray-400 text-xs md:text-sm">Type a message</span>
            </div>
            <div className="ml-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#075E54] flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Funzione per ottenere il trigger word basato sul nome del ristorante e la configurazione
function getTriggerWord(restaurantName: string, botConfig: {triggerWord: string} | null): string {
  // Dato che l'API non è implementata nel backend, usiamo "Menu" come trigger word di default
  return "Menu";
}

// Componente per una singola template card
function TemplateCard({ 
  template, 
  onEdit, 
  onSave, 
  onRegenerate, 
  editMode,
  editedMessage,
  setEditedMessage,
  isGenerating,
  botConfig
}: { 
  template: Template, 
  onEdit: () => void, 
  onSave: () => void,
  onRegenerate: () => void,
  editMode: boolean,
  editedMessage: string,
  setEditedMessage: (message: string) => void,
  isGenerating: boolean,
  botConfig: {triggerWord: string} | null
}) {
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
        return <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
      case 'PENDING':
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
      default:
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
    }
  }

  // Determina quale messaggio visualizzare nel mockup
  const displayMessage = editMode ? editedMessage : template.components.body.text;
  const isMenuPdf = template.type === 'MEDIA';
  const isMenuUrl = template.type === 'CALL_TO_ACTION';
  const isReview = template.type === 'REVIEW';
  
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md mb-3 sm:mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1 sm:gap-0">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium capitalize">{template.language}</span>
          <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(template.status)} bg-opacity-10`}>
            {getStatusIcon(template.status)}
            {template.status}
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500">
          Last update: {new Date(template.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {template.status === 'REJECTED' && template.rejectionReason && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100">
          <p className="text-[10px] sm:text-xs text-red-700">
            <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
            Rejection reason: {template.rejectionReason}
          </p>
        </div>
      )}

      <WhatsAppMockup 
        message={displayMessage} 
        userMessage={isReview ? "Order completed! 🎉" : `${getTriggerWord(template.name || "Restaurant", botConfig)}`}
        restaurantName={template.name || "Restaurant"}
        showMenuPdf={isMenuPdf}
        showMenuUrl={isMenuUrl}
        showReviewCta={isReview}
        reviewButtonText="Leave a Review"
      />

      {editMode ? (
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          <Textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            className="w-full min-h-[120px] sm:min-h-[150px] text-xs sm:text-sm rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            placeholder="Write your message..."
          />
          <div className="flex gap-1.5 sm:gap-2 justify-end">
            <CustomButton
              variant="outline"
              size="sm"
              className="text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3"
              onClick={onEdit}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="outline"
              size="sm"
              className="text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3"
              onClick={onRegenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  Regenerate with AI
                </>
              )}
            </CustomButton>
            <CustomButton
              size="sm"
              className="text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3"
              onClick={onSave}
            >
              <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              Save
            </CustomButton>
          </div>
        </div>
      ) : (
        <div className="mt-3 sm:mt-4 flex justify-end">
          <CustomButton
            variant="outline"
            size="sm"
            className="text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3"
            onClick={onEdit}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Message
          </CustomButton>
        </div>
      )}
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
  const { toast } = useToast()

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
      // Se c'è "en" tra le lingue disponibili, selezionala di default
      if (languages.includes('en') && (!currentLanguage || currentLanguage !== 'en')) {
        setCurrentLanguage('en');
      } 
      // Altrimenti se la lingua corrente non è tra quelle disponibili, prendi la prima
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
    }
  }, [status, session])

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
    if (editingTemplate === template._id) {
      setEditingTemplate(null);
    } else {
      setEditingTemplate(template._id);
      setEditedMessage(template.components.body.text);
    }
  }

  const handleSave = async (template: Template) => {
    try {
      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: template._id,
          message: editedMessage
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update template')
      }

      if (!data.success) {
        throw new Error('Invalid response format')
      }

      toast({
        title: "Successo",
        description: "Template aggiornato con successo",
      })

      // Refresh templates
      await fetchTemplates()
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiornare il template",
        variant: "destructive",
      })
    }
  }

  const regenerateWithAI = async (template: Template) => {
    try {
      setIsGenerating(true)
      
      const endpoint = template.type === 'REVIEW' 
        ? '/api/review'
        : '/api/welcome'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: template.restaurant,
          type: template.type === 'MEDIA' ? 'pdf' : 'url'
        })
      })

      if (!response.ok) {
        throw new Error('Unable to generate message')
      }

      const data = await response.json()
      setEditedMessage(data.message || data.templates[0])
    } catch (error) {
      console.error('Error generating message:', error)
      toast({
        title: "Error",
        description: "Unable to generate message",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

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

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-2 sm:px-4 py-4 sm:py-6">
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
                  <div className="bg-white rounded-xl p-1.5 sm:p-2 overflow-x-auto">
                    <div className="flex space-x-1.5 sm:space-x-2">
                      {availableLanguages().map(lang => (
                        <button
                          key={lang}
                          onClick={() => setCurrentLanguage(lang)}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap rounded-md flex items-center gap-1 sm:gap-1.5 ${
                            currentLanguage === lang 
                              ? 'bg-blue-100 text-blue-700 font-medium' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Template Cards */}
                  <div>
                    {getFilteredTemplates().map(template => (
                      <TemplateCard
                        key={template._id}
                        template={template}
                        onEdit={() => handleEdit(template)}
                        onSave={() => handleSave(template)}
                        onRegenerate={() => regenerateWithAI(template)}
                        editMode={editingTemplate === template._id}
                        editedMessage={editedMessage}
                        setEditedMessage={setEditedMessage}
                        isGenerating={isGenerating}
                        botConfig={botConfig}
                      />
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
                  {/* Tab Lingue */}
                  <div className="bg-white rounded-xl p-1.5 sm:p-2 overflow-x-auto">
                    <div className="flex space-x-1.5 sm:space-x-2">
                      {availableLanguages().map(lang => (
                        <button
                          key={lang}
                          onClick={() => setCurrentLanguage(lang)}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap rounded-md flex items-center gap-1 sm:gap-1.5 ${
                            currentLanguage === lang 
                              ? 'bg-blue-100 text-blue-700 font-medium' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Template Cards */}
                  <div>
                    {getFilteredTemplates().map(template => (
                      <TemplateCard
                        key={template._id}
                        template={template}
                        onEdit={() => handleEdit(template)}
                        onSave={() => handleSave(template)}
                        onRegenerate={() => regenerateWithAI(template)}
                        editMode={editingTemplate === template._id}
                        editedMessage={editedMessage}
                        setEditedMessage={setEditedMessage}
                        isGenerating={isGenerating}
                        botConfig={botConfig}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
} 