"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Trophy, Star, Flame, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTranslation } from "react-i18next"
import BubbleBackground from "@/components/bubble-background"
import UILanguageSelector from "@/components/ui-language-selector"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'reviews' | 'streak' | 'level' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
  unlocked: boolean
}

export default function AchievementsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { t } = useTranslation()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [level, setLevel] = useState(1)
  const [levelInfo, setLevelInfo] = useState<any>(null)
  const [weeklyStreak, setWeeklyStreak] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.restaurantId) {
      fetchAchievements()
    }
  }, [session])

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/stats?restaurantId=${session?.user?.restaurantId}`)
      const data = await response.json()
      
      if (data.success) {
        setLevel(data.level || 1)
        setLevelInfo(data.levelInfo || null)
        setWeeklyStreak(data.weeklyStreak || 0)
        setTotalReviews(data.totalReviewsCollected || 0)
        
        // Crea lista completa di achievement (sbloccati e non)
        const allAchievements = generateAllAchievements(data)
        setAchievements(allAchievements)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAllAchievements = (data: any) => {
    const unlockedAchievements = data.achievements || []
    const allAchievements: Achievement[] = []

    // Achievement per recensioni
    const reviewMilestones = [5, 10, 25, 50, 100, 250, 500]
    reviewMilestones.forEach(milestone => {
      const unlocked = data.totalReviewsCollected >= milestone
      const existing = unlockedAchievements.find((a: any) => a.id === `reviews_${milestone}`)
      
      allAchievements.push({
        id: `reviews_${milestone}`,
        name: `${milestone} Recensioni`,
        description: `Raccogli ${milestone} recensioni`,
        icon: '⭐',
        category: 'reviews',
        rarity: milestone >= 100 ? 'legendary' : milestone >= 50 ? 'epic' : milestone >= 25 ? 'rare' : 'common',
        unlocked,
        unlockedAt: existing?.unlockedAt
      })
    })

    // Achievement per streak
    const streakMilestones = [3, 5, 10, 20]
    streakMilestones.forEach(milestone => {
      const unlocked = data.weeklyStreak >= milestone
      const existing = unlockedAchievements.find((a: any) => a.id === `streak_${milestone}`)
      
      allAchievements.push({
        id: `streak_${milestone}`,
        name: milestone === 3 ? 'Costanza' : milestone === 5 ? 'Determinazione' : milestone === 10 ? 'Inarrestabile' : 'Leggenda',
        description: `${milestone} settimane consecutive di obiettivi raggiunti`,
        icon: '🔥',
        category: 'streak',
        rarity: milestone >= 20 ? 'legendary' : milestone >= 10 ? 'epic' : 'rare',
        unlocked,
        unlockedAt: existing?.unlockedAt
      })
    })

    // Achievement per livelli
    const levelMilestones = [5, 10, 20, 50]
    levelMilestones.forEach(milestone => {
      const unlocked = data.level >= milestone
      const existing = unlockedAchievements.find((a: any) => a.id === `level_${milestone}`)
      
      allAchievements.push({
        id: `level_${milestone}`,
        name: milestone === 5 ? 'Esperto' : milestone === 10 ? 'Veterano' : milestone === 20 ? 'Maestro' : 'Grandmaster',
        description: `Raggiungi il livello ${milestone}`,
        icon: '🏆',
        category: 'level',
        rarity: milestone >= 50 ? 'legendary' : milestone >= 20 ? 'epic' : 'rare',
        unlocked,
        unlockedAt: existing?.unlockedAt
      })
    })

    // Achievement speciali
    const specialAchievements = [
      {
        id: 'perfect_week',
        name: 'Settimana Perfetta',
        description: 'Completa un obiettivo settimanale al 100%',
        icon: '💎',
        category: 'special' as const,
        rarity: 'rare' as const,
        unlocked: unlockedAchievements.some((a: any) => a.id === 'perfect_week')
      }
    ]

    allAchievements.push(...specialAchievements)

    return allAchievements.sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1
      if (!a.unlocked && b.unlocked) return 1
      return 0
    })
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-orange-500'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reviews': return <Star className="w-4 h-4" />
      case 'streak': return <Flame className="w-4 h-4" />
      case 'level': return <Trophy className="w-4 h-4" />
      case 'special': return <Target className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <main className="relative min-h-screen bg-gradient-to-b from-mint-100 to-mint-200">
        <BubbleBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EF476F] mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento achievement...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />
      
      <div className="relative z-10 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-extrabold text-[#1B9AAA]">Achievement</h1>
          </div>
          <UILanguageSelector variant="compact" />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-[#EF476F]">{level}</div>
            <div className="text-xs text-gray-600">{levelInfo?.level || "Newbie"}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-orange-500">{weeklyStreak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-green-500">{achievements.filter(a => a.unlocked).length}</div>
            <div className="text-sm text-gray-600">Sbloccati</div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={`relative rounded-2xl p-4 shadow-lg ${
                achievement.unlocked 
                  ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white` 
                  : 'bg-gray-100 text-gray-400'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02 }}
            >
              {/* Category Badge */}
              <div className={`absolute top-2 right-2 p-1 rounded-full ${
                achievement.unlocked ? 'bg-white/20' : 'bg-gray-300'
              }`}>
                {getCategoryIcon(achievement.category)}
              </div>

              {/* Achievement Content */}
              <div className="flex items-start gap-3">
                <div className={`text-3xl ${!achievement.unlocked ? 'grayscale' : ''}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-gray-600'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm ${achievement.unlocked ? 'text-white/90' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-white/70 mt-1">
                      Sbloccato il {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Rarity Indicator */}
              {achievement.unlocked && (
                <div className="absolute bottom-2 right-2">
                  <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                    {achievement.rarity.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Lock Overlay */}
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 rounded-2xl">
                  <div className="text-4xl">🔒</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
} 