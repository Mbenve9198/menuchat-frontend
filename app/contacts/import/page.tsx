"use client"

import { useState } from "react"
import { ChevronLeft, Upload, Users, FileText, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { CustomButton } from "@/components/ui/custom-button"
import { useTranslation } from "react-i18next"
import BubbleBackground from "@/components/bubble-background"
import UILanguageSelector from "@/components/ui-language-selector"

export default function ImportContactsPage() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <BubbleBackground />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-8">
        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <CustomButton
              variant="ghost"
              className="p-2 hover:bg-white/50 rounded-full"
              onClick={() => router.push("/contacts")}
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </CustomButton>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Upload className="w-6 h-6 text-[#1B9AAA]" />
              Importa Contatti
            </h1>
            <UILanguageSelector variant="compact" />
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Funzionalità in Arrivo</h2>
              <p className="text-gray-600">
                La funzionalità di importazione contatti sarà disponibile presto. Potrai caricare file CSV, Excel o sincronizzare con altre piattaforme.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <h3 className="font-bold text-blue-800 mb-2">📋 Funzionalità Previste:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Import da file CSV/Excel</li>
                  <li>• Sincronizzazione con Google Contacts</li>
                  <li>• Import da POS/CRM esistenti</li>
                  <li>• Validazione automatica numeri</li>
                  <li>• Gestione duplicati intelligente</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 text-left">
                <h3 className="font-bold text-yellow-800 mb-2">⚡ Al Momento:</h3>
                <p className="text-sm text-yellow-700">
                  I contatti vengono aggiunti automaticamente quando i clienti interagiscono 
                  con il tuo bot WhatsApp o si iscrivono tramite i link di opt-in.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#1B9AAA]" />
              Azioni Rapide
            </h3>
            
            <div className="space-y-3">
              <CustomButton
                className="w-full py-3 flex items-center justify-center"
                onClick={() => router.push("/contacts")}
                variant="outline"
              >
                <Users className="w-5 h-5 mr-2" />
                Visualizza Rubrica
              </CustomButton>
              
              <CustomButton
                className="w-full py-3 flex items-center justify-center"
                onClick={() => router.push("/campaign/create")}
              >
                <FileText className="w-5 h-5 mr-2" />
                Crea Nuova Campagna
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 