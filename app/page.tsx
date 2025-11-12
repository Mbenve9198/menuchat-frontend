"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import SetupWizard from "@/components/setup-wizard"
import BubbleBackground from "@/components/bubble-background"
import FloatingElements from "@/components/floating-elements"
import { CustomButton } from "@/components/ui/custom-button"

export default function Home() {
  const { toast } = useToast()
  const [showSetup, setShowSetup] = useState(false)

  const handleStartSetup = () => {
    setShowSetup(true)
    toast({
      title: "🎉 Benvenuto!",
      description: "Inizia la configurazione del tuo menu bot!",
      variant: "default",
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <BubbleBackground />

      {/* Landing Page */}
      <AnimatePresence mode="wait">
        {!showSetup ? (
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FloatingElements />

            {/* Pulsante Login - più discreto */}
            <motion.div
              className="absolute top-6 right-6 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link href="/auth/login">
                <CustomButton variant="outline" size="sm" className="flex items-center gap-1.5 text-sm">
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </CustomButton>
              </Link>
            </motion.div>

            {/* Logo MenuChat - HERO */}
            <motion.div
              className="w-full max-w-[280px] mx-auto mb-6"
              initial={{ y: -40, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                bounce: 0.5,
                duration: 1,
                delay: 0.1
              }}
            >
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <Image
                  src="https://ik.imagekit.io/menuchat/app/menuchat_logo_black.png?updatedAt=1762960725443"
                  alt="MenuChat Logo"
                  width={280}
                  height={87}
                  className="drop-shadow-2xl w-full h-auto"
                  priority
                />
                
                {/* Glow effect sotto il logo */}
                <div className="absolute inset-0 -z-10 blur-2xl opacity-30 bg-gradient-to-r from-[#EF476F] via-[#FFD166] to-[#06D6A0]" />
              </motion.div>
            </motion.div>

            <motion.div
              className="mb-8 relative w-48 h-48 mx-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -12, 0],
                x: [0, 8, -8, 0]
              }}
              transition={{ 
                scale: { type: "spring", bounce: 0.5, delay: 0.3 },
                opacity: { type: "spring", bounce: 0.5, delay: 0.3 },
                y: { 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                x: { 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              whileHover={{
                scale: 1.08,
                y: -15,
                transition: { duration: 0.3 }
              }}
            >
              {/* Stella volante */}
              <motion.div
                className="relative z-10"
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Image
                  src="/mascottes/mascotte_flying.png"
                  alt="Flying Star Mascot"
                  width={192}
                  height={192}
                  className="drop-shadow-2xl object-contain mx-auto"
                />
              </motion.div>
              
              {/* Particelle scintillanti più grandi */}
              <motion.div
                className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, 12, 24],
                  y: [0, -8, -16]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0
                }}
              />
              <motion.div
                className="absolute top-4 -left-2 w-3 h-3 bg-orange-400 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, -10, -20],
                  y: [0, 3, 6]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: 0.5
                }}
              />
              <motion.div
                className="absolute -top-4 right-4 w-2 h-2 bg-yellow-300 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, 15, 30],
                  y: [0, -5, -10]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1
                }}
              />
              <motion.div
                className="absolute bottom-8 -right-4 w-2.5 h-2.5 bg-pink-400 rounded-full"
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, 18, 36],
                  y: [0, -6, -12]
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: 0.8
                }}
              />
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl font-extrabold text-[#EF476F] mb-4 px-4 leading-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Menu → Reviews → Success! 🎉
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg text-gray-700 mb-10 max-w-md px-4 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Create a WhatsApp menu bot for your restaurant and boost your reviews in minutes!
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.6 }}
              className="px-4"
            >
              <CustomButton 
                size="lg" 
                className="px-10 py-7 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all" 
                onClick={handleStartSetup}
              >
                Get Started Now! <ChevronRight className="ml-2 w-5 h-5" />
              </CustomButton>
            </motion.div>
          </motion.div>
        ) : (
          <SetupWizard
            onComplete={() => {
              console.log("Setup completed callback called");
              setShowSetup(false);
              toast({
                title: "🎊 Configurazione completata!",
                description: "Il tuo menu bot è pronto!",
                variant: "default",
              });
            }}
            onCoinEarned={() => {
              // Rimuovo la logica dei coins - funzione legacy
            }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

