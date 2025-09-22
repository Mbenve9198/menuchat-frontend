"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Search, Plus, Filter, ArrowUpDown, MessageSquare, XCircle, Loader2, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import BubbleBackground from "@/components/bubble-background"
import UILanguageSelector from "@/components/ui-language-selector"
import { CustomButton } from "@/components/ui/custom-button"
import { useSession } from "next-auth/react"
import { useTranslation } from "react-i18next"
import { useToast } from "@/hooks/use-toast"

// Tipi TypeScript per le campagne
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
  // 🆕 Attribution tracking
  returnVisits?: number
  returnRate?: number
}

// Campaign status options
const statusOptions = [
  { value: "all", label: "campaigns.allCampaigns" },
  { value: "sent", label: "campaigns.sent" },
  { value: "scheduled", label: "campaigns.scheduled" },
  { value: "completed", label: "campaigns.status.completed" },
  { value: "in_progress", label: "campaigns.status.inProgress" },
  { value: "draft", label: "campaigns.status.draft" },
  { value: "failed", label: "campaigns.status.failed" },
  { value: "canceled", label: "campaigns.status.canceled" },
]

// Campaign type options
const typeOptions = [
  { value: "all", label: "campaigns.allTypes" },
  { value: "promo", label: "campaigns.promotional" },
  { value: "event", label: "campaigns.event" },
  { value: "update", label: "campaigns.update" },
  { value: "feedback", label: "campaigns.feedback" },
]

// Sort options
const sortOptions = [
  { value: "date_desc", label: "campaigns.newestFirst" },
  { value: "date_asc", label: "campaigns.oldestFirst" },
  { value: "name_asc", label: "campaigns.nameAZ" },
  { value: "name_desc", label: "campaigns.nameZA" },
  { value: "performance", label: "campaigns.bestPerforming" },
]

