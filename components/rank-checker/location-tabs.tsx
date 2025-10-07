"use client"

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
  return (
    <div className="w-full">
      <p className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide text-center mb-3">
        Come ti vedono i clienti da:
      </p>
      
      {/* Tabs con scroll orizzontale su mobile */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
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
      
      {/* Scroll hint su mobile */}
      {tabs.length > 3 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          ← Scorri per vedere altri punti →
        </p>
      )}
    </div>
  )
}
