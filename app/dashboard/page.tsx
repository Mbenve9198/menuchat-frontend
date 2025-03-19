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
  Megaphone,
} from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { CustomButton } from "@/components/ui/custom-button"
import BubbleBackground from "@/components/bubble-background"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good day")
  const [restaurantName, setRestaurantName] = useState("Pizza Palace")
  const [daysActive, setDaysActive] = useState(14)
  const [restaurantLevel, setRestaurantLevel] = useState(3)
  const [menusSent, setMenusSent] = useState(128)
  const [reviewRequests, setReviewRequests] = useState(75)
  const [reviewsCollected, setReviewsCollected] = useState(42)
  const [weeklyGoalProgress, setWeeklyGoalProgress] = useState(60)
  const [isNewRecord, setIsNewRecord] = useState(true)
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "menu_view",
      emoji: "📋",
      message: "Menu viewed by customer",
      time: "10 minutes ago",
      expanded: false,
    },
    {
      id: 2,
      type: "review_request",
      emoji: "⭐",
      message: "Review request sent",
      time: "1 hour ago",
      expanded: false,
    },
    {
      id: 3,
      type: "new_review",
      emoji: "🏆",
      message: "New 5-star review received!",
      time: "3 hours ago",
      expanded: false,
    },
    {
      id: 4,
      type: "menu_update",
      emoji: "✏️",
      message: "Menu updated",
      time: "Yesterday",
      expanded: false,
    },
    {
      id: 5,
      type: "menu_view",
      emoji: "📋",
      message: "Menu viewed by customer",
      time: "Yesterday",
      expanded: false,
    },
  ])

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
              <span className="text-sm font-bold text-[#EF476F]">Level {restaurantLevel}</span>
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
                <p className="text-sm text-gray-600">Conversion rate</p>
                <p className="text-sm font-medium text-green-600">↑ 5% from last week</p>
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
            <div className="bg-[#FFE14D]/20 px-3 py-1 rounded-full text-xs font-bold text-gray-700">5 days left</div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Get 10 new reviews this week</p>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">6/10 completed</span>
                <span className="ml-2 text-xs text-green-600">(4 more to go!)</span>
              </div>
            </div>
            <div className="relative">
              <Image src={getExcitedMascotImage() || "/placeholder.svg"} alt="Excited Mascot" width={50} height={50} />
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
              onClick={() => {}}
            >
              <QrCode className="w-6 h-6 mb-1" />
              Generate QR
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

