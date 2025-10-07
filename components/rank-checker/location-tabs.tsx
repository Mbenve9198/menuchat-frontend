"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface LocationTab {
  id: string
  name: string
  icon: string
  rank: number | string
}

interface LocationTabsProps {
  tabs: LocationTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function LocationTabs({ tabs, activeTab, onTabChange }: LocationTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || tabs.length <= 2) return // Non animare se ci sono pochi tabs

    let scrollDirection = 1 // 1 = destra, -1 = sinistra
    let animationFrame: number
    let scrollSpeed = 0.5 // Velocità lenta e smooth

    const autoScroll = () => {
      if (!container) return

      // Auto-scroll lento
      container.scrollLeft += scrollSpeed * scrollDirection

      // Inverti direzione ai limiti
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 5) {
        scrollDirection = -1
      } else if (container.scrollLeft <= 5) {
        scrollDirection = 1
      }

      animationFrame = requestAnimationFrame(autoScroll)
    }

    // Avvia l'animazione dopo un breve delay
    const startTimeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(autoScroll)
    }, 1000)

    // Pausa l'animazione quando l'utente interagisce
    const handleTouchStart = () => {
      cancelAnimationFrame(animationFrame)
    }

    const handleTouchEnd = () => {
      // Riprendi l'animazione dopo 2 secondi di inattività
      setTimeout(() => {
        animationFrame = requestAnimationFrame(autoScroll)
      }, 2000)
    }

    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('mousedown', handleTouchStart)
    container.addEventListener('mouseup', handleTouchEnd)

    return () => {
      clearTimeout(startTimeout)
      cancelAnimationFrame(animationFrame)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleTouchStart)
      container.removeEventListener('mouseup', handleTouchEnd)
    }
  }, [tabs.length])

  return (
    <div className="w-full">
      <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide text-center mb-3">
        Come ti vedono i clienti da:
      </p>
      
      {/* Tabs con scroll orizzontale animato */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="flex gap-2 min-w-min">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const rankNum = typeof tab.rank === 'number' ? tab.rank : 21
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex-shrink-0 px-4 py-3 rounded-2xl font-bold text-sm
                  transition-all duration-300 border-2
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] text-white border-[#1B9AAA] shadow-lg scale-105' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#1B9AAA]/30 hover:shadow-md'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-1 min-w-[80px]">
                  <div className="text-2xl">{tab.icon}</div>
                  <div className="text-xs font-medium truncate max-w-full">
                    {tab.name}
                  </div>
                  <div className={`
                    text-xs font-black px-2 py-0.5 rounded-full
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : rankNum <= 3
                      ? 'bg-green-100 text-green-700'
                      : rankNum <= 7
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                    }
                  `}>
                    {typeof tab.rank === 'number' ? `#${tab.rank}` : tab.rank}
                  </div>
                </div>
                
                {/* Indicatore attivo */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#1B9AAA] to-[#06D6A0] rounded-2xl -z-10"
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Scroll hint su mobile con animazione */}
      {tabs.length > 3 && (
        <motion.p 
          className="text-xs text-gray-400 text-center mt-2"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            x: [-2, 2, -2]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ← Scorri per vedere altri punti →
        </motion.p>
      )}
    </div>
  )
}
