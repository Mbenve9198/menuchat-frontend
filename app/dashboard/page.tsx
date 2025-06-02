"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ChevronRight, MessageSquare, Edit3, Share2, Calendar, ArrowUp, ChevronDown, RefreshCw, Phone, XCircle } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import UILanguageSelector from "@/components/ui-language-selector"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { useTranslation } from "react-i18next"

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Stato per dati dal backend
  const [greeting, setGreeting] = useState("Good day")
  const [restaurantName, setRestaurantName] = useState("Your Restaurant")
  const [daysActive, setDaysActive] = useState(0)
  const [menusSent, setMenusSent] = useState(0)
  const [reviewRequests, setReviewRequests] = useState(0)
  const [reviewsCollected, setReviewsCollected] = useState(0)
  const [totalReviewsCollected, setTotalReviewsCollected] = useState(0)
  const [initialReviewCount, setInitialReviewCount] = useState(0)
  const [currentReviewCount, setCurrentReviewCount] = useState(0)
  const [newReviewsCollected, setNewReviewsCollected] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [trendMenus, setTrendMenus] = useState(0)
  const [trendReviews, setTrendReviews] = useState(0)

  // Nuovi stati per gamification
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [reviewsToNextLevel, setReviewsToNextLevel] = useState(10)
  const [weeklyStreak, setWeeklyStreak] = useState(0)
  const [achievements, setAchievements] = useState<any[]>([])
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showNewAchievement, setShowNewAchievement] = useState<any>(null)
  const [levelInfo, setLevelInfo] = useState<any>(null)

  // Stato per filtro tempo
  const [timeFilter, setTimeFilter] = useState<"7days" | "30days" | "custom">("7days")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  // Stato per attività
  const [activities, setActivities] = useState<any[]>([])
  
  // Stato per la sincronizzazione delle recensioni
  const [isSyncingReviews, setIsSyncingReviews] = useState(false)
  
  // Stato per le impostazioni Twilio
  const [twilioStatus, setTwilioStatus] = useState<any>(null)
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [messagingServiceId, setMessagingServiceId] = useState("")
  const [isSavingTwilio, setIsSavingTwilio] = useState(false)
  const [twilioSuccess, setTwilioSuccess] = useState(false)
  const [twilioError, setTwilioError] = useState<string | null>(null)
  const [isCustomNumber, setIsCustomNumber] = useState(false)

  // Recupera i dati dal backend solo quando la sessione è pronta
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchStats()
      fetchActivities()
      fetchRestaurantInfo()
      // Sincronizza automaticamente le recensioni da Google ad ogni caricamento
      syncGoogleReviews()
      // Carica lo stato Twilio solo all'avvio, non quando cambiano i filtri
      if (!twilioStatus) {
        fetchTwilioStatus()
      }
    } else if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
    }
  }, [status, session, timeFilter, startDate, endDate])

  // Gestisce l'apertura e chiusura del dialog Twilio
  useEffect(() => {
    if (showWhatsappDialog) {
      // Quando il dialog è aperto, non fare nulla
      // Questo consente di modificare i dati senza che vengano sovrascritti
    } else {
      // Quando il dialog viene chiuso, aggiorna lo stato se necessario
      if (twilioSuccess) {
        fetchTwilioStatus()
      }
    }
  }, [showWhatsappDialog])

  // Recupera i dati dal backend
  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const restaurantId = session?.user?.restaurantId
      
      // Costruisci i parametri di query
      let queryParams = `period=${timeFilter}`
      if (timeFilter === "custom") {
        queryParams += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      }
      
      const response = await fetch(`/api/stats?restaurantId=${restaurantId}&${queryParams}`)
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Unknown error")
      }
      
      // Aggiorna lo stato con i dati ricevuti
      setMenusSent(data.menusSent)
      setReviewRequests(data.reviewRequests)
      setReviewsCollected(data.reviewsCollected)
      setTotalReviewsCollected(data.totalReviewsCollected)
      setInitialReviewCount(data.initialReviewCount || 0)
      setCurrentReviewCount(data.currentReviewCount || 0)
      
      // Assicura che il valore delle nuove recensioni sia sempre non negativo
      setNewReviewsCollected(Math.max(0, data.totalReviewsCollected))
      
      // Aggiorna trend
      setTrendMenus(data.trends.menusSent)
      setTrendReviews(data.trends.reviewsCollected)
      
      // Aggiorna dati gamification
      const previousLevel = level
      setLevel(data.level || 1)
      setExperience(data.totalExperience || 0)
      setReviewsToNextLevel(data.reviewsToNextLevel || 10)
      setWeeklyStreak(data.weeklyStreak || 0)
      setLevelInfo(data.levelInfo || {
        level: "Newbie",
        nextLevel: "Rising Star",
        current: 0,
        target: 100,
        remaining: 100,
        progress: 0
      })
      
      // Gestione achievement con localStorage per evitare notifiche duplicate
      const currentAchievements = data.achievements || []
      const storageKey = `achievements_seen_${restaurantId}`
      const seenAchievements = JSON.parse(localStorage.getItem(storageKey) || '[]')
      
      // Trova achievement veramente nuovi (non ancora visti)
      const newAchievements = currentAchievements.filter(
        (achievement: any) => !seenAchievements.includes(achievement.id)
      )
      
      // Se ci sono nuovi achievement, mostra il più recente e aggiorna localStorage
      if (newAchievements.length > 0) {
        const newestAchievement = newAchievements[newAchievements.length - 1] // Prende l'ultimo (più alto)
        setShowNewAchievement(newestAchievement)
        setTimeout(() => setShowNewAchievement(null), 4000)
        
        // Aggiorna la lista degli achievement visti
        const updatedSeenAchievements = [...seenAchievements, ...newAchievements.map((a: any) => a.id)]
        localStorage.setItem(storageKey, JSON.stringify(updatedSeenAchievements))
      }
      
      setAchievements(currentAchievements)
      
      // Controlla se c'è stato un level up
      if (data.level && data.level > previousLevel) {
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 3000)
      }
      
      // Verifica record
      if (data.trends.reviewsCollected > 20) {
        setIsNewRecord(true)
      }
      
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError("Failed to load statistics. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Recupera le attività
  const fetchActivities = async () => {
    try {
      const restaurantId = session?.user?.restaurantId
      
      const response = await fetch(`/api/activities?restaurantId=${restaurantId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Unknown error")
      }
      
      // Trasforma le attività nel formato utilizzato dal frontend
      const formattedActivities = data.activities.map((activity: any, index: number) => ({
        id: activity.id || index,
        type: activity.type,
        emoji: activity.emoji,
        message: activity.message,
        time: activity.time,
        expanded: false,
        details: activity.details,
        customerName: activity.customerName
      }))
      
      setActivities(formattedActivities)
      
    } catch (err) {
      console.error("Error fetching activities:", err)
    }
  }
  
  // Recupera le informazioni del ristorante
  const fetchRestaurantInfo = async () => {
    try {
      const restaurantId = session?.user?.restaurantId
      
      const response = await fetch(`/api/restaurants/${restaurantId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch restaurant info")
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Unknown error")
      }
      
      setRestaurantName(data.restaurant.name)
      
      // Usa i giorni attivi restituiti dall'API
      if (data.restaurant.daysActive) {
        setDaysActive(data.restaurant.daysActive)
      } else if (data.restaurant.createdAt) {
        // Fallback: calcola manualmente i giorni attivi
        const createdDate = new Date(data.restaurant.createdAt)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - createdDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setDaysActive(diffDays)
      }
      
    } catch (err) {
      console.error("Error fetching restaurant info:", err)
    }
  }

  // Recupera lo stato di Twilio
  const fetchTwilioStatus = async () => {
    try {
      const response = await fetch('/api/twilio/status')
      if (!response.ok) {
        throw new Error("Failed to fetch Twilio status")
      }
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Unknown error")
      }
      
      setTwilioStatus(data.data)
      
      // Controlla se l'utente sta utilizzando un numero personalizzato
      // Verifica sia il flag 'configured' che il campo 'phoneNumber'
      const isUsingCustomNumber = data.data.phoneNumber && 
                                (data.data.configured || 
                                 (data.data.status && data.data.status.whatsappNumberType === 'custom'))
      
      setIsCustomNumber(isUsingCustomNumber)
      
      if (data.data.phoneNumber) {
        setWhatsappNumber(data.data.phoneNumber.replace('whatsapp:', ''))
      }
      
      // Imposta il messaging service ID se disponibile
      if (data.data.status && data.data.status.messagingServiceSid) {
        setMessagingServiceId(data.data.status.messagingServiceSid)
      }
      
    } catch (err) {
      console.error("Error fetching Twilio status:", err)
    }
  }
  
  // Salva le impostazioni personalizzate di Twilio
  const saveCustomTwilioSettings = async () => {
    setIsSavingTwilio(true)
    setTwilioSuccess(false)
    setTwilioError(null)
    
    try {
      const response = await fetch('/api/twilio/custom-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          whatsappNumber,
          messagingServiceSid: messagingServiceId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to update Twilio settings")
      }
      
      setTwilioSuccess(true)
      setShowWhatsappDialog(false)
      fetchTwilioStatus() // Ricarica i dati aggiornati
      
    } catch (err: any) {
      console.error("Error saving Twilio settings:", err)
      setTwilioError(err.message || "Si è verificato un errore durante il salvataggio delle impostazioni Twilio")
    } finally {
      setIsSavingTwilio(false)
    }
  }

  // Ripristina il numero WhatsApp predefinito
  const restoreDefaultWhatsapp = async () => {
    setIsSavingTwilio(true)
    setTwilioSuccess(false)
    setTwilioError(null)
    
    try {
      const response = await fetch('/api/twilio/reset-to-default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to reset WhatsApp settings")
      }
      
      setTwilioSuccess(true)
      setShowWhatsappDialog(false)
      fetchTwilioStatus() // Ricarica i dati aggiornati
      
    } catch (err: any) {
      console.error("Error resetting WhatsApp settings:", err)
      setTwilioError(err.message || "Si è verificato un errore durante il ripristino delle impostazioni predefinite")
    } finally {
      setIsSavingTwilio(false)
    }
  }

  // Imposta il saluto in base all'orario
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting(t("dashboard.goodMorning"))
    } else if (hour < 18) {
      setGreeting(t("dashboard.goodAfternoon"))
    } else {
      setGreeting(t("dashboard.goodEvening"))
    }
  }, [t])

  const toggleActivityExpand = (id: number) => {
    setActivities(
      activities.map((activity) => (activity.id === id ? { ...activity, expanded: !activity.expanded } : activity)),
    )
  }

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  const getExcitedMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
  }

  const getFilterLabel = () => {
    if (timeFilter === "7days") return "Last 7 days"
    if (timeFilter === "30days") return "Last 30 days"
    if (timeFilter === "custom") {
      return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
    }
    return "Select period"
  }

  const handleFilterSelect = (filter: "7days" | "30days" | "custom") => {
    setTimeFilter(filter)
    if (filter === "7days") {
      setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      setEndDate(new Date())
    } else if (filter === "30days") {
      setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      setEndDate(new Date())
    }

    if (filter !== "custom") {
      setShowFilterDropdown(false)
      setShowDatePicker(false)
    } else {
      setShowDatePicker(true)
    }
  }

  const applyCustomDateRange = () => {
    setShowDatePicker(false)
    setShowFilterDropdown(false)
  }

  // Sincronizza le recensioni da Google
  const syncGoogleReviews = async () => {
    try {
      const restaurantId = session?.user?.restaurantId
      const response = await fetch(`/api/restaurants/${restaurantId}/sync-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log("Google reviews synced successfully")
      }
    } catch (error) {
      console.error("Error syncing reviews:", error)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 pb-24">
        {/* Header Section */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-[#1B9AAA] mb-1">{restaurantName}</h1>
              <p className="text-lg text-gray-700">
                {greeting}, {restaurantName}! 🌞
              </p>
            </div>

            <div className="flex items-center">
              <Image
                src="/mascottes/mascotte_base.png"
                alt="MenuChat Mascot"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <motion.div
              className="bg-white rounded-full px-3 py-1 inline-flex items-center gap-1 shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Calendar className="w-4 h-4 text-[#EF476F]" />
              <span className="text-xs font-medium text-gray-700">{daysActive} {t("dashboard.daysActive")}</span>
            </motion.div>

            <UILanguageSelector variant="compact" />
          </div>
        </div>

        {/* Time Period Filter */}
        <div className="w-full max-w-md mb-4 relative">
          <div
            className="bg-white rounded-xl p-3 shadow-md flex items-center justify-between cursor-pointer"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">{getFilterLabel()}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
            />
          </div>

          {showFilterDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg z-30 overflow-hidden">
              <div
                className={`p-3 cursor-pointer hover:bg-gray-50 ${timeFilter === "7days" ? "bg-gray-50" : ""}`}
                onClick={() => handleFilterSelect("7days")}
              >
                <span className="text-sm font-medium text-gray-700">{t("dashboard.lastDays", { count: 7 })}</span>
              </div>
              <div
                className={`p-3 cursor-pointer hover:bg-gray-50 ${timeFilter === "30days" ? "bg-gray-50" : ""}`}
                onClick={() => handleFilterSelect("30days")}
              >
                <span className="text-sm font-medium text-gray-700">{t("dashboard.lastDays", { count: 30 })}</span>
              </div>
              <div
                className={`p-3 cursor-pointer hover:bg-gray-50 ${timeFilter === "custom" ? "bg-gray-50" : ""}`}
                onClick={() => handleFilterSelect("custom")}
              >
                <span className="text-sm font-medium text-gray-700">{t("dashboard.customRange")}</span>
              </div>

              {showDatePicker && (
                <div className="p-3 border-t border-gray-100">
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">{t("dashboard.startDate")}</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      value={format(startDate, "yyyy-MM-dd")}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">{t("dashboard.endDate")}</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      value={format(endDate, "yyyy-MM-dd")}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                    />
                  </div>
                  <button
                    className="w-full bg-[#1B9AAA] text-white rounded-md py-2 text-sm font-medium"
                    onClick={applyCustomDateRange}
                  >
                    {t("common.apply")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Level Progress */}
        <div className="w-full max-w-md mb-6">
          <motion.div
            className={`rounded-3xl p-5 shadow-xl ${
              levelInfo?.level === "Newbie"
                ? "bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800"
                : levelInfo?.level === "Rising Star"
                ? "bg-gradient-to-br from-purple-100 to-pink-100 text-gray-800"
                : levelInfo?.level === "MasterChef"
                ? "bg-gradient-to-br from-amber-100 to-orange-100 text-gray-800"
                : "bg-gradient-to-br from-emerald-100 to-teal-100 text-gray-800"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{t("dashboard.restaurantLevel")}</h3>
                <div className="flex items-center gap-3 mb-2">
                  <p className={`text-3xl font-extrabold ${
                    levelInfo?.level === "Newbie"
                      ? "text-blue-600"
                      : levelInfo?.level === "Rising Star"
                      ? "text-purple-600"
                      : levelInfo?.level === "MasterChef"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}>{levelInfo?.level || "Newbie"}</p>
                  <div className="text-4xl">👨‍🍳</div>
                </div>
                {levelInfo?.nextLevel && (
                  <p className="text-sm text-gray-600">
                    Prossimo: <span className="font-medium">{levelInfo.nextLevel}</span>
                  </p>
                )}
              </div>
              
              {weeklyStreak > 0 && (
                <div className="bg-white/40 px-3 py-2 rounded-full flex items-center">
                  <span className="text-xl mr-1">🔥</span>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-800">{weeklyStreak}</div>
                    <div className="text-xs text-gray-600">streak</div>
                  </div>
                </div>
              )}
            </div>

            {levelInfo?.nextLevel ? (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progresso livello</span>
                  <span className="font-medium text-gray-700">{levelInfo.current}/{levelInfo.target}</span>
                </div>
                <Progress
                  value={levelInfo.progress}
                  className="h-3 bg-white/50"
                  indicatorClassName={`transition-all duration-700 ease-in-out ${
                    levelInfo.level === "Newbie"
                      ? "bg-gradient-to-r from-blue-400 to-purple-400"
                      : levelInfo.level === "Rising Star"
                      ? "bg-gradient-to-r from-purple-400 to-pink-400"
                      : levelInfo.level === "MasterChef"
                      ? "bg-gradient-to-r from-amber-400 to-orange-400"
                      : "bg-gradient-to-r from-emerald-400 to-teal-400"
                  }`}
                />
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium text-gray-800">{levelInfo.remaining}</span> recensioni mancanti
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="bg-white/40 rounded-xl p-3 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    🎉 Livello massimo raggiunto!
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Continua a raccogliere recensioni per mantenere il tuo status leggendario
                  </p>
                </div>
              </div>
            )}

            {/* Achievement recenti */}
            {achievements.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Achievement recenti</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {achievements.slice(-3).map((achievement: any, index: number) => (
                    <div 
                      key={achievement.id || index}
                      className="bg-white/40 rounded-lg p-2 min-w-[60px] text-center flex-shrink-0"
                    >
                      <div className="text-lg mb-1">{achievement.icon}</div>
                      <div className="text-xs font-medium truncate text-gray-700">{achievement.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Key Metrics Cards */}
        <div className="w-full max-w-md space-y-4 mb-6">
          {/* Menus Sent Card */}
          <motion.div
            className="bg-white rounded-3xl p-5 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{t("dashboard.menusSent")}</h3>
                <p className="text-3xl font-extrabold text-[#1B9AAA]">{menusSent}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>

            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>{trendMenus > 0 ? `+${trendMenus}%` : `${trendMenus}%`} {t("dashboard.thisWeek")}</span>
            </div>
          </motion.div>

          {/* Review Requests Card */}
          <motion.div
            className="bg-white rounded-3xl p-5 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{t("dashboard.reviewRequests")}</h3>
                <p className="text-3xl font-extrabold text-[#EF476F]">{reviewRequests}</p>
              </div>
              <div className="text-3xl">📢</div>
            </div>
          </motion.div>

          {/* Reviews Collected Card */}
          <motion.div
            className="bg-white rounded-3xl p-5 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{t("dashboard.reviewsCollected")}</h3>
                <div className="flex items-center">
                  <p className="text-3xl font-extrabold text-[#06D6A0]">{reviewsCollected || totalReviewsCollected}</p>
                  {newReviewsCollected > 0 && (
                    <div className="ml-2 px-2 py-1 bg-green-100 rounded-md flex items-center">
                      <span className="text-xs font-bold text-green-700">+{newReviewsCollected}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {newReviewsCollected} recensioni raccolte con MenuChat
                </p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-[#FFE14D] fill-[#FFE14D]" />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">4.8 {t("dashboard.avgRating")}</span>
              </div>

              {isNewRecord && (
                <div className="bg-[#F8FFE5] px-3 py-1 rounded-full text-xs font-bold text-[#06D6A0] flex items-center">
                  <Trophy className="w-3 h-3 mr-1" /> {t("dashboard.newRecord")}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-gray-600">
                {t("dashboard.reviewsOnGoogle")}: <span className="font-medium">{currentReviewCount}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className={`flex items-center gap-1 text-xs font-medium ${isSyncingReviews ? 'text-blue-600 bg-blue-50' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'} transition-colors rounded-full px-3 py-1`}
                onClick={async () => {
                  if (isSyncingReviews) return;
                  
                  try {
                    setIsSyncingReviews(true);
                    await syncGoogleReviews();
                    // Ricarica i dati dopo la sincronizzazione
                    await fetchStats();
                    await fetchRestaurantInfo();
                  } catch (error) {
                    console.error("Error syncing reviews:", error);
                  } finally {
                    setIsSyncingReviews(false);
                  }
                }}
                disabled={isSyncingReviews}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingReviews ? 'animate-spin' : ''}`} /> 
                {isSyncingReviews ? t("dashboard.syncingFromGoogle") : t("dashboard.syncGoogleReviewsButton")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Feed */}
        <motion.div
          className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t("dashboard.recentActivity")}</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                className={`bg-gray-50 rounded-xl p-3 cursor-pointer ${activity.expanded ? "bg-gray-100" : ""}`}
                onClick={() => toggleActivityExpand(activity.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-lg">{activity.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>

                    {activity.expanded && (
                      <motion.div
                        className="mt-2 text-xs text-gray-600 bg-white p-2 rounded-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        {activity.type === "menu_view" && (
                          <>Customer viewed your full menu for 2 minutes and 15 seconds.</>
                        )}
                        {activity.type === "review_request" && (
                          <>Review request sent to customer who ordered 1 hour ago.</>
                        )}
                        {activity.type === "new_review" && (
                          <>
                            <div className="flex mb-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-3 h-3 text-[#FFE14D] fill-[#FFE14D]" />
                              ))}
                            </div>
                            "Great food and amazing service! Will definitely come back again."
                          </>
                        )}
                        {activity.type === "menu_update" && <>You updated your menu with 3 new items.</>}
                      </motion.div>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${activity.expanded ? "rotate-90" : ""}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* WhatsApp Settings Card */}
        <motion.div
          className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{t("dashboard.whatsappSettings")}</h3>
              <div className="flex items-center">
                <Phone className={`w-4 h-4 mr-2 ${isCustomNumber ? "text-green-500" : "text-[#1B9AAA]"}`} />
                <span className="text-sm text-gray-600">
                  {isCustomNumber ? "Numero personalizzato attivo" : "Numero predefinito"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                isCustomNumber 
                  ? "bg-green-100 text-green-700" 
                  : "bg-blue-100 text-blue-700"
              }`}>
                {isCustomNumber ? "CUSTOM" : "DEFAULT"}
              </div>
              <div className="text-3xl">📱</div>
            </div>
          </div>

          <CustomButton
            className="w-full h-12"
            variant={isCustomNumber ? "outline" : "default"}
            onClick={() => setShowWhatsappDialog(true)}
          >
            {isCustomNumber ? "Modifica" : "Configura numero personalizzato"}
          </CustomButton>
        </motion.div>

        {/* Quick Actions */}
        <div className="w-full max-w-md fixed bottom-0 left-0 right-0 mx-auto bg-transparent backdrop-blur-sm rounded-t-3xl p-4 shadow-xl z-20">
          <div className="grid grid-cols-3 gap-2">
            <CustomButton
              className="flex flex-col items-center justify-center h-20 py-2 px-1 text-xs"
              onClick={() => router.push("/campaign")}
            >
              <MessageSquare className="w-6 h-6 mb-1" />
              {t("dashboard.campaigns")}
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-20 py-2 px-1 text-xs"
              onClick={() => router.push("/templates")}
            >
              <Edit3 className="w-6 h-6 mb-1" />
              {t("dashboard.editMessages")}
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-20 py-2 px-1 text-xs"
              onClick={() => {}}
            >
              <Share2 className="w-6 h-6 mb-1" />
              {t("dashboard.shareSuccess")}
            </CustomButton>
          </div>
        </div>

        {/* Modal di modifica WhatsApp */}
        {showWhatsappDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">{t("dashboard.whatsappSettings")}</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setShowWhatsappDialog(false)}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6 text-sm text-gray-600">
                <p>{t("dashboard.whatsappDescription")}</p>
              </div>
              
              {twilioError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {twilioError}
                </div>
              )}
              
              {twilioSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                  {t("dashboard.settingsUpdated")}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dashboard.whatsappNumber")}
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-xl text-sm focus:border-[#1B9AAA] focus:ring-1 focus:ring-[#1B9AAA] outline-none transition"
                    placeholder="+39123456789"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("dashboard.messagingServiceId")}
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-xl text-sm focus:border-[#1B9AAA] focus:ring-1 focus:ring-[#1B9AAA] outline-none transition"
                    placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={messagingServiceId}
                    onChange={(e) => setMessagingServiceId(e.target.value)}
                  />
                </div>
                
                {/* Aggiungi separatore e spiegazione */}
                {isCustomNumber && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      {t("dashboard.usingCustomNumber")}
                    </p>
                    <CustomButton
                      className="w-full h-10"
                      variant="secondary"
                      onClick={restoreDefaultWhatsapp}
                      disabled={isSavingTwilio}
                    >
                      {t("dashboard.restoreDefault")}
                    </CustomButton>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <CustomButton
                    className="flex-1 h-12"
                    onClick={() => setShowWhatsappDialog(false)}
                    variant="outline"
                  >
                    {t("common.cancel")}
                  </CustomButton>
                  
                  <CustomButton
                    className="flex-1 h-12"
                    disabled={isSavingTwilio}
                    onClick={saveCustomTwilioSettings}
                  >
                    {isSavingTwilio ? t("dashboard.saving") : t("dashboard.saveSettings")}
                  </CustomButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Level Up Notification */}
      {showLevelUp && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-white text-center shadow-2xl"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, rotate: 10 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <div className="text-6xl mb-4">🎉</div>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
            <p className="text-xl">Hai raggiunto il livello {level}!</p>
            <p className="text-sm mt-2 opacity-90">Continua così per sbloccare nuove funzionalità!</p>
          </motion.div>
        </motion.div>
      )}

      {/* New Achievement Notification */}
      {showNewAchievement && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 text-white shadow-xl max-w-sm">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{showNewAchievement.icon}</div>
              <div>
                <h3 className="font-bold">Nuovo Achievement!</h3>
                <p className="text-sm">{showNewAchievement.name}</p>
                <p className="text-xs opacity-90">{showNewAchievement.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  )
}

// Custom Trophy icon component
function Trophy({ className }: { className?: string }) {
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
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
