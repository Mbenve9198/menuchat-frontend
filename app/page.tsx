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
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FloatingElements />

            {/* Logo MenuChat */}
            <motion.div
              className="absolute top-6 left-1/2 -translate-x-1/2"
              initial={{ y: -30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                bounce: 0.4,
                duration: 0.8
              }}
            >
              <motion.div
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="https://ik.imagekit.io/menuchat/app/menuchat_logo_black.png?updatedAt=1762960725443"
                  alt="MenuChat Logo"
                  width={160}
                  height={50}
                  className="drop-shadow-lg"
                  priority
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute top-4 right-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/auth/login">
                <CustomButton variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </CustomButton>
              </Link>
            </motion.div>

            <motion.div
              className="mb-8 relative w-40 h-40 mx-auto mt-20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -12, 0],
                x: [0, 8, -8, 0]
              }}
              transition={{ 
                scale: { type: "spring", bounce: 0.5 },
                opacity: { type: "spring", bounce: 0.5 },
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
                scale: 1.1,
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
                  width={160}
                  height={160}
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

