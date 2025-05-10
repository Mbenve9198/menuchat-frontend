"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Star,
  ChevronRight,
  Award,
  MessageSquare,
  QrCode,
  Edit3,
  Share2,
  Calendar,
  ArrowUp,
  ArrowDown,
  Megaphone,
  RefreshCw,
  Clock
} from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface Activity {
  _id: string;
  type: string;
  emoji: string;
  message: string;
  details: string;
  createdAt: string;
  expanded: boolean;
}

interface RestaurantData {
  _id: string;
  name: string;
  createdAt: string;
  level?: number;
  googleRating?: {
    rating: number;
    reviewCount: number;
  };
}

interface MenuStats {
  menusSent: number;
  reviewRequests: number;
  reviewsCollected: number;
  totalReviewsCollected: number;
  weeklyGoalProgress: number;
  trends: {
    menusSent: number;
    reviewRequests: number;
    reviewsCollected: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null)
  const [menuStats, setMenuStats] = useState<MenuStats>({
    menusSent: 0,
    reviewRequests: 0,
    reviewsCollected: 0,
    totalReviewsCollected: 0,
    weeklyGoalProgress: 0,
    trends: {
      menusSent: 0,
      reviewRequests: 0,
      reviewsCollected: 0
    }
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [greeting, setGreeting] = useState("Good day")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchRestaurantData()
      fetchStats()
      fetchActivities()
    }
  }, [status, session])

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch(`/api/restaurants/${session?.user?.restaurantId}`)
      const data = await response.json()
      if (data.success) {
        setRestaurantData(data.restaurant)
      }
    } catch (error) {
      console.error("Error fetching restaurant data:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?restaurantId=${session?.user?.restaurantId}&period=${selectedPeriod}`)
      const data = await response.json()
      if (data.success) {
        setMenuStats({
          menusSent: data.menusSent || 0,
          reviewRequests: data.reviewRequests || 0,
          reviewsCollected: data.reviewsCollected || 0,
          totalReviewsCollected: data.totalReviewsCollected || 0,
          weeklyGoalProgress: data.weeklyGoalProgress || 0,
          trends: data.trends || {
            menusSent: 0,
            reviewRequests: 0,
            reviewsCollected: 0
          }
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/activities?restaurantId=${session?.user?.restaurantId}&period=${selectedPeriod}`)
      const data = await response.json()
      if (data.success) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Good Morning")
    } else if (hour < 18) {
      setGreeting("Good Afternoon")
    } else {
      setGreeting("Good Evening")
    }
  }, [])

  // Aggiorna i dati quando cambia il periodo
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      fetchStats()
      fetchActivities()
    }
  }, [status, session, selectedPeriod])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1B9AAA]"></div>
      </div>
    )
  }

  if (!session || !restaurantData) {
    return null
  }

  const toggleActivityExpand = (id: string) => {
    setActivities(
      activities.map((activity) => 
        activity._id === id 
          ? { ...activity, expanded: !activity.expanded } 
          : activity
      )
    )
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
        {/* Header Section */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1B9AAA]">{restaurantData.name}</h1>
              <p className="text-lg text-gray-700">
                {greeting}, {restaurantData.name}! 🌞
              </p>
            </div>
            <div className="relative w-8 h-8">
              <Image
                src={getMascotImage() || "/placeholder.svg"}
                alt="Mascot"
                width={32}
                height={32}
                className="absolute -top-1 -right-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="bg-white rounded-full px-3 py-1 inline-flex items-center gap-1 shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Calendar className="w-4 h-4 text-[#EF476F]" />
              <span className="text-xs font-medium text-gray-700">
                {Math.ceil((Date.now() - new Date(restaurantData.createdAt).getTime()) / (1000 * 60 * 60 * 24))} giorni attivo
              </span>
            </motion.div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Ultimi 7 giorni</SelectItem>
                  <SelectItem value="1m">Ultimo mese</SelectItem>
                  <SelectItem value="1y">Ultimo anno</SelectItem>
                  <SelectItem value="all">Da sempre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                <h3 className="text-lg font-bold text-gray-800">Menu Inviati</h3>
                <p className="text-3xl font-extrabold text-[#1B9AAA]">{menuStats.menusSent}</p>
              </div>
              <div className="bg-[#1B9AAA]/10 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-[#1B9AAA]" />
              </div>
            </div>

            <div className="mb-2">
              <Progress
                value={75}
                className="h-2 bg-gray-100"
                indicatorClassName="bg-gradient-to-r from-[#1B9AAA] to-[#26C6D9] transition-all duration-700 ease-in-out"
              />
            </div>

            <div className="flex items-center text-sm">
              {menuStats.trends?.menusSent > 0 ? (
                <div className="text-green-600 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+{menuStats.trends.menusSent.toFixed(1)}% rispetto al periodo precedente</span>
                </div>
              ) : (
                <div className="text-red-600 flex items-center">
                  <ArrowDown className="w-4 h-4 mr-1" />
                  <span>{menuStats.trends?.menusSent.toFixed(1)}% rispetto al periodo precedente</span>
                </div>
              )}
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
                <h3 className="text-lg font-bold text-gray-800">Richieste Recensioni</h3>
                <p className="text-3xl font-extrabold text-[#EF476F]">{menuStats.reviewRequests}</p>
              </div>
              <div className="bg-[#EF476F]/10 p-3 rounded-full">
                <Megaphone className="w-6 h-6 text-[#EF476F]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={65}
                  text={`65%`}
                  styles={buildStyles({
                    textSize: "24px",
                    pathColor: "#EF476F",
                    textColor: "#EF476F",
                    trailColor: "#f5f5f5",
                  })}
                />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Tasso di conversione</p>
                {menuStats.trends?.reviewRequests > 0 ? (
                  <p className="text-sm font-medium text-green-600">↑ {menuStats.trends.reviewRequests.toFixed(1)}% dal periodo precedente</p>
                ) : (
                  <p className="text-sm font-medium text-red-600">↓ {Math.abs(menuStats.trends?.reviewRequests || 0).toFixed(1)}% dal periodo precedente</p>
                )}
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
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-800">Recensioni Raccolte</h3>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/restaurants/${session?.user?.restaurantId}/sync-reviews`, {
                          method: 'POST'
                        });
                        const data = await response.json();
                        if (data.success) {
                          toast({
                            title: "Sincronizzazione completata",
                            description: "Le recensioni sono state aggiornate con successo",
                          });
                          // Ricarica i dati
                          fetchRestaurantData();
                          fetchStats();
                        } else {
                          throw new Error(data.error);
                        }
                      } catch (error) {
                        toast({
                          title: "Errore",
                          description: "Impossibile sincronizzare le recensioni",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    title="Sincronizza recensioni da Google Places"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-extrabold text-[#06D6A0]">
                    {selectedPeriod === 'all' ? menuStats.totalReviewsCollected : menuStats.reviewsCollected}
                  </p>
                  {selectedPeriod !== 'all' && (
                    <p className="text-sm text-gray-500">
                      (totale: {menuStats.totalReviewsCollected})
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-[#06D6A0]/10 p-3 rounded-full">
                <Award className="w-6 h-6 text-[#06D6A0]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-[#FFE14D] fill-[#FFE14D]" />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{restaurantData.googleRating?.rating || 0} media</span>
              </div>

              {menuStats.trends?.reviewsCollected > 0 && (
                <div className="bg-[#F8FFE5] px-3 py-1 rounded-full text-xs font-bold text-[#06D6A0] flex items-center">
                  <Trophy className="w-3 h-3 mr-1" /> +{menuStats.trends.reviewsCollected.toFixed(1)}%
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
              {7 - new Date().getDay()} days left
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Get 10 new reviews this week</p>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">{menuStats.weeklyGoalProgress}/10 completed</span>
                <span className="ml-2 text-xs text-green-600">({10 - menuStats.weeklyGoalProgress} more to go!)</span>
              </div>
            </div>
            <div className="relative">
              <Image src={getExcitedMascotImage() || "/placeholder.svg"} alt="Excited Mascot" width={50} height={50} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-5xl font-extrabold text-[#EF476F]">{(menuStats.weeklyGoalProgress / 10) * 100}%</div>
            <div className="w-24 h-24">
              <CircularProgressbar
                value={(menuStats.weeklyGoalProgress / 10) * 100}
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
            {activities.map((activity: Activity) => (
              <motion.div
                key={activity._id}
                className={`bg-gray-50 rounded-xl p-3 cursor-pointer ${activity.expanded ? "bg-gray-100" : ""}`}
                onClick={() => toggleActivityExpand(activity._id)}
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
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>

                    {activity.expanded && (
                      <motion.div
                        className="mt-2 text-xs text-gray-600 bg-white p-2 rounded-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        {activity.details}
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
              onClick={() => {}}
            >
              <QrCode className="w-6 h-6 mb-1" />
              Generate QR
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-20 py-2 px-1 text-xs"
              onClick={() => router.push("/templates")}
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

