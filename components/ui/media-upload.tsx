"use client"

import React, { useState, useRef, ChangeEvent } from "react"
import { cn } from "@/lib/utils"
import { Upload, Image as ImageIcon, Video, X, Loader2 } from "lucide-react"
import { CustomButton } from "./custom-button"

interface MediaUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelect: (fileUrl: string, fileType: "image" | "video") => void
  selectedFile: string | null
  mediaType?: "image" | "video" | "both"
  maxSize?: number // in MB
  campaignType?: string
  label?: string
  className?: string
}

export function MediaUpload({
  onFileSelect,
  selectedFile,
  mediaType = "both",
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
    return "image/*,video/*";
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
    
    if (mediaType === "image" && !isImage) {
      setError(`Per favore carica solo immagini.`)
      return
    }
    
    if (mediaType === "video" && !isVideo) {
      setError(`Per favore carica solo video.`)
      return
    }
    
    if (mediaType === "both" && !isImage && !isVideo) {
      setError(`Per favore carica un'immagine o un video.`)
      return
    }
    
    // Check file size - video può essere più grande
    const actualMaxSize = isVideo ? 30 : maxSize // 30MB per video, maxSize per immagini
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
          onFileSelect(data.file.url, isImage ? "image" : "video")
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
    onFileSelect("", mediaType === "both" ? "image" : mediaType)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
              {mediaType === "video" || (selectedFile && selectedFile.includes("video")) ? (
                <Video className="w-8 h-8 text-green-500 mx-auto" />
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
              {mediaType === "video" || (selectedFile && selectedFile.includes("video")) ? "Video caricato" : "Immagine caricata"}
            </p>
          </div>
        ) : (
          <>
            {mediaType === "video" ? (
              <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            ) : mediaType === "image" ? (
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                  ? "Trascina qui un video o clicca per scegliere"
                  : "Trascina qui un'immagine o un video o clicca per scegliere"
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