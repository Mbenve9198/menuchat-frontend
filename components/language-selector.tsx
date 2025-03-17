"use client"

import { useState } from "react"
import { Check, Plus, X, Globe } from "lucide-react"
import { CustomButton } from "./ui/custom-button"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"

// Common language codes with their English names and phone prefixes
export const LANGUAGES = [
  { code: "en", name: "English", phonePrefix: ["1", "44"] },
  { code: "it", name: "Italian", phonePrefix: ["39"] },
  { code: "es", name: "Spanish", phonePrefix: ["34", "52", "54", "56"] },
  { code: "fr", name: "French", phonePrefix: ["33", "262"] },
  { code: "de", name: "German", phonePrefix: ["49"] },
  { code: "pt", name: "Portuguese", phonePrefix: ["351", "55"] },
  { code: "nl", name: "Dutch", phonePrefix: ["31"] },
  { code: "zh", name: "Chinese", phonePrefix: ["86"] },
  { code: "ja", name: "Japanese", phonePrefix: ["81"] },
  { code: "ru", name: "Russian", phonePrefix: ["7"] },
  { code: "ar", name: "Arabic", phonePrefix: ["966", "971", "20"] },
]

export interface MenuLanguage {
  code: string
  name: string
  phonePrefix: string[]
  menuFile?: File | null
  menuUrl?: string
}

interface LanguageSelectorProps {
  selectedLanguages: MenuLanguage[]
  onLanguagesChange: (languages: MenuLanguage[]) => void
  className?: string
}

export default function LanguageSelector({
  selectedLanguages,
  onLanguagesChange,
  className,
}: LanguageSelectorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const availableLanguages = LANGUAGES.filter(
    lang => !selectedLanguages.some(selected => selected.code === lang.code)
  )

  const filteredLanguages = availableLanguages.filter(
    lang => lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddLanguage = (language: typeof LANGUAGES[0]) => {
    onLanguagesChange([
      ...selectedLanguages,
      { ...language, menuFile: null, menuUrl: "" }
    ])
    setIsAdding(false)
    setSearchTerm("")
  }

  const handleRemoveLanguage = (languageCode: string) => {
    onLanguagesChange(selectedLanguages.filter(lang => lang.code !== languageCode))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {selectedLanguages.map(language => (
          <div 
            key={language.code}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full"
          >
            <span className="text-sm font-medium">{language.name}</span>
            <button
              onClick={() => handleRemoveLanguage(language.code)}
              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
            >
              <X className="w-3 h-3 text-blue-700" />
            </button>
          </div>
        ))}

        {!isAdding && (
          <CustomButton
            variant="outline"
            size="sm"
            className="rounded-full gap-1"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Language
          </CustomButton>
        )}
      </div>

      {isAdding && (
        <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
          <div className="mb-2 flex items-center">
            <Globe className="text-blue-600 w-4 h-4 mr-2" />
            <span className="text-sm font-medium text-blue-700">Add a language</span>
            <button 
              onClick={() => setIsAdding(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <Input
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {filteredLanguages.length === 0 ? (
              <p className="text-sm text-gray-500 py-2 text-center">No languages found</p>
            ) : (
              filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  className="w-full text-left px-3 py-2 hover:bg-blue-100 rounded-md flex items-center justify-between"
                  onClick={() => handleAddLanguage(language)}
                >
                  <span className="text-sm">{language.name}</span>
                  <span className="text-xs text-gray-500">
                    {language.phonePrefix.map(prefix => `+${prefix}`).join(", ")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        <p>We'll detect the customer's language based on their phone number prefix and show them the appropriate menu.</p>
      </div>
    </div>
  )
} 