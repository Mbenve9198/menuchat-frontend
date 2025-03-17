"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface AchievementBadgeProps {
  icon: ReactNode
  text: string
  color: string
  small?: boolean
}

export default function AchievementBadge({ icon, text, color, small = false }: AchievementBadgeProps) {
  return (
    <motion.div
      className={`${color} text-white rounded-full flex items-center ${small ? "px-2 py-1" : "px-3 py-2"} shadow-md`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <span className={`${small ? "mr-1" : "mr-2"}`}>{icon}</span>
      <span className={`${small ? "text-xs" : "text-sm"} font-bold`}>{text}</span>
    </motion.div>
  )
}

