"use client"

import { useState } from "react"
import { FileUpload } from "./ui/file-upload"
import { Input } from "./ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Label } from "./ui/label"
import { Globe, File, Link, Loader2, Check, AlertCircle } from "lucide-react"
import { MenuLanguage } from "./language-selector"
import { useToast } from "@/hooks/use-toast"

interface MenuLanguageItemProps {
  language: MenuLanguage
  onLanguageChange: (updatedLanguage: MenuLanguage) => void
  className?: string
}

export default function MenuLanguageItem({
  language,
  onLanguageChange,
  className,
}: MenuLanguageItemProps) {
  const [activeTab, setActiveTab] = useState<"url" | "file">(
    language.menuUrl ? "url" : "file"
  )
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      // Se l'utente ha rimosso il file
      onLanguageChange({
        ...language,
        menuFile: null,
        menuPdfUrl: "",
        menuPdfName: ""
      })
      setUploadSuccess(false)
      setUploadError(null)
      return
    }

    // Se l'utente ha selezionato un nuovo file, lo carichiamo
    setActiveTab("file")
    setIsUploading(true)
    setUploadSuccess(false)
    setUploadError(null)

    try {
      // Creiamo un FormData per la richiesta
      const formData = new FormData()
      formData.append('file', file)
      formData.append('languageCode', language.code)
      
      // Aggiungiamo l'ID del menu se disponibile
      if (language.menuId) {
        formData.append('menuId', language.menuId)
      }
      
      // Inviamo la richiesta al nostro endpoint di upload
      const response = await fetch('/api/upload/menu-pdf', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore durante il caricamento del file')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Aggiorniamo i dati della lingua con l'URL del PDF caricato
        onLanguageChange({
          ...language,
          menuFile: file,
          menuPdfUrl: data.file.url,
          menuPdfName: data.file.originalName,
          // Salviamo anche l'ID pubblico di Cloudinary per future operazioni
          cloudinaryPublicId: data.file.publicId
        })
        setUploadSuccess(true)
        
        toast({
          title: "Upload completato",
          description: `Il menu in ${language.name} è stato caricato con successo.`,
          variant: "default",
        })
      } else {
        throw new Error(data.error || 'Errore durante il caricamento del file')
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      setUploadError(error.message)
      
      toast({
        title: "Errore di caricamento",
        description: error.message || "Si è verificato un errore durante il caricamento del file.",
        variant: "destructive",
      })
      
      // Manteniamo il riferimento al file locale ma non aggiorniamo menuPdfUrl
      onLanguageChange({
        ...language,
        menuFile: file
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    onLanguageChange({
      ...language,
      menuUrl: url
    })
    if (url) setActiveTab("url")
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-800">{language.name} Menu</h3>
        <div className="text-xs text-gray-500 ml-auto">
          {language.phonePrefix.map(prefix => `+${prefix}`).join(", ")}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "url" | "file")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="url" className="flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5" />
            Menu URL
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-1.5">
            <File className="w-3.5 h-3.5" />
            Upload PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-3 mt-2">
          <Label htmlFor={`menu-url-${language.code}`} className="text-gray-700 text-sm">
            Menu URL for {language.name}
          </Label>
          <Input
            id={`menu-url-${language.code}`}
            placeholder={`https://your-restaurant.com/${language.code}/menu`}
            value={language.menuUrl || ""}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400"
          />
        </TabsContent>

        <TabsContent value="file" className="space-y-3 mt-2">
          <Label className="text-gray-700 text-sm block mb-2">
            Upload PDF Menu ({language.name})
          </Label>
          
          <FileUpload
            selectedFile={language.menuFile || null}
            onFileSelect={handleFileChange}
            accept=".pdf"
            maxSize={5}
          />
          
          {isUploading && (
            <div className="flex items-center mt-2 text-blue-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-xs">Caricamento in corso...</span>
            </div>
          )}
          
          {uploadSuccess && (
            <div className="flex items-center mt-2 text-green-600">
              <Check className="w-4 h-4 mr-2" />
              <span className="text-xs">File caricato con successo</span>
            </div>
          )}
          
          {uploadError && (
            <div className="flex items-center mt-2 text-red-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-xs">{uploadError}</span>
            </div>
          )}
          
          {language.menuPdfUrl && !isUploading && !uploadError && (
            <div className="mt-2 text-xs text-blue-600 underline">
              <a href={language.menuPdfUrl} target="_blank" rel="noopener noreferrer">
                Visualizza PDF caricato
              </a>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 