"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  XCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BubbleBackground from "@/components/bubble-background";
import UILanguageSelector from "@/components/ui-language-selector";
import { CustomButton } from "@/components/ui/custom-button";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

// Tipi TypeScript
interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  sentDate?: string;
  scheduledDate?: string;
  recipients: number;
  openRate?: number | null;
  clickRate?: number | null;
  responseRate?: number | null;
  createdAt?: string;
  updatedAt?: string;
  template?: any;
  templateParameters?: any;
  targetAudience?: any;
  statistics?: any;
  // 🆕 Nuovi campi per Twilio Scheduling
  twilioScheduledMessages?: Array<{
    twilioMessageSid: string;
    phoneNumber: string;
    status: string;
  }>;
  schedulingStats?: {
    totalContacts: number;
    successfulSchedules: number;
    failedSchedules: number;
  };
}

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🆕 Stati per la cancellazione
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // 🆕 Stati per la sincronizzazione
  const [isSyncing, setIsSyncing] = useState(false);

  // 🆕 Stati per attribution tracking
  const [attributionData, setAttributionData] = useState<{
    totalReturns: number;
    returnRate: number;
    averageDaysToReturn: number;
    returns: Array<{
      phoneNumber: string;
      returnDate: string;
      daysAfterCampaign: number;
    }>;
  } | null>(null);
  const [isLoadingAttribution, setIsLoadingAttribution] = useState(false);

  // 🆕 Stati per i dialog dei pulsantoni
  const [showRecipientsDialog, setShowRecipientsDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);

  // Fetch campaign details from API
  const fetchCampaignDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/campaign/${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Errore ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Errore nel recupero della campagna");
      }

      // Trasforma i dati dal backend nel formato atteso dal frontend
      const transformedCampaign: Campaign = {
        id: data.data._id,
        name: data.data.name,
        description: data.data.description,
        type: data.data.template?.campaignType || "promo",
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
        statistics: data.data.statistics,
        // 🆕 Aggiungi i nuovi campi Twilio Scheduling
        twilioScheduledMessages: data.data.twilioScheduledMessages || [],
        schedulingStats: data.data.schedulingStats || {
          totalContacts: 0,
          successfulSchedules: 0,
          failedSchedules: 0,
        },
      };

      setCampaign(transformedCampaign);

      // 🆕 Carica anche i dati di attribution per la overview
      if (
        transformedCampaign.status === "completed" ||
        transformedCampaign.status === "sent"
      ) {
        fetchAttributionData();
      }
    } catch (err: any) {
      console.error("Errore nel recupero della campagna:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load campaign when component mounts and session is ready
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchCampaignDetails();
    } else if (status === "unauthenticated") {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`,
      );
    }
  }, [status, session, params.id]);

  // 📊 Funzione per caricare i dati di attribution
  const fetchAttributionData = async () => {
    if (!campaign) return;

    try {
      setIsLoadingAttribution(true);

      const response = await fetch(`/api/campaign/${campaign.id}/attribution`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("🔍 FRONTEND DEBUG: Dati ricevuti dal backend:", data);

        if (data.success) {
          // 🔧 CORRETTO: Include anche la lista dei ritorni
          const combinedData = {
            ...data.data.attributionStats,
            returns: data.data.returns || [], // 🆕 Aggiungi la lista dei ritorni
          };

          console.log("📊 Attribution data finali:", combinedData);
          console.log("👥 Returns array:", combinedData.returns);

          setAttributionData(combinedData);

          console.log("📊 Attribution data caricati:", {
            totalReturns: data.data.attributionStats?.totalReturns,
            returnRate: data.data.attributionStats?.returnRate,
            returnsCount: data.data.returns?.length || 0,
          });
        } else {
          console.error("❌ Backend response not successful:", data);
        }
      } else {
        console.error("❌ HTTP error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Errore nel caricamento attribution:", error);
    } finally {
      setIsLoadingAttribution(false);
    }
  };

  // Carica attribution quando si apre il tab analytics
  useEffect(() => {
    if (campaign && !attributionData && !isLoadingAttribution) {
      fetchAttributionData();
    }
  }, [campaign]);

  // 🆕 Funzione per cancellare la campagna
  const handleCancelCampaign = async () => {
    if (!campaign) return;

    try {
      setIsCanceling(true);

      const response = await fetch(`/api/campaign/${campaign.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Errore ${response.status}`);
      }

      if (!data.success) {
        throw new Error(
          data.message || "Errore nella cancellazione della campagna",
        );
      }

      // Aggiorna lo stato della campagna
      setCampaign((prev) => (prev ? { ...prev, status: "canceled" } : null));

      // Chiudi il dialog
      setShowCancelDialog(false);

      // Mostra messaggio di successo
      toast({
        title: "✅ Campagna cancellata",
        description: `${data.data.canceledMessages || 0} messaggi sono stati cancellati con successo.`,
        duration: 4000,
      });

      // Ricarica i dettagli per essere sicuri
      await fetchCampaignDetails();
    } catch (error: any) {
      console.error("Errore nella cancellazione:", error);

      toast({
        title: "❌ Errore nella cancellazione",
        description:
          error.message || "Impossibile cancellare la campagna. Riprova.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsCanceling(false);
    }
  };

  // 🆕 Funzione per verificare se la campagna può essere cancellata
  const canCancelCampaign = (campaign: Campaign): boolean => {
    return campaign.status === "scheduled";
  };

  // 🆕 Funzione per sincronizzare gli stati della campagna da Twilio
  const handleSyncCampaign = async () => {
    if (!campaign) return;
    
    try {
      setIsSyncing(true);
      
      const response = await fetch(`/api/campaign/${campaign.id}/sync-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Errore ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Errore nella sincronizzazione');
      }

      // Mostra messaggio di successo con le statistiche dettagliate
      const stats = data.data.statistics;
      toast({
        title: "✅ Sincronizzazione completata",
        description: `${data.data.updatedMessages} messaggi aggiornati.\n📤 Consegnati: ${stats.delivered} | 👀 Letti: ${stats.read} | ❌ Falliti: ${stats.failed}`,
        duration: 6000,
      });

      console.log('🔄 Sincronizzazione completata, ricarico campagna...');
      console.log('📊 Statistiche:', stats);
      
      // Ricarica i dettagli della campagna
      await fetchCampaignDetails();
      
      // Ricarica anche attribution se disponibile
      if (campaign.status === "completed" || campaign.status === "sent") {
        await fetchAttributionData();
      }
      
      console.log('✅ Campagna ricaricata con successo');

    } catch (error: any) {
      console.error('Errore nella sincronizzazione:', error);
      
      toast({
        title: "❌ Errore nella sincronizzazione",
        description: error.message || "Impossibile sincronizzare gli stati. Riprova.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 🆕 Funzione per verificare se la campagna può essere sincronizzata
  const canSyncCampaign = (campaign: Campaign): boolean => {
    return ['scheduled', 'completed', 'sent', 'in_progress'].includes(campaign.status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <span>✅</span> {t("campaigns.status.sent")}
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <span>📆</span> {t("campaigns.status.scheduled")}
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <span>⏳</span> {t("campaigns.status.inProgress")}
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <span>📝</span> {t("campaigns.status.draft")}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <span>❌</span> {t("campaigns.status.failed")}
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <span>🚫</span> Cancellata
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <span>✅</span> Completata
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promo":
        return <Gift className="w-5 h-5 text-[#EF476F]" />;
      case "event":
        return <CalendarClock className="w-5 h-5 text-[#1B9AAA]" />;
      case "update":
        return <Menu className="w-5 h-5 text-[#FFE14D]" />;
      case "feedback":
        return <Star className="w-5 h-5 text-[#06D6A0]" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png";
  };

  const getExcitedMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png";
  };

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
            <h1 className="text-xl font-bold text-gray-800">
              {t("campaigns.details")}
            </h1>
            <UILanguageSelector variant="compact" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B9AAA]"></div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {t("campaignDetails.loadingCampaign")}
            </h3>
            <p className="text-gray-500">
              {t("campaignDetails.loadingDescription")}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center mb-6">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {t("common.error")}
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <CustomButton onClick={fetchCampaignDetails}>
              {t("common.tryAgain")}
            </CustomButton>
          </div>
        )}

        {/* Campaign Content - Single Scrollable Page */}
        {!isLoading && !error && campaign && (
          <div className="space-y-6 pb-32">
            {/* Campaign Header Card */}
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] rounded-2xl flex items-center justify-center">
                  {getTypeIcon(campaign.type)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {campaign.name}
                  </h2>
                  {getStatusBadge(campaign.status)}
                </div>
              </div>

              {/* Quick Stats - Mobile Optimized */}
              <div className="space-y-2 mb-4">
                {/* Riga 1: Consegnati e Letti */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-base">📤</span>
                      <span className="text-xs text-green-700 font-medium">Consegnati</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-green-600">
                        {campaign.statistics?.deliveredCount || 0}
                      </span>
                      <span className="text-xs text-green-600">
                        / {campaign.recipients}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-base">👀</span>
                      <span className="text-xs text-blue-700 font-medium">Letti</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {campaign.statistics?.readCount || 0}
                    </div>
                  </div>
                </div>

                {/* Riga 2: Falliti e Tornati */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-base">❌</span>
                      <span className="text-xs text-red-700 font-medium">Falliti</span>
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {campaign.statistics?.failedCount || 0}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-base">🎯</span>
                      <span className="text-xs text-purple-700 font-medium">Tornati</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-purple-600">
                        {isLoadingAttribution ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          attributionData?.totalReturns || 0
                        )}
                      </span>
                      {attributionData?.returnRate !== undefined && attributionData.returnRate > 0 && (
                        <span className="text-xs text-purple-600 font-medium">
                          ({attributionData.returnRate}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Prima riga: Sincronizza */}
                {canSyncCampaign(campaign) && (
                  <CustomButton
                    variant="outline"
                    className="w-full py-3 flex items-center justify-center text-sm border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={handleSyncCampaign}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sincronizzando da Twilio...
                      </>
                    ) : (
                      <>
                        <span className="text-base mr-2">🔄</span>
                        Sincronizza Stati da Twilio
                      </>
                    )}
                  </CustomButton>
                )}

                {/* Seconda riga: Duplica e Cancella/Condividi */}
                <div className="flex gap-2">
                  {/* Pulsante Duplica */}
                  <CustomButton
                    className="flex-1 py-2 flex items-center justify-center text-xs"
                    onClick={() =>
                      router.push(`/campaign/create?duplicate=${campaign.id}`)
                    }
                  >
                    <Edit3 className="w-4 h-4 mr-1" /> Duplica
                  </CustomButton>

                  {/* 🆕 Pulsante Cancella (solo per campagne scheduled) */}
                  {canCancelCampaign(campaign) && (
                    <CustomButton
                      variant="destructive"
                      className="flex-1 py-2 flex items-center justify-center text-xs"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={isCanceling}
                    >
                      {isCanceling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Cancellando...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancella
                        </>
                      )}
                    </CustomButton>
                  )}

                  {/* Pulsante Condividi (solo se non è una campagna scheduled che può essere cancellata) */}
                  {!canCancelCampaign(campaign) && (
                    <CustomButton
                      variant="outline"
                      className="flex-1 py-2 flex items-center justify-center text-xs"
                      onClick={() => {
                        // TODO: Implementare condivisione
                        console.log("Condividi campagna");
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-1" /> Condividi
                    </CustomButton>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Informazioni Campagna
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  {getStatusBadge(campaign.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Creata il</span>
                  <span className="text-sm font-medium text-gray-800">
                    {campaign.createdAt ? formatDate(campaign.createdAt) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Ultima modifica</span>
                  <span className="text-sm font-medium text-gray-800">
                    {campaign.updatedAt ? formatDate(campaign.updatedAt) : "—"}
                  </span>
                </div>
                {campaign.scheduledDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Programmata per
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatDate(campaign.scheduledDate)}
                    </span>
                  </div>
                )}
                {campaign.sentDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Inviata il</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatDate(campaign.sentDate)}
                    </span>
                  </div>
                )}
                {/* 🆕 Informazioni aggiuntive per campagne Twilio */}
                {campaign.twilioScheduledMessages &&
                  campaign.twilioScheduledMessages.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600">🚀</span>
                        <span className="text-sm font-medium text-blue-800">
                          Schedulata su Twilio
                        </span>
                      </div>
                      <div className="text-xs text-blue-700 space-y-1">
                        <div>
                          📤{" "}
                          {campaign.schedulingStats?.successfulSchedules || 0}{" "}
                          messaggi programmati
                        </div>
                        {campaign.schedulingStats?.failedSchedules &&
                          campaign.schedulingStats.failedSchedules > 0 && (
                            <div>
                              ❌ {campaign.schedulingStats.failedSchedules}{" "}
                              errori di schedulazione
                            </div>
                          )}
                        <div>🕒 Invio gestito direttamente da Twilio</div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Attribution Tracking - Sempre Visibile */}
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h3 className="text-lg font-bold text-gray-800">
                  Clienti Tornati
                </h3>
              </div>

              {isLoadingAttribution ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Caricamento statistiche...
                  </p>
                </div>
              ) : attributionData ? (
                <div className="space-y-4">
                  {/* Statistiche principali */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {attributionData.totalReturns}
                      </div>
                      <div className="text-xs text-green-700 font-medium">
                        Clienti tornati
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {attributionData.returnRate}%
                      </div>
                      <div className="text-xs text-blue-700 font-medium">
                        Tasso di ritorno
                      </div>
                    </div>
                  </div>

                  {/* Tempo medio di ritorno */}
                  {attributionData.averageDaysToReturn > 0 && (
                    <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-lg font-bold text-purple-600">
                          {attributionData.averageDaysToReturn} giorni
                        </span>
                      </div>
                      <div className="text-xs text-purple-700 font-medium">
                        Tempo medio di ritorno
                      </div>
                    </div>
                  )}

                  {/* Lista clienti tornati */}
                  {attributionData.returns &&
                  attributionData.returns.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span>👥</span> Ultimi ritorni (
                        {attributionData.returns.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {attributionData.returns
                          .slice(0, 5)
                          .map((returnVisit, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">📱</span>
                                <span className="text-sm font-medium text-gray-800">
                                  {returnVisit.phoneNumber.replace(
                                    /(\+\d{2})(\d{3})(\d{3})(\d{4})/,
                                    "$1 $2 ***$4",
                                  )}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {returnVisit.daysAfterCampaign === 0
                                  ? "Oggi"
                                  : returnVisit.daysAfterCampaign === 1
                                    ? "Ieri"
                                    : `${returnVisit.daysAfterCampaign} giorni fa`}
                              </div>
                            </div>
                          ))}
                        {attributionData.returns.length > 5 && (
                          <div className="text-center text-xs text-gray-500 py-2">
                            ... e altri {attributionData.returns.length - 5}{" "}
                            clienti
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                      <span className="text-gray-500 text-sm">
                        👥 Nessun cliente tornato ancora
                      </span>
                    </div>
                  )}

                  {/* Spiegazione */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 text-sm">💡</span>
                      <div className="text-xs text-yellow-800 leading-relaxed">
                        <strong>Come funziona:</strong> Tracciamo i clienti che
                        tornano al ristorante scrivendo il trigger menu dopo
                        aver ricevuto questa campagna.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-3 block">🎯</span>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Nessun ritorno ancora
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    I clienti che torneranno al ristorante e scriveranno il
                    trigger menu verranno tracciati automaticamente qui.
                  </p>
                </div>
              )}
            </div>

            {/* Click Rate (se disponibile) */}
            {campaign.clickRate !== null &&
              campaign.clickRate !== undefined && (
                <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🔗</span>
                    <h3 className="text-lg font-bold text-gray-800">
                      Click Rate
                    </h3>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {campaign.clickRate}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Percentuale di click sui link della campagna
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Fixed Bottom Actions - Mobile Style */}
        <div className="w-full max-w-md fixed bottom-0 left-0 right-0 mx-auto bg-transparent backdrop-blur-sm rounded-t-3xl p-4 shadow-xl z-20">
          <div className="grid grid-cols-3 gap-2">
            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight"
              onClick={() => setShowRecipientsDialog(true)}
            >
              <Users className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-center break-words hyphens-auto max-w-full">
                Destinatari
              </span>
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight"
              onClick={() => setShowPreviewDialog(true)}
            >
              <Eye className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-center break-words hyphens-auto max-w-full">
                Anteprima
              </span>
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              onClick={() => setShowAnalyticsDialog(true)}
            >
              <span className="text-xl mb-1 flex-shrink-0">📊</span>
              <span className="text-center break-words hyphens-auto max-w-full">
                Analytics
              </span>
            </CustomButton>
          </div>
        </div>

        {/* 🆕 Dialog Destinatari */}
        <Dialog
          open={showRecipientsDialog}
          onOpenChange={setShowRecipientsDialog}
        >
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                Destinatari Campagna
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Informazioni sui destinatari di questa campagna
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Riepilogo Destinatari
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Destinatari totali
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {campaign?.recipients || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Con consenso</span>
                    <span className="text-sm font-bold text-gray-800">
                      {campaign?.targetAudience?.totalContacts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Metodo selezione
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {campaign?.targetAudience?.selectionMethod === "manual"
                        ? "Manuale"
                        : campaign?.targetAudience?.selectionMethod === "all"
                          ? "Tutti"
                          : campaign?.targetAudience?.selectionMethod ===
                              "filter"
                            ? "Filtro"
                            : "Sconosciuto"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
              <CustomButton
                className="w-full h-14 text-base font-semibold"
                onClick={() => setShowRecipientsDialog(false)}
              >
                ✅ Chiudi
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🆕 Dialog Anteprima */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-500" />
                Anteprima Messaggio
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Come apparirà il messaggio ai destinatari
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {/* Template Info */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Template Utilizzato
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">
                      Nome template
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {campaign?.template?.name ||
                        campaign?.template?.title ||
                        "Template di default"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">
                      Parametri messaggio
                    </span>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {campaign?.templateParameters
                          ? JSON.stringify(campaign.templateParameters, null, 2)
                          : "Nessun parametro disponibile"}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Dettagli Tecnici
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID Campagna:</span>
                    <span className="font-mono text-gray-700">
                      {campaign?.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="text-gray-700">
                      {campaign?.type || "Sconosciuto"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Include media:</span>
                    <span className="text-gray-700">
                      {campaign?.template?.useImage ? "Sì" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
              <CustomButton
                className="w-full h-14 text-base font-semibold"
                onClick={() => setShowPreviewDialog(false)}
              >
                ✅ Chiudi
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🆕 Dialog Analytics Dettagliato */}
        <Dialog
          open={showAnalyticsDialog}
          onOpenChange={setShowAnalyticsDialog}
        >
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Analytics Dettagliati
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Statistiche complete della campagna
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {/* 📊 Statistiche Invio Complete */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📤</span> Statistiche Invio
                </h3>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium mb-1">Destinatari</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {campaign?.recipients || 0}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                    <div className="text-xs text-green-700 font-medium mb-1">Consegnati</div>
                    <div className="text-2xl font-bold text-green-600">
                      {campaign?.statistics?.deliveredCount || 0}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {campaign?.recipients > 0 
                        ? `${Math.round((campaign?.statistics?.deliveredCount || 0) / campaign.recipients * 100)}%`
                        : '0%'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                    <div className="text-xs text-blue-700 font-medium mb-1">Letti (2✓)</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {campaign?.statistics?.readCount || 0}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {campaign?.statistics?.deliveredCount > 0 
                        ? `${Math.round((campaign?.statistics?.readCount || 0) / campaign.statistics.deliveredCount * 100)}%`
                        : '0%'}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                    <div className="text-xs text-red-700 font-medium mb-1">Falliti</div>
                    <div className="text-2xl font-bold text-red-600">
                      {campaign?.statistics?.failedCount || 0}
                    </div>
                  </div>
                </div>

                {/* 🔗 Click Rate (se disponibile) */}
                {campaign?.statistics?.clickedCount !== undefined && campaign?.statistics?.clickedCount > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔗</span>
                        <div>
                          <div className="text-sm text-indigo-700 font-medium">Click sui Link</div>
                          <div className="text-xs text-indigo-600">
                            {campaign.statistics.clickedCount} click totali
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {campaign.statistics.clickRate || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ⚠️ Dettagli Fallimenti */}
                {campaign?.statistics?.failureDetails && campaign.statistics.failureDetails.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">⚠️</span>
                      <h4 className="text-sm font-semibold text-red-700">
                        Dettagli Fallimenti ({campaign.statistics.failureDetails.length})
                      </h4>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {campaign.statistics.failureDetails.slice(0, 5).map((failure: any, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <div className="text-xs font-medium text-red-800">
                            📱 {failure.phoneNumber}
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            {failure.error}
                          </div>
                        </div>
                      ))}
                      {campaign.statistics.failureDetails.length > 5 && (
                        <div className="text-center text-xs text-gray-500 py-1">
                          ... e altri {campaign.statistics.failureDetails.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 🎯 Attribution Dettagliata */}
              {isLoadingAttribution ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Caricamento attribution...</p>
                </div>
              ) : attributionData ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🎯</span> Clienti Tornati
                  </h3>

                  {/* Metriche principali */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {attributionData.totalReturns}
                      </div>
                      <div className="text-xs text-purple-700 font-medium">
                        Clienti tornati
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {attributionData.returnRate}%
                      </div>
                      <div className="text-xs text-purple-700 font-medium">
                        Tasso di ritorno
                      </div>
                    </div>
                  </div>

                  {attributionData.averageDaysToReturn > 0 && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-lg font-bold text-purple-600">
                          {attributionData.averageDaysToReturn} giorni
                        </span>
                      </div>
                      <div className="text-xs text-purple-700 font-medium mt-1">
                        Tempo medio di ritorno
                      </div>
                    </div>
                  )}

                  {/* Lista ritorni */}
                  {attributionData.returns && attributionData.returns.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {attributionData.returns.map((returnVisit, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">📱</span>
                            <div>
                              <div className="text-sm font-medium text-gray-800">
                                {returnVisit.phoneNumber.replace(
                                  /(\+\d{2})(\d{3})(\d{3})(\d+)/,
                                  "$1 $2 ***",
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {returnVisit.daysAfterCampaign === 0
                                  ? "Oggi"
                                  : returnVisit.daysAfterCampaign === 1
                                    ? "Ieri"
                                    : `${returnVisit.daysAfterCampaign}g fa`}
                              </div>
                            </div>
                          </div>
                          <div className="text-purple-600 text-lg">✅</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <span className="text-3xl mb-2 block">🎯</span>
                      <p className="text-gray-500 text-sm">
                        Nessun cliente tornato ancora
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
              <CustomButton
                className="w-full h-14 text-base font-semibold"
                onClick={() => setShowAnalyticsDialog(false)}
              >
                ✅ Chiudi
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🆕 Dialog per la cancellazione */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <XCircle className="w-6 h-6 text-red-500" />
                Cancella Campagna
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                {campaign && (
                  <>
                    Sei sicuro di voler cancellare la campagna{" "}
                    <strong>"{campaign.name}"</strong>?
                    <br />
                    <br />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600">⚠️</span>
                        <div className="text-red-800">
                          <strong>Attenzione:</strong> Questa azione cancellerà
                          tutti i {campaign.recipients} messaggi programmati su
                          Twilio. L'operazione è irreversibile.
                          {campaign.scheduledDate && (
                            <>
                              <br />
                              <br />
                              <strong>Data programmata:</strong>{" "}
                              {new Date(campaign.scheduledDate).toLocaleString(
                                "it-IT",
                              )}
                            </>
                          )}
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
                onClick={handleCancelCampaign}
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
                onClick={() => setShowCancelDialog(false)}
                disabled={isCanceling}
                className="w-full h-10"
              >
                Annulla
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
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
  );
}