export default function CampaignsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date_desc")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🆕 Stati per la cancellazione
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [campaignToCancel, setCampaignToCancel] = useState<Campaign | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)

  // Fetch campaigns from API
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/campaign', {
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
        throw new Error(data.error || 'Errore nel recupero delle campagne')
      }

      // Trasforma i dati dal backend nel formato atteso dal frontend
      const transformedCampaigns: Campaign[] = data.data.map((campaign: any) => ({
        id: campaign._id,
        name: campaign.name,
        description: campaign.description,
        type: campaign.template?.campaignType || 'promo',
        status: campaign.status,
        sentDate: campaign.sentDate,
        scheduledDate: campaign.scheduledDate,
        recipients: campaign.targetAudience?.totalContacts || 0,
        openRate: campaign.statistics?.openRate || null,
        clickRate: campaign.statistics?.clickRate || null,
        responseRate: campaign.statistics?.responseRate || null,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        template: campaign.template,
        // 🆕 Attribution tracking
        returnVisits: campaign.statistics?.returnVisits || 0,
        returnRate: campaign.statistics?.returnRate || 0,
      }))

      setCampaigns(transformedCampaigns)
    } catch (err: any) {
      console.error('Errore nel recupero delle campagne:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Load campaigns when component mounts and session is ready
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchCampaigns()
    } else if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [status, session])

  useEffect(() => {
    // Filter and sort campaigns based on current filters
    let result = [...campaigns]

    // Apply search filter
    if (searchQuery) {
      result = result.filter((campaign) => 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((campaign) => campaign.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((campaign) => campaign.type === typeFilter)
    }

    // Apply tab filter
    if (activeTab === "scheduled") {
      result = result.filter((campaign) => campaign.status === "scheduled")
    } else if (activeTab === "sent") {
      result = result.filter((campaign) => ["sent", "in_progress", "failed"].includes(campaign.status))
    } else if (activeTab === "drafts") {
      result = result.filter((campaign) => campaign.status === "draft")
    }

    // Apply sorting
    result = sortCampaigns(result, sortBy)

    setFilteredCampaigns(result)
  }, [campaigns, searchQuery, statusFilter, typeFilter, sortBy, activeTab])

  const sortCampaigns = (campaigns: Campaign[], sortOption: string) => {
    switch (sortOption) {
      case "date_desc":
        return [...campaigns].sort((a, b) => {
          const dateA = a.sentDate || a.scheduledDate || "0"
          const dateB = b.sentDate || b.scheduledDate || "0"
          return dateB.localeCompare(dateA)
        })
      case "date_asc":
        return [...campaigns].sort((a, b) => {
          const dateA = a.sentDate || a.scheduledDate || "9999"
          const dateB = b.sentDate || b.scheduledDate || "9999"
          return dateA.localeCompare(dateB)
        })
      case "name_asc":
        return [...campaigns].sort((a, b) => a.name.localeCompare(b.name))
      case "name_desc":
        return [...campaigns].sort((a, b) => b.name.localeCompare(a.name))
      case "performance":
        return [...campaigns].sort((a, b) => (b.openRate || 0) - (a.openRate || 0))
      default:
        return campaigns
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <span>✅</span> {t("campaigns.status.sent")}
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <span>📆</span> {t("campaigns.status.scheduled")}
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <span>⏳</span> {t("campaigns.status.inProgress")}
          </Badge>
        )
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <span>📝</span> {t("campaigns.status.draft")}
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <span>❌</span> {t("campaigns.status.failed")}
          </Badge>
        )
      case "canceled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <span>🚫</span> Cancellata
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <span>✅</span> Completata
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promo":
        return <span className="text-lg">🎁</span>
      case "event":
        return <span className="text-lg">📅</span>
      case "update":
        return <span className="text-lg">📋</span>
      case "feedback":
        return <span className="text-lg">⭐</span>
      default:
        return <span className="text-lg">💬</span>
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

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  // 🆕 Funzione per cancellare una campagna
  const handleCancelCampaign = async (campaign: Campaign) => {
    try {
      setIsCanceling(true)
      
      const response = await fetch(`/api/campaign/${campaign.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Errore ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.message || 'Errore nella cancellazione della campagna')
      }

      // Aggiorna la lista delle campagne
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(c => 
          c.id === campaign.id ? { ...c, status: 'canceled' } : c
        )
      )
      
      // Chiudi il dialog
      setShowCancelDialog(false)
      setCampaignToCancel(null)

      // Mostra messaggio di successo
      toast({
        title: "✅ Campagna cancellata",
        description: `${data.data.canceledMessages || 0} messaggi sono stati cancellati con successo.`,
        duration: 4000,
      })

      // Ricarica la lista per essere sicuri
      await fetchCampaigns()

    } catch (error: any) {
      console.error('Errore nella cancellazione:', error)
      
      toast({
        title: "❌ Errore nella cancellazione",
        description: error.message || "Impossibile cancellare la campagna. Riprova.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsCanceling(false)
    }
  }

  // 🆕 Funzione per verificare se la campagna può essere cancellata
  const canCancelCampaign = (campaign: Campaign): boolean => {
    return campaign.status === 'scheduled'
  }

  // 🆕 Funzione per aprire il dialog di cancellazione
  const openCancelDialog = (campaign: Campaign, event: React.MouseEvent) => {
    event.stopPropagation() // Previene la navigazione al dettaglio
    setCampaignToCancel(campaign)
    setShowCancelDialog(true)
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
              onClick={() => router.push("/dashboard")}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </CustomButton>
            <h1 className="text-2xl font-bold text-gray-800">{t("campaigns.title")}</h1>
            <UILanguageSelector variant="compact" />
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t("campaigns.searchCampaigns")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 border-gray-200 rounded-xl"
              />
            </div>

            <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 bg-white/80 border-gray-200 rounded-xl">
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="flex-1 bg-white/80 border-gray-200 rounded-xl">
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-12 bg-white/80 border-gray-200 rounded-xl">
                  <ArrowUpDown className="w-4 h-4" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        {/* Tabs */}
        <div className="w-full max-w-md mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg">{t("common.all")}</TabsTrigger>
              <TabsTrigger value="sent" className="rounded-lg">{t("campaigns.sent")}</TabsTrigger>
              <TabsTrigger value="scheduled" className="rounded-lg">{t("campaigns.scheduled")}</TabsTrigger>
              <TabsTrigger value="drafts" className="rounded-lg">{t("campaigns.drafts")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B9AAA]"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("campaigns.loadingCampaigns")}</h3>
            <p className="text-gray-500">{t("campaigns.loadingDescription")}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <span className="text-6xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t("campaigns.loadingError")}</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <CustomButton
              className="py-2 px-4 flex items-center justify-center mx-auto"
              onClick={fetchCampaigns}
            >
              {t("common.retry")}
            </CustomButton>
          </div>
        )}

        {/* Campaign List */}
        {!isLoading && !error && (
          <div className="w-full max-w-md space-y-4 mb-20">
          {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-5 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                  onClick={() => router.push(`/campaign/${campaign.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div>{getTypeIcon(campaign.type)}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(campaign.status)}
                        <span className="text-xs text-gray-500">
                          {campaign.sentDate
                              ? `${t("campaigns.sent")}: ${formatDate(campaign.sentDate)}`
                            : campaign.scheduledDate
                                ? `${t("campaigns.scheduled")}: ${formatDate(campaign.scheduledDate)}`
                                : t("campaigns.notScheduled")}
                        </span>
                        </div>
                      </div>
                    </div>
                  
                  <div className="flex items-center gap-2">
                    {/* 🆕 Pulsante Cancella (solo per campagne scheduled) */}
                    {canCancelCampaign(campaign) && (
                      <CustomButton
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => openCancelDialog(campaign, e)}
                        disabled={isCanceling}
                        title="Cancella campagna"
                      >
                        {isCanceling && campaignToCancel?.id === campaign.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </CustomButton>
                    )}
                    
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-xl">👥</span>
                    </div>
                      <p className="text-xs text-gray-500">{t("common.recipients")}</p>
                    <p className="text-sm font-bold text-gray-800">{campaign.recipients}</p>
                  </div>

                  {/* 🆕 Clienti Tornati invece di Open Rate */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-xl">🎯</span>
                    </div>
                    <p className="text-xs text-gray-500">Tornati</p>
                    <p className="text-sm font-bold text-green-600">
                      {campaign.returnVisits || 0}
                    </p>
                    {campaign.returnRate > 0 && (
                      <p className="text-xs text-green-600">
                        {campaign.returnRate}%
                      </p>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-xl">🔗</span>
                    </div>
                      <p className="text-xs text-gray-500">Click Rate</p>
                    <p className="text-sm font-bold text-gray-800">
                        {campaign.clickRate !== null && campaign.clickRate !== undefined ? `${campaign.clickRate}%` : "—"}
                    </p>
                  </div>
                </div>

                  {campaign.status === "sent" && campaign.openRate !== null && campaign.openRate !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{t("common.performance")}</span>
                      <span className="font-medium text-gray-700">
                          {campaign.openRate >= 75 ? t("common.excellent") : campaign.openRate >= 50 ? t("common.good") : t("common.average")}
                      </span>
                    </div>
                    <Progress
                      value={campaign.openRate}
                      className="h-2 bg-gray-100"
                      indicatorClassName={`transition-all duration-700 ease-in-out ${
                        campaign.openRate >= 75
                          ? "bg-green-500"
                          : campaign.openRate >= 50
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                      }`}
                    />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
              <div className="flex justify-center mb-6">
                <Image
                  src="/mascottes/mascotte_nodata.png"
                  alt="No Data Mascot"
                  width={120}
                  height={120}
                  className="drop-shadow-lg"
                />
              </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t("campaigns.noCampaignsFound")}</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? t("campaigns.noCampaignsDescription")
                    : t("campaigns.createFirstCampaign")}
              </p>
              <CustomButton
                className="py-2 px-4 flex items-center justify-center mx-auto"
                onClick={() => router.push("/campaign/create")}
              >
                  <Plus className="w-4 h-4 mr-2" /> {t("campaigns.create")}
              </CustomButton>
            </div>
          )}
        </div>
        )}

        {/* Campaign Stats Summary - SOLO CLICK RATE */}
        {!isLoading && !error && filteredCampaigns.length > 0 && (
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t("campaigns.performanceCampaigns")}</h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-gray-500">{t("campaigns.avgClickRate")}</p>
                <p className="text-3xl font-extrabold text-[#1B9AAA]">
                  {campaigns.filter((c) => c.clickRate !== null && c.clickRate !== undefined).length > 0 ? (
                    Math.round(
                      campaigns.filter((c) => c.clickRate !== null && c.clickRate !== undefined).reduce((sum, c) => sum + (c.clickRate || 0), 0) /
                        campaigns.filter((c) => c.clickRate !== null && c.clickRate !== undefined).length,
                    )
                  ) : 0}
                  %
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{t("campaigns.tip")}</p>
                  <p className="text-xs text-gray-600">
                    {t("campaigns.tipDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Create Campaign Button */}
        {!isLoading && !error && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center">
          <CustomButton
            className="py-3 px-6 shadow-lg flex items-center justify-center max-w-md w-[90%]"
            onClick={() => router.push("/campaign/create")}
          >
              <Plus className="w-5 h-5 mr-2" /> {t("campaigns.createNewCampaign")}
          </CustomButton>
        </div>
                  )}
        </div>

        {/* 🆕 Dialog per la cancellazione delle campagne */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <XCircle className="w-6 h-6 text-red-500" />
                Cancella Campagna
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                {campaignToCancel && (
                  <>
                    Sei sicuro di voler cancellare la campagna <strong>"{campaignToCancel.name}"</strong>?
                    <br /><br />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600">⚠️</span>
                        <div className="text-red-800">
                          <strong>Attenzione:</strong> Questa azione cancellerà tutti i {campaignToCancel.recipients} messaggi programmati su Twilio. L'operazione è irreversibile.
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-3 mt-6">
              <CustomButton
                variant="destructive"
                onClick={() => campaignToCancel && handleCancelCampaign(campaignToCancel)}
                disabled={isCanceling}
                className="w-full h-12 text-base font-semibold"
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Cancellando su Twilio...
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Sì, Cancella Campagna
                  </>
                )}
              </CustomButton>
              
              <CustomButton
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false)
                  setCampaignToCancel(null)
                }}
                disabled={isCanceling}
                className="w-full h-10"
              >
                Annulla
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>
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

// Custom ChevronRight icon component
function ChevronRight({ className }: { className?: string }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
