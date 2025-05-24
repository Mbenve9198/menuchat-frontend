"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Calendar,
  Users,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gift,
  CalendarClock,
  Menu,
  Star,
  Share2,
  Edit3,
  FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BubbleBackground from "@/components/bubble-background"
import UILanguageSelector from "@/components/ui-language-selector"
import { CustomButton } from "@/components/ui/custom-button"
import { useSession } from "next-auth/react"
import { useTranslation } from "react-i18next"

// Tipi TypeScript
interface Campaign {
  id: string
  name: string
  description?: string
  type: string
  status: string
  sentDate?: string
  scheduledDate?: string
  recipients: number
  openRate?: number | null
  clickRate?: number | null
  responseRate?: number | null
  createdAt?: string
  updatedAt?: string
  template?: any
  templateParameters?: any
  targetAudience?: any
  statistics?: any
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch campaign details from API
  const fetchCampaignDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/campaign/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Errore nel recupero della campagna')
      }

      // Trasforma i dati dal backend nel formato atteso dal frontend
      const transformedCampaign: Campaign = {
        id: data.data._id,
        name: data.data.name,
        description: data.data.description,
        type: data.data.template?.campaignType || 'promo',
        status: data.data.status,
        sentDate: data.data.sentDate,
        scheduledDate: data.data.scheduledDate,
        recipients: data.data.targetAudience?.totalContacts || 0,
        openRate: data.data.statistics?.openRate || null,
        clickRate: data.data.statistics?.clickRate || null,
        responseRate: data.data.statistics?.responseRate || null,
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt,
        template: data.data.template,
        templateParameters: data.data.templateParameters,
        targetAudience: data.data.targetAudience,
        statistics: data.data.statistics
      }

      setCampaign(transformedCampaign)

    } catch (err: any) {
      console.error('Errore nel recupero della campagna:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Load campaign when component mounts and session is ready
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchCampaignDetails()
    } else if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [status, session, params.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sent
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Scheduled
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </Badge>
        )
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Draft
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Failed
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promo":
        return <Gift className="w-5 h-5 text-[#EF476F]" />
      case "event":
        return <CalendarClock className="w-5 h-5 text-[#1B9AAA]" />
      case "update":
        return <Menu className="w-5 h-5 text-[#FFE14D]" />
      case "feedback":
        return <Star className="w-5 h-5 text-[#06D6A0]" />
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—"
    return `${formatDate(dateString)} at ${formatTime(dateString)}`
  }

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  const getExcitedMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-8">
        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <CustomButton
              variant="ghost"
              className="p-2 hover:bg-white/50 rounded-full"
              onClick={() => router.push("/campaign")}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </CustomButton>
            <h1 className="text-xl font-bold text-gray-800">{t("campaigns.details")}</h1>
            <UILanguageSelector variant="compact" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B9AAA]"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Caricamento campagna...</h3>
            <p className="text-gray-500">Stiamo recuperando i dettagli della campagna.</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <span className="text-6xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Errore nel caricamento</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <CustomButton
              className="py-2 px-4 flex items-center justify-center mx-auto"
              onClick={fetchCampaignDetails}
            >
              Riprova
            </CustomButton>
          </div>
        )}

        {/* Campaign Details */}
        {!isLoading && !error && campaign && (
          <>
            {/* Campaign Header */}
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl mb-4">
              <div className="flex items-start gap-4 mb-3">
                <div className="p-3 rounded-full bg-gray-100">{getTypeIcon(campaign.type)}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">{campaign.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(campaign.status)}
                    <span className="text-xs text-gray-500">
                      {campaign.sentDate
                        ? `Inviata: ${formatDate(campaign.sentDate)}`
                        : campaign.scheduledDate
                          ? `Programmata: ${formatDate(campaign.scheduledDate)}`
                          : "Non programmata"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500">Destinatari</p>
                  <p className="text-sm font-bold text-gray-800">{campaign.recipients}</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500">Tasso Apertura</p>
                  <p className="text-sm font-bold text-gray-800">
                    {campaign.openRate !== null && campaign.openRate !== undefined ? `${campaign.openRate}%` : "—"}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500">Tasso Click</p>
                  <p className="text-sm font-bold text-gray-800">
                    {campaign.clickRate !== null && campaign.clickRate !== undefined ? `${campaign.clickRate}%` : "—"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <CustomButton
                  className="flex-1 py-2 flex items-center justify-center text-xs"
                  onClick={() => router.push(`/campaign/create?duplicate=${campaign.id}`)}
                >
                  <Edit3 className="w-4 h-4 mr-1" /> Duplica
                </CustomButton>
                <CustomButton
                  variant="outline"
                  className="flex-1 py-2 flex items-center justify-center text-xs"
                  onClick={() => {
                    // TODO: Implementare condivisione
                    console.log("Condividi campagna")
                  }}
                >
                  <Share2 className="w-4 h-4 mr-1" /> Condividi
                </CustomButton>
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full max-w-md mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/80 rounded-xl">
                  <TabsTrigger value="overview" className="rounded-lg">Panoramica</TabsTrigger>
                  <TabsTrigger value="recipients" className="rounded-lg">Destinatari</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="bg-white rounded-3xl p-5 shadow-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Anteprima Messaggio</h3>
                    <div className="bg-white rounded-xl p-4">
                      {/* Bolla del messaggio in stile WhatsApp */}
                      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 relative max-w-[90%]">
                        {/* Media in anteprima se presente */}
                        {campaign.templateParameters?.useImage && campaign.templateParameters?.imageUrl && (
                          <>
                            {/* Determina il tipo di media dall'URL */}
                            {campaign.templateParameters.imageUrl.includes('.pdf') ? (
                              <div className="mb-3 flex items-center bg-gray-100 p-2 rounded-md">
                                <FileText className="w-4 h-4 text-gray-600 mr-2" />
                                <span className="text-xs text-gray-700 truncate max-w-[200px]">
                                  PDF Document
                                </span>
                              </div>
                            ) : campaign.templateParameters.imageUrl.includes('.mp4') || campaign.templateParameters.imageUrl.includes('video') ? (
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
                            ) : (
                              <div className="mb-3 rounded-md overflow-hidden">
                                <Image
                                  src={campaign.templateParameters.imageUrl}
                                  alt="Campaign media"
                                  width={260}
                                  height={180}
                                  className="w-full h-auto"
                                />
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Testo del messaggio */}
                        <p className="text-sm text-gray-800 whitespace-pre-line">
                          {campaign.templateParameters?.message || 
                           campaign.template?.message || 
                           "Messaggio non disponibile"}
                        </p>
                        
                        {/* Call-to-action buttons in stile WhatsApp */}
                        <div className="mt-3 flex flex-col gap-2">
                          {campaign.templateParameters?.cta && (
                            <a 
                              href="#" 
                              className="flex items-center justify-center w-full px-3 py-2 bg-white text-[#128C7E] text-sm font-medium border border-[#128C7E] rounded-md hover:bg-gray-50"
                              onClick={(e) => e.preventDefault()}
                            >
                              {campaign.templateParameters.cta}
                            </a>
                          )}
                          <a 
                            href="#" 
                            className="flex items-center justify-center w-full px-3 py-2 bg-white text-gray-600 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={(e) => e.preventDefault()}
                          >
                            Disiscriviti
                          </a>
                        </div>
                        
                        {/* Orario del messaggio con doppia spunta blu */}
                        <div className="mt-2 flex justify-end items-center gap-1">
                          <span className="text-xs text-gray-400">
                            {campaign.sentDate ? formatTime(campaign.sentDate) : "12:00"}
                          </span>
                          <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.58659 7.70721L14.0401 1.25244L15.1004 2.31348L7.58659 9.82911L2.63269 4.87521L3.69373 3.81418L7.58659 7.70721Z" fill="#53BDEB" />
                            <path d="M11.4456 1.25244L4.9917 7.70513L2.63232 5.34692L1.57129 6.40795L4.9917 9.82703L12.5067 2.31348L11.4456 1.25244Z" fill="#53BDEB" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dettagli della campagna */}
                  {campaign.description && (
                    <div className="bg-white rounded-3xl p-5 shadow-xl">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Descrizione</h3>
                      <p className="text-gray-600">{campaign.description}</p>
                    </div>
                  )}

                  {/* Informazioni tecniche */}
                  <div className="bg-white rounded-3xl p-5 shadow-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Dettagli Tecnici</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lingua:</span>
                        <span className="font-medium text-gray-800">
                          {campaign.templateParameters?.language || 'Non specificata'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo CTA:</span>
                        <span className="font-medium text-gray-800">
                          {campaign.templateParameters?.ctaType === 'url' ? 'Link' : 
                           campaign.templateParameters?.ctaType === 'phone' ? 'Telefono' : 'Non specificato'}
                        </span>
                      </div>
                      {campaign.templateParameters?.ctaValue && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valore CTA:</span>
                          <span className="font-medium text-gray-800 truncate max-w-[200px]">
                            {campaign.templateParameters.ctaValue}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Include Media:</span>
                        <span className="font-medium text-gray-800">
                          {campaign.templateParameters?.useImage ? 'Sì' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data Creazione:</span>
                        <span className="font-medium text-gray-800">
                          {campaign.createdAt ? formatDate(campaign.createdAt) : 'Non disponibile'}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Recipients Tab */}
                <TabsContent value="recipients" className="mt-4 space-y-4">
                  <div className="bg-white rounded-3xl p-5 shadow-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Destinatari</h3>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {campaign.targetAudience?.manualContacts && campaign.targetAudience.manualContacts.length > 0 ? (
                        campaign.targetAudience.manualContacts.map((contact: any, index: number) => (
                          <motion.div
                            key={contact._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{contact.name || 'Nome non disponibile'}</p>
                              <p className="text-xs text-gray-500">{contact.phoneNumber || 'Telefono non disponibile'}</p>
                              {contact.language && (
                                <p className="text-xs text-blue-600">
                                  Lingua: {contact.language}
                                </p>
                              )}
                              {contact.lastContactDate && (
                                <p className="text-xs text-gray-500">
                                  Ultimo contatto: {formatDate(contact.lastContactDate)}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {contact.marketingConsent?.status && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Consenso ✓
                                </span>
                              )}
                              {contact.interactionCount && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {contact.interactionCount} interazioni
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Nessun destinatario trovato</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recipients Summary */}
                  <div className="bg-white rounded-3xl p-5 shadow-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Riepilogo Destinatari</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Totale Destinatari</p>
                        <p className="text-lg font-bold text-blue-600">
                          {campaign.targetAudience?.manualContacts?.length || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Con Consenso</p>
                        <p className="text-lg font-bold text-green-600">
                          {campaign.targetAudience?.manualContacts?.filter((contact: any) => contact.marketingConsent?.status).length || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Lingue Diverse</p>
                        <p className="text-lg font-bold text-purple-600">
                          {campaign.targetAudience?.manualContacts ? 
                            new Set(campaign.targetAudience.manualContacts.map((contact: any) => contact.language).filter(Boolean)).size : 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Interazioni Totali</p>
                        <p className="text-lg font-bold text-orange-600">
                          {campaign.targetAudience?.manualContacts?.reduce((sum: number, contact: any) => sum + (contact.interactionCount || 0), 0) || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

// Custom Edit icon component
function Edit({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
