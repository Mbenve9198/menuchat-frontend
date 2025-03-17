"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import SetupWizard from "@/components/setup-wizard"
import BubbleBackground from "@/components/bubble-background"
import FloatingElements from "@/components/floating-elements"
import { CustomButton } from "@/components/ui/custom-button"

export default function Home() {
  const { toast } = useToast()
  const [showSetup, setShowSetup] = useState(false)
  const [coins, setCoins] = useState(0)

  const handleStartSetup = () => {
    setShowSetup(true)
    // Award initial coins
    setCoins((prev) => prev + 50)
    toast({
      title: "🎉 +50 coins awarded!",
      description: "You've started your journey to menu success!",
      variant: "default",
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <BubbleBackground />

      {/* Landing Page */}
      <AnimatePresence mode="wait">
        {!showSetup ? (
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FloatingElements />

            <motion.div
              className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-purple-800">{coins} coins</span>
            </motion.div>

            <motion.div
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2818%29-XJ4yBbZlQkA3wHSnpTVZPryQut5K4p.png"
                alt="Star Mascot"
                width={150}
                height={150}
                className="mx-auto bounce-animation"
              />
            </motion.div>

            <motion.h1
              className="text-4xl font-extrabold text-[#EF476F] mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Menu → Reviews → Success! 🎉
            </motion.h1>

            <motion.p
              className="text-lg text-gray-700 mb-8 max-w-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Create a WhatsApp menu bot for your restaurant and boost your reviews in minutes!
            </motion.p>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <CustomButton size="lg" className="px-8 py-6 text-lg" onClick={handleStartSetup}>
                Get Started Now! <ChevronRight className="ml-2" />
              </CustomButton>
            </motion.div>
          </motion.div>
        ) : (
          <SetupWizard
            onComplete={() => {
              setShowSetup(false)
              setCoins((prev) => prev + 200)
              toast({
                title: "🎊 Achievement Unlocked!",
                description: "Setup Complete: +200 coins awarded!",
                variant: "default",
              })
            }}
            onCoinEarned={(amount) => {
              setCoins((prev) => prev + amount)
              toast({
                title: `🌟 +${amount} coins awarded!`,
                description: "Keep going to earn more rewards!",
                variant: "default",
              })
            }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

