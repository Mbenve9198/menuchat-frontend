"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  onStepClick: (step: number) => void
}

export default function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex justify-between w-full">
      {steps.map((_, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isFuture = index > currentStep

        return (
          <motion.button
            key={index}
            className={`relative flex items-center justify-center w-6 h-6 rounded-full cursor-pointer border-2 
              ${isCompleted ? "bg-[#FFE14D] border-black" : isCurrent ? "bg-white border-black" : "bg-gray-200 border-gray-300"}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStepClick(index)}
          >
            {isCompleted ? (
              <Check className="w-3 h-3 text-black" />
            ) : (
              <span className={`text-xs font-bold ${isCurrent ? "text-black" : "text-gray-500"}`}>{index + 1}</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

