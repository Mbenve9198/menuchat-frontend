"use client"

import React, { useState, useRef, ChangeEvent } from "react"
import { cn } from "@/lib/utils"
import { Upload, Image as ImageIcon, Video, FileText, X, Loader2 } from "lucide-react"
import { CustomButton } from "./custom-button"

interface MediaUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelect: (fileUrl: string, fileType: "image" | "video" | "pdf") => void
  selectedFile: string | null
  mediaType?: "image" | "video" | "pdf" | "both" | "all"
  maxSize?: number // in MB
  campaignType?: string
  label?: string
  className?: string
}

export function MediaUpload({
  onFileSelect,
  selectedFile,
  mediaType = "all",
  maxSize = 10, // Default 10MB
  campaignType = "",
  label = "Aggiungi media",
  className,
  ...props
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingProgress, setUploadingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptString = () => {
    if (mediaType === "image") return "image/*";
    if (mediaType === "video") return "video/*";
    if (mediaType === "pdf") return "application/pdf";
    if (mediaType === "both") return "image/*,video/*";
    return "image/*,video/*,application/pdf";
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    
    if (!files || files.length === 0) {
      return
    }

    const file = files[0]
    await validateAndUploadFile(file)
  }

  const validateAndUploadFile = async (file: File) => {
    setError(null)
    
    // Check file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    const isPdf = file.type === 'application/pdf'
    
    if (mediaType === "image" && !isImage) {
      setError(`Per favore carica solo immagini.`)
      return
    }
    
    if (mediaType === "video" && !isVideo) {
      setError(`Per favore carica solo video.`)
      return
    }
    
    if (mediaType === "pdf" && !isPdf) {
      setError(`Per favore carica solo documenti PDF.`)
      return
    }
    
    if (mediaType === "both" && !isImage && !isVideo) {
      setError(`Per favore carica un'immagine o un video.`)
      return
    }
    
    if (mediaType === "all" && !isImage && !isVideo && !isPdf) {
      setError(`Per favore carica un'immagine, un video o un documento PDF.`)
      return
    }
    
    // Check file size - video può essere più grande
    let actualMaxSize = maxSize
    if (isVideo) {
      actualMaxSize = 30 // 30MB per video
    } else if (isPdf) {
      actualMaxSize = 15 // 15MB per PDF
    }
    
    if (file.size > actualMaxSize * 1024 * 1024) {
      setError(`File troppo grande. La dimensione massima è ${actualMaxSize}MB.`)
      return
    }

    // Upload file to server
    try {
      setIsUploading(true)
      setUploadingProgress(0)
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadingProgress(prev => {
          const newProgress = prev + Math.random() * 15
          return newProgress > 90 ? 90 : newProgress
        })
      }, 500)
      
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      
      // Specify if we need format conversion for videos
      if (isVideo) {
        formData.append('needsConversion', 'true')
        formData.append('targetFormat', 'mp4') // Converti sempre i video in MP4 per WhatsApp
      }
      
      if (campaignType) {
        formData.append('campaignType', campaignType)
      }
      
      // Upload using fetch
      const response = await fetch('/api/upload/campaign-media', {
        method: 'POST',
        body: formData
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore durante l\'upload')
      }
      
      const data = await response.json()
      
      if (data.success && data.file && data.file.url) {
        // 100% progress completed
        setUploadingProgress(100)
        
        // Breve pausa per mostrare il 100% prima di resettare
        setTimeout(() => {
          setUploadingProgress(0)
          setIsUploading(false)
          
          // Call the callback with the uploaded file URL
          let fileType: "image" | "video" | "pdf" = "image"
          if (isVideo) fileType = "video"
          if (isPdf) fileType = "pdf"
          
          // Se è un video, assicurati che l'URL sia in formato MP4 per WhatsApp
          // con trasformazioni specifiche per garantire compatibilità con WhatsApp
          let fileUrl = data.file.url
          if (isVideo) {
            // Aggiungi la trasformazione solo se non è già presente
            if (fileUrl.includes("/upload/")) {
              // Utilizza trasformazioni specifiche con:
              // vc_h264:baseline:3.1 - Codifica video H.264 con profilo baseline e livello 3.1
              // ac_aac - Codec audio AAC LC
              // br_2m - Bitrate massimo di 2 Mbps
              // q_70 - Qualità del 70%
              fileUrl = fileUrl.replace("/upload/", "/upload/q_70,vc_h264:baseline:3.1,ac_aac,br_2m,f_mp4/")
            }
            
            // Assicura che l'estensione finale sia .mp4
            if (!fileUrl.endsWith(".mp4")) {
              const urlParts = fileUrl.split(".")
              if (urlParts.length > 1) {
                // Sostituisci l'estensione esistente
                urlParts[urlParts.length - 1] = "mp4"
                fileUrl = urlParts.join(".")
              } else {
                // Aggiungi l'estensione se non c'è
                fileUrl += ".mp4"
              }
            }
          }
          
          onFileSelect(fileUrl, fileType)
        }, 500)
      } else {
        throw new Error('Risposta non valida dal server')
      }
    } catch (error: any) {
      console.error('Errore durante l\'upload:', error)
      setError(error.message || 'Errore durante l\'upload del file')
      setIsUploading(false)
      setUploadingProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      validateAndUploadFile(file)
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    onFileSelect("", mediaType === "all" ? "image" : mediaType === "both" ? "image" : mediaType === "pdf" ? "pdf" : mediaType === "video" ? "video" : "image")
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Helper per determinare che tipo di file è stato caricato
  const getFileType = (): "image" | "video" | "pdf" => {
    if (!selectedFile) return "image"
    if (selectedFile.includes("video")) return "video"
    if (selectedFile.endsWith(".pdf")) return "pdf"
    return "image"
  }

  const fileType = getFileType()

  return (
    <div className={cn("w-full", className)} {...props}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept={getAcceptString()}
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50",
          "hover:border-yellow-400 hover:bg-yellow-50",
          selectedFile && "border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100",
          isUploading && "border-blue-300 bg-blue-50",
          "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
            <p className="text-sm font-medium text-blue-700 mb-2">Caricamento in corso...</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[200px] mx-auto">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadingProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(uploadingProgress)}%</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              {fileType === "video" ? (
                <Video className="w-8 h-8 text-green-500 mx-auto" />
              ) : fileType === "pdf" ? (
                <FileText className="w-8 h-8 text-green-500 mx-auto" />
              ) : (
                <ImageIcon className="w-8 h-8 text-green-500 mx-auto" />
              )}
              <X 
                className="w-5 h-5 text-gray-400 ml-2 hover:text-gray-600" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
              />
            </div>
            <p className="text-sm font-medium text-green-700 mb-1">
              {fileType === "video" 
                ? "Video caricato" 
                : fileType === "pdf" 
                  ? "Documento PDF caricato" 
                  : "Immagine caricata"}
            </p>
            {fileType === "video" && (
              <p className="text-xs text-gray-500">
                Convertito in formato MP4 con codec H.264 (baseline) e audio AAC
              </p>
            )}
          </div>
        ) : (
          <>
            {mediaType === "video" ? (
              <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            ) : mediaType === "image" ? (
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            ) : mediaType === "pdf" ? (
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            )}
            <p className="text-sm text-gray-600 mb-2">
              {label}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {mediaType === "image" 
                ? "Trascina qui un'immagine o clicca per scegliere" 
                : mediaType === "video" 
                  ? "Trascina qui un video o clicca per scegliere (sarà convertito in MP4 con codec H.264 e audio AAC)"
                  : mediaType === "pdf"
                    ? "Trascina qui un documento PDF o clicca per scegliere"
                    : mediaType === "both"
                      ? "Trascina qui un'immagine o un video o clicca per scegliere"
                      : "Trascina qui un'immagine, un video o un PDF o clicca per scegliere"
              }
            </p>
            <CustomButton 
              variant="outline" 
              size="sm" 
              className="text-sm py-1 px-3"
              onClick={(e) => {
                e.stopPropagation()
                handleBrowseClick()
              }}
            >
              Sfoglia File
            </CustomButton>
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
} 