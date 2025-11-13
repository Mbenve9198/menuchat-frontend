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

      {/* Barra fissa in alto con logo centrale */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center px-6 py-3 max-w-6xl mx-auto">
          <Image
            src="https://ik.imagekit.io/menuchat/app/menuchat_logo_black.png?updatedAt=1763047420171"
            alt="MenuChat Logo"
            width={540}
            height={162}
            className="w-auto h-10"
            priority
          />
        </div>
      </motion.div>

      {/* Landing Page */}
      <AnimatePresence mode="wait">
        {!showSetup ? (
          <motion.div
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-32 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FloatingElements />

            {/* Stellina volante */}
            <motion.div
              className="mb-10 relative w-48 h-48 mx-auto"
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
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 px-4 leading-tight max-w-4xl font-cooper"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              L'unico menu digitale al mondo che ti permette di raccogliere 100 recensioni al mese.
            </motion.h1>

            <motion.p
              className="text-base sm:text-xl text-gray-600 mb-20 max-w-2xl px-4 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Crea il tuo menu bot WhatsApp in pochi minuti e trasforma ogni cliente in una recensione a 5 stelle.
            </motion.p>

            {/* Sezione 2 - Problema */}
            <motion.div
              className="w-full max-w-5xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-6">
                il tuo ristorante è un secchio bucato
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                Il 90% dei tuoi clienti mangia una volta e scompare per sempre. Paghi per acquisirli e poi li lasci uscire dalla porta senza avere un modo per ricontattarli
              </p>
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

      {/* Pulsanti fissi in basso - solo quando non è aperto il setup wizard */}
      {!showSetup && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-2xl"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", damping: 20 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-3">
            <div className="flex gap-3 items-center">
              <CustomButton 
                size="lg" 
                className="flex-1 py-4 text-base font-bold shadow-xl hover:shadow-2xl transition-all font-cooper" 
                onClick={handleStartSetup}
              >
                Prova Gratis <ChevronRight className="ml-2 w-4 h-4" />
              </CustomButton>
              
              <Link href="/auth/login" className="flex-shrink-0">
                <CustomButton 
                  variant="outline" 
                  size="lg"
                  className="bg-white text-gray-700 border-gray-300 py-4 px-5 text-sm font-medium hover:bg-gray-50 transition-all font-cooper"
                >
                  <LogIn className="w-3.5 h-3.5 mr-2" />
                  Login
                </CustomButton>
              </Link>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Nessuna carta di credito richiesta • Setup in 3 minuti
            </p>
          </div>
        </motion.div>
      )}
    </main>
  )
}

