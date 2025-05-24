"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Lingue supportate con emoji delle bandiere
const SUPPORTED_LANGUAGES = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

interface UILanguageSelectorProps {
  className?: string
  variant?: "compact" | "full"
}

export default function UILanguageSelector({ 
  className, 
  variant = "compact" 
}: UILanguageSelectorProps) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState(
    SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-language-selector]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const newLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language)
    if (newLanguage) {
      setCurrentLanguage(newLanguage)
    }
  }, [i18n.language])

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
  }

  if (variant === "compact") {
    return (
      <div 
        className={cn("relative", className)}
        data-language-selector
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Seleziona lingua"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <ChevronDown className={cn(
            "w-3 h-3 text-gray-600 transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                  currentLanguage.code === language.code && "bg-blue-50 text-blue-700"
                )}
              >
                <span className="text-base">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={cn("relative", className)}
      data-language-selector
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700">{currentLanguage.name}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-500 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-full">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                currentLanguage.code === language.code && "bg-blue-50 text-blue-700"
              )}
            >
              <span className="text-base">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 