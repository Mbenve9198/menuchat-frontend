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
  restaurantName?: string
}

export default function MenuLanguageItem({
  language,
  onLanguageChange,
  className,
  restaurantName = ""
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
      
      // Inviamo anche il nome del ristorante per generare un nome file significativo
      if (restaurantName) {
        formData.append('restaurantName', restaurantName)
      }
      
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
          menuPdfFallbackUrl: data.file.fallbackUrl,
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

  // Funzione per eliminare un file PDF caricato
  const handleDeletePdf = async () => {
    if (!language.cloudinaryPublicId) return;
    
    try {
      setIsUploading(true);
      
      const response = await fetch(`/api/upload/menu-pdf/${language.cloudinaryPublicId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante l\'eliminazione del file');
      }
      
      // Aggiorniamo i dati della lingua rimuovendo i riferimenti al PDF
      onLanguageChange({
        ...language,
        menuPdfUrl: "",
        menuPdfName: "",
        cloudinaryPublicId: ""
      });
      
      toast({
        title: "File eliminato",
        description: `Il PDF del menu in ${language.name} è stato eliminato.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error deleting PDF:', error);
      toast({
        title: "Errore di eliminazione",
        description: error.message || "Si è verificato un errore durante l'eliminazione del file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
            <div className="mt-2 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <a 
                  href={language.menuPdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                  onClick={(e) => {
                    // Verifichiamo se l'URL è accessibile
                    fetch(language.menuPdfUrl!, { method: 'HEAD' })
                      .then(response => {
                        if (!response.ok) {
                          e.preventDefault();
                          // Se c'è un errore, mostriamo un toast e proviamo l'URL alternativo
                          toast({
                            title: "Errore di accesso",
                            description: "Utilizzo URL alternativo per visualizzare il PDF",
                            variant: "default",
                          });
                          
                          if (language.menuPdfFallbackUrl) {
                            window.open(language.menuPdfFallbackUrl, '_blank');
                          }
                        }
                      })
                      .catch(() => {
                        e.preventDefault();
                        // Fallback per errori CORS: utilizziamo l'URL alternativo
                        if (language.menuPdfFallbackUrl) {
                          window.open(language.menuPdfFallbackUrl, '_blank');
                        } else {
                          window.open(language.menuPdfUrl, '_blank');
                        }
                      });
                  }}
                >
                  Visualizza PDF
                </a>
                <a 
                  href={language.menuPdfFallbackUrl || language.menuPdfUrl}
                  download={language.menuPdfName}
                  className="text-green-600 underline"
                >
                  Scarica
                </a>
                <button 
                  className="text-red-500 hover:text-red-700 text-xs" 
                  onClick={handleDeletePdf}
                >
                  Elimina
                </button>
              </div>
              <div className="text-gray-500 text-xs italic">
                {language.menuPdfName}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 