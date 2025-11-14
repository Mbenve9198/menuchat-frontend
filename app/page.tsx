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
import LiveResultsFeed from "@/components/live-results-feed"
import VideoTestimonials from "@/components/video-testimonials"

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
              className="text-base sm:text-xl text-gray-600 mb-8 max-w-2xl px-4 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Crea il tuo menu bot WhatsApp in pochi minuti e trasforma ogni cliente in una recensione a 5 stelle.
            </motion.p>

            {/* CTA Hero */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-20"
            >
              <CustomButton 
                size="lg" 
                className="py-4 px-8 text-base font-bold shadow-xl hover:shadow-2xl transition-all font-cooper" 
                onClick={handleStartSetup}
              >
                Prova Gratis <ChevronRight className="ml-2 w-4 h-4" />
              </CustomButton>
            </motion.div>

            {/* Sezione 2 - Problema */}
            <motion.div
              className="w-full max-w-5xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-6">
                il tuo ristorante è un secchio bucato
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
                Il 90% dei tuoi clienti mangia una volta e scompare per sempre. Paghi per acquisirli e poi li lasci uscire dalla porta senza avere un modo per ricontattarli
              </p>
              
              {/* Immagine secchio bucato */}
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.75, type: "spring", damping: 15 }}
              >
                <Image
                  src="https://ik.imagekit.io/menuchat/app/secchio.png?updatedAt=1763049360929"
                  alt="Secchio bucato"
                  width={400}
                  height={400}
                  className="w-auto h-64 object-contain"
                />
              </motion.div>
            </motion.div>

            {/* Sezione 3 - Soluzione */}
            <motion.div
              className="w-full max-w-5xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-6">
                non sperare. inizia ad automatizzare
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
                MenuChat non è un altro menu digitale. È una macchina da marketing automatico travestita da menu. Il tuo cliente scannerizza il QR per vedere il menù e il sistema cattura automaticamente il contatto WhatsApp. Tutto GDPR compliant.
              </p>

              {/* Immagine calamita */}
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.85, type: "spring", damping: 15 }}
              >
                <Image
                  src="https://ik.imagekit.io/menuchat/app/calamita.png?updatedAt=1763053089771"
                  alt="Calamita - Attrai clienti"
                  width={400}
                  height={400}
                  className="w-auto h-64 object-contain"
                />
              </motion.div>
            </motion.div>

            {/* Sezione 4 - Recensioni */}
            <motion.div
              className="w-full max-w-5xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-6">
                raccogli più di 100 recensioni vere al mese
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
                Il nostro sistema invia automaticamente una richiesta di recensione a 5 stelle via WhatsApp a ogni cliente. Non devi alzare un dito. Guarda il tuo profilo Google schiacciare la concorrenza e diventare la scelta ovvia nella tua zona.
              </p>

              {/* Video funzionamento */}
              <motion.div
                className="w-full max-w-2xl mx-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9, type: "spring", damping: 20 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    className="w-full h-auto"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  >
                    <source src="https://ik.imagekit.io/menuchat/app/funzionamento_menuchat.mp4?updatedAt=1763050860986" type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                  </video>
                </div>
              </motion.div>
            </motion.div>

            {/* Sezione 5 - Lista d'Oro */}
            <motion.div
              className="w-full max-w-5xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.95 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-6">
                riempi il tuo ristorante quando vuoi
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-6">
                Ogni cliente che scannerizza il QR menu entra automaticamente nel tuo database WhatsApp. Hai un martedì sera vuoto? Invii una campagna WhatsApp. Risultato: tavoli pieni a costo zero.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10 font-semibold">
                Hai smesso di perdere clienti. Hai iniziato a clonarli. 📲
              </p>

              {/* Video campagne */}
              <motion.div
                className="w-full max-w-2xl mx-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: "spring", damping: 20 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    className="w-full h-auto"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  >
                    <source src="https://ik.imagekit.io/menuchat/app/campagne.mp4?updatedAt=1763051483456" type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                  </video>
                </div>
              </motion.div>
            </motion.div>

            {/* Sezione 6 - Menu AI */}
            <motion.div
              className="w-full max-w-5xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.05 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-6">
                menu potenziato dall'IA
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
                Basta PDF brutti. Creiamo un menu digitale stupendo. La nostra IA scrive descrizioni appetitose, trasforma le foto dei tuoi piatti in professionali. In tutte le lingue.
              </p>

              {/* Esempio menu Mr. Jerry */}
              <motion.div
                className="w-full max-w-2xl mx-auto"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.1, type: "spring", damping: 20 }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 shadow-2xl">
                  <div className="mb-3 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      Esempio reale: <span className="text-gray-900 font-bold">Mr. Jerry Ristopub</span>
                    </p>
                  </div>
                  
                  {/* Desktop: iframe */}
                  <div className="hidden md:block relative bg-white rounded-xl overflow-hidden shadow-lg" style={{ height: '600px' }}>
                    <iframe
                      src="https://menuchat-frontend.vercel.app/menu/685d65aad76c058a91158eee"
                      className="w-full h-full border-0"
                      title="Menu Mr. Jerry Ristopub"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Mobile: solo link diretto */}
                  <div className="md:hidden text-center py-8">
                    <a
                      href="https://menuchat-frontend.vercel.app/menu/685d65aad76c058a91158eee"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <CustomButton 
                        size="lg" 
                        className="w-full py-4 text-base font-bold shadow-xl hover:shadow-2xl transition-all font-cooper"
                      >
                        Vedi Menu di Esempio 🍽️ <ChevronRight className="ml-2 w-4 h-4" />
                      </CustomButton>
                    </a>
                  </div>
                  
                  {/* Link sotto per desktop */}
                  <div className="mt-3 text-center hidden md:block">
                    <a
                      href="https://menuchat-frontend.vercel.app/menu/685d65aad76c058a91158eee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1B9AAA] hover:text-[#EF476F] font-medium transition-colors"
                    >
                      Apri il menu completo →
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Sezione 7 - Live Results Feed */}
            <motion.div
              className="w-full max-w-6xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.15 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-4 text-center">
                i risultati parlano chiaro
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10 text-center">
                Questi sono ristoranti veri che stanno usando MenuChat in questo momento. Dati aggiornati in tempo reale.
              </p>

              <LiveResultsFeed 
                period="7days"
                autoRefresh={true}
                refreshInterval={30000}
                maxResults={5}
              />
            </motion.div>

            {/* Sezione 8 - Video Testimonianze */}
            <motion.div
              className="w-full max-w-6xl px-4 mb-20"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight font-cooper lowercase mb-4 text-center">
                i numeri non mentono
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-12 text-center">
                Ristoranti reali. Risultati reali. Dati aggiornati in tempo reale.
              </p>

              <VideoTestimonials />
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

