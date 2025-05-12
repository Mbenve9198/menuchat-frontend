"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ChevronRight, MessageSquare, Edit3, Share2, Calendar, ArrowUp, ChevronDown } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export default function Dashboard() {
  const router = useRouter()
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
  const [weeklyGoalProgress, setWeeklyGoalProgress] = useState(0)
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(0)
  const [weeklyGoalCurrent, setWeeklyGoalCurrent] = useState(0)
  const [weeklyGoalDaysLeft, setWeeklyGoalDaysLeft] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [trendMenus, setTrendMenus] = useState(0)
  const [trendReviews, setTrendReviews] = useState(0)

  // Stato per filtro tempo
  const [timeFilter, setTimeFilter] = useState<"7days" | "30days" | "custom">("7days")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  
  // Stato per attività
  const [activities, setActivities] = useState<any[]>([])

  // Primi la dichiarazione di stato per il session
  const [session, setSession] = useState<any>(null);

  // Aggiungi un useEffect per recuperare la sessione
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setSession(data);
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };
    
    fetchSession();
  }, []);

  // Recupera i dati dal backend
  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // Ottieni l'ID ristorante dalla sessione
      if (!session || !session.user?.restaurantId) {
        throw new Error("No restaurant ID found in session");
      }
      
      const restaurantId = session.user.restaurantId;
      
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
      
      // Aggiorna dati weekly goal
      setWeeklyGoalProgress(data.weeklyGoal.progress)
      setWeeklyGoalTarget(data.weeklyGoal.target)
      setWeeklyGoalCurrent(data.weeklyGoal.current)
      setWeeklyGoalDaysLeft(data.weeklyGoal.daysLeft)
      
      // Aggiorna trend
      setTrendMenus(data.trends.menusSent)
      setTrendReviews(data.trends.reviewsCollected)
      
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
      // Ottieni l'ID ristorante dalla sessione
      if (!session || !session.user?.restaurantId) {
        throw new Error("No restaurant ID found in session");
      }
      
      const restaurantId = session.user.restaurantId;
      
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
      // Ottieni l'ID ristorante dalla sessione
      if (!session || !session.user?.restaurantId) {
        throw new Error("No restaurant ID found in session");
      }
      
      const restaurantId = session.user.restaurantId;
      
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

  // Imposta il saluto in base all'orario
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good Morning")
    } else if (hour < 18) {
      setGreeting("Good Afternoon")
    } else {
      setGreeting("Good Evening")
    }
  }, [])

  // Carica i dati all'inizio e quando cambia il filtro temporale
  useEffect(() => {
    fetchStats()
    fetchActivities()
    fetchRestaurantInfo()
  }, [timeFilter, startDate, endDate])

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

  const getLevelInfo = () => {
    if (totalReviewsCollected < 100) {
      return {
        level: "Newbie",
        nextLevel: "Rising Star",
        current: totalReviewsCollected,
        target: 100,
        remaining: 100 - totalReviewsCollected,
        progress: (totalReviewsCollected / 100) * 100,
      }
    } else if (totalReviewsCollected < 500) {
      return {
        level: "Rising Star",
        nextLevel: "MasterChef",
        current: totalReviewsCollected,
        target: 500,
        remaining: 500 - totalReviewsCollected,
        progress: ((totalReviewsCollected - 100) / 400) * 100,
      }
    } else if (totalReviewsCollected < 1000) {
      return {
        level: "MasterChef",
        nextLevel: "Culinary Legend",
        current: totalReviewsCollected,
        target: 1000,
        remaining: 1000 - totalReviewsCollected,
        progress: ((totalReviewsCollected - 500) / 500) * 100,
      }
    } else {
      return {
        level: "Culinary Legend",
        nextLevel: null,
        current: totalReviewsCollected,
        target: 10000,
        remaining: totalReviewsCollected >= 10000 ? 0 : 10000 - totalReviewsCollected,
        progress:
          ((totalReviewsCollected - 1000) / 9000) * 100 > 100 ? 100 : ((totalReviewsCollected - 1000) / 9000) * 100,
      }
    }
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

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 pb-24">
        {/* Header Section */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h1 className="text-2xl font-extrabold text-[#1B9AAA]">{restaurantName}</h1>
              <div className="relative w-8 h-8 ml-2">
                <Image
                  src={getMascotImage() || "/placeholder.svg"}
                  alt="Mascot"
                  width={32}
                  height={32}
                  className="absolute -top-1 -right-1"
                />
              </div>
            </div>

            <motion.div
              className="bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md border-2 border-[#EF476F]"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-4 h-4 text-[#FFE14D] fill-[#FFE14D]" />
              <span className="text-sm font-bold text-[#EF476F]">{getLevelInfo().level}</span>
            </motion.div>
          </div>

          <p className="text-lg text-gray-700 mb-4">
            {greeting}, {restaurantName}! 🌞
          </p>

          <motion.div
            className="bg-white rounded-full px-3 py-1 inline-flex items-center gap-1 shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Calendar className="w-4 h-4 text-[#EF476F]" />
            <span className="text-xs font-medium text-gray-700">{daysActive} days active</span>
          </motion.div>
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
                <span className="text-sm font-medium text-gray-700">Last 7 days</span>
              </div>
              <div
                className={`p-3 cursor-pointer hover:bg-gray-50 ${timeFilter === "30days" ? "bg-gray-50" : ""}`}
                onClick={() => handleFilterSelect("30days")}
              >
                <span className="text-sm font-medium text-gray-700">Last 30 days</span>
              </div>
              <div
                className={`p-3 cursor-pointer hover:bg-gray-50 ${timeFilter === "custom" ? "bg-gray-50" : ""}`}
                onClick={() => handleFilterSelect("custom")}
              >
                <span className="text-sm font-medium text-gray-700">Custom range</span>
              </div>

              {showDatePicker && (
                <div className="p-3 border-t border-gray-100">
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">Start date</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      value={format(startDate, "yyyy-MM-dd")}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1">End date</label>
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
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Level Progress */}
        <div className="w-full max-w-md mb-6">
          <motion.div
            className="bg-white rounded-3xl p-5 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Restaurant Level</h3>
                <p className="text-2xl font-extrabold text-[#EF476F]">{getLevelInfo().level}</p>
              </div>
              <div className="text-3xl">👨‍🍳</div>
            </div>

            {getLevelInfo().nextLevel ? (
              <>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{getLevelInfo().current} reviews</span>
                    <span className="text-gray-600">{getLevelInfo().target} reviews</span>
                  </div>
                  <Progress
                    value={getLevelInfo().progress}
                    className="h-2 bg-gray-100"
                    indicatorClassName="bg-gradient-to-r from-[#EF476F] to-[#FF8BA7] transition-all duration-700 ease-in-out"
                  />
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{getLevelInfo().remaining} more reviews</span> needed to reach{" "}
                  <span className="font-medium">{getLevelInfo().nextLevel}</span>
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-700 mt-2">
                Congratulations! You've reached the highest level. Keep collecting reviews to maintain your legendary
                status!
              </p>
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
                <h3 className="text-lg font-bold text-gray-800">Menus Sent</h3>
                <p className="text-3xl font-extrabold text-[#1B9AAA]">{menusSent}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>

            <div className="mb-2">
              <Progress
                value={75}
                className="h-2 bg-gray-100"
                indicatorClassName="bg-gradient-to-r from-[#1B9AAA] to-[#26C6D9] transition-all duration-700 ease-in-out"
              />
            </div>

            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>12% this week</span>
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
                <h3 className="text-lg font-bold text-gray-800">Review Requests</h3>
                <p className="text-3xl font-extrabold text-[#EF476F]">{reviewRequests}</p>
              </div>
              <div className="text-3xl">📢</div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-600">Conversion rate</p>
                <p className="text-sm font-medium text-green-600">↑ 5% from last week</p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#EF476F] rounded-full" style={{ width: "65%" }}></div>
              </div>
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
                <h3 className="text-lg font-bold text-gray-800">Reviews Collected</h3>
                <p className="text-3xl font-extrabold text-[#06D6A0]">{reviewsCollected}</p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-[#FFE14D] fill-[#FFE14D]" />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">4.8 avg</span>
              </div>

              {isNewRecord && (
                <div className="bg-[#F8FFE5] px-3 py-1 rounded-full text-xs font-bold text-[#06D6A0] flex items-center">
                  <Trophy className="w-3 h-3 mr-1" /> New record!
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Weekly Goal Progress */}
        <motion.div
          className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-800">Weekly Goal</h3>
            <div className="bg-[#FFE14D]/20 px-3 py-1 rounded-full text-xs font-bold text-gray-700">
              {weeklyGoalDaysLeft} days left
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Get {weeklyGoalTarget} new reviews this week
              </p>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  {weeklyGoalCurrent}/{weeklyGoalTarget} completed
                </span>
                <span className="ml-2 text-xs text-green-600">
                  ({weeklyGoalTarget - weeklyGoalCurrent} more to go!)
                </span>
              </div>
            </div>
            <div className="relative">
              <Image 
                src={getExcitedMascotImage() || "/placeholder.svg"} 
                alt="Excited Mascot" 
                width={50} 
                height={50} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-5xl font-extrabold text-[#EF476F]">{weeklyGoalProgress}%</div>
            <div className="w-24 h-24">
              <CircularProgressbar
                value={weeklyGoalProgress}
                styles={buildStyles({
                  pathColor: "#EF476F",
                  trailColor: "#f5f5f5",
                })}
              />
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>

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

        {/* Quick Actions */}
        <div className="w-full max-w-md fixed bottom-0 left-0 right-0 mx-auto bg-white rounded-t-3xl p-4 shadow-xl z-20">
          <div className="grid grid-cols-3 gap-2">
            <CustomButton
              className="flex flex-col items-center justify-center h-20 py-2 px-1 text-xs"
              onClick={() => router.push("/campaigns")}
            >
              <MessageSquare className="w-6 h-6 mb-1" />
              Campaigns
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-20 py-2 px-1 text-xs"
              onClick={() => {}}
            >
              <Edit3 className="w-6 h-6 mb-1" />
              Edit Messages
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-20 py-2 px-1 text-xs"
              onClick={() => {}}
            >
              <Share2 className="w-6 h-6 mb-1" />
              Share Success
            </CustomButton>
          </div>
        </div>
      </div>
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
