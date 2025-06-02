"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

// Lingue supportate con emoji delle bandiere
const SUPPORTED_LANGUAGES = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

// Mapping tra codici i18n e languagePreference del backend
const LANGUAGE_MAPPING: Record<string, string> = {
  "it": "italiano",
  "en": "english", 
  "es": "español"
}

interface UILanguageSelectorProps {
  className?: string
  variant?: "compact" | "full"
}

export default function UILanguageSelector({ 
  className, 
  variant = "compact" 
}: UILanguageSelectorProps) {
  const { i18n } = useTranslation()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  // Carica le preferenze utente al mount se l'utente è autenticato
  useEffect(() => {
    if (session?.user) {
      loadUserPreferences()
    }
  }, [session])

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.languagePreference) {
          // Trova il codice i18n corrispondente alla languagePreference
          const i18nCode = Object.keys(LANGUAGE_MAPPING).find(
            key => LANGUAGE_MAPPING[key] === data.data.languagePreference
          )
          if (i18nCode && i18nCode !== i18n.language) {
            i18n.changeLanguage(i18nCode)
          }
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento preferenze utente:', error)
    }
  }

  const saveLanguagePreference = async (languageCode: string) => {
    if (!session?.user) return

    try {
      setIsSaving(true)
      const languagePreference = LANGUAGE_MAPPING[languageCode]
      
      if (!languagePreference) {
        throw new Error(`Lingua non supportata: ${languageCode}`)
      }
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          languagePreference
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel salvataggio della lingua')
      }

      console.log(`✅ Lingua salvata nel database: ${languagePreference}`)
    } catch (error) {
      console.error('Errore nel salvataggio della lingua:', error)
      // Non mostriamo errori all'utente per non interrompere l'esperienza
    } finally {
      setIsSaving(false)
    }
  }

  const handleLanguageChange = async (languageCode: string) => {
    // Cambia immediatamente la lingua nell'interfaccia
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
    
    // Salva la preferenza nel database se l'utente è autenticato
    if (session?.user) {
      await saveLanguagePreference(languageCode)
    }
  }

  // Chiudi il dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-language-selector]')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

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
        disabled={isSaving}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors",
          isSaving && "opacity-50 cursor-not-allowed"
        )}
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