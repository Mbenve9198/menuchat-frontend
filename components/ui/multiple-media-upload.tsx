"use client"

import React, { useState, useRef, ChangeEvent } from "react"
import { cn } from "@/lib/utils"
import { Upload, Image as ImageIcon, X, Loader2, Plus, Trash2 } from "lucide-react"
import { CustomButton } from "./custom-button"

interface UploadedFile {
  url: string
  type: "image" | "pdf"
  name: string
}

interface MultipleMediaUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelect: (files: UploadedFile[]) => void
  selectedFiles: UploadedFile[]
  mediaType?: "image" | "pdf" | "both"
  maxFiles?: number
  maxSize?: number // in MB
  label?: string
  className?: string
}

export function MultipleMediaUpload({
  onFilesSelect,
  selectedFiles,
  mediaType = "both",
  maxFiles = 5,
  maxSize = 10,
  label = "Carica Immagini del Menu",
  className,
  ...props
}: MultipleMediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingProgress, setUploadingProgress] = useState(0)
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptString = () => {
    if (mediaType === "image") return "image/*";
    if (mediaType === "pdf") return "application/pdf";
    return "image/*,application/pdf";
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    
    if (!files || files.length === 0) {
      return
    }

    const fileArray = Array.from(files)
    await processMultipleFiles(fileArray)
  }

  const processMultipleFiles = async (files: File[]) => {
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Puoi caricare massimo ${maxFiles} file. Rimuovi alcuni file prima di aggiungerne altri.`)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadingProgress(0)
    setCurrentUploadIndex(0)

    const uploadedFiles: UploadedFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setCurrentUploadIndex(i + 1)

      // Validate file
      const isImage = file.type.startsWith('image/')
      const isPdf = file.type === 'application/pdf'
      
      if (mediaType === "image" && !isImage) {
        setError(`File "${file.name}": Per favore carica solo immagini.`)
        setIsUploading(false)
        return
      }
      
      if (mediaType === "pdf" && !isPdf) {
        setError(`File "${file.name}": Per favore carica solo documenti PDF.`)
        setIsUploading(false)
        return
      }
      
      if (mediaType === "both" && !isImage && !isPdf) {
        setError(`File "${file.name}": Per favore carica un'immagine o un PDF.`)
        setIsUploading(false)
        return
      }

      // Check file size
      let actualMaxSize = maxSize
      if (isPdf) {
        actualMaxSize = 15 // 15MB per PDF
      }
      
      if (file.size > actualMaxSize * 1024 * 1024) {
        setError(`File "${file.name}": File troppo grande. La dimensione massima è ${actualMaxSize}MB.`)
        setIsUploading(false)
        return
      }

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file)
        formData.append('campaignType', 'menu-import')
        
        // Upload using fetch
        const response = await fetch('/api/upload/campaign-media', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Errore durante l\'upload')
        }
        
        const data = await response.json()
        
        if (data.success && data.file && data.file.url) {
          const fileType: "image" | "pdf" = isPdf ? "pdf" : "image"
          uploadedFiles.push({
            url: data.file.url,
            type: fileType,
            name: file.name
          })

          // Update progress
          setUploadingProgress(((i + 1) / files.length) * 100)
        } else {
          throw new Error('Risposta non valida dal server')
        }
      } catch (error: any) {
        console.error('Errore durante l\'upload:', error)
        setError(`Errore upload "${file.name}": ${error.message}`)
        setIsUploading(false)
        return
      }
    }

    // Add uploaded files to the current list
    const newFiles = [...selectedFiles, ...uploadedFiles]
    onFilesSelect(newFiles)
    
    setIsUploading(false)
    setUploadingProgress(0)
    setCurrentUploadIndex(0)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
      const files = Array.from(e.dataTransfer.files)
      processMultipleFiles(files)
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    onFilesSelect(newFiles)
  }

  const handleClearAll = () => {
    onFilesSelect([])
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
        multiple
      />
      
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={selectedFiles.length < maxFiles ? handleBrowseClick : undefined}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
          selectedFiles.length < maxFiles ? "cursor-pointer" : "cursor-not-allowed opacity-50",
          isDragging ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50",
          "hover:border-yellow-400 hover:bg-yellow-50",
          selectedFiles.length > 0 && "border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100",
          isUploading && "border-blue-300 bg-blue-50",
          "focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
            <p className="text-sm font-medium text-blue-700 mb-2">
              Caricamento {currentUploadIndex} di {selectedFiles.length + currentUploadIndex}...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 max-w-[200px] mx-auto">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadingProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(uploadingProgress)}%</p>
          </div>
        ) : selectedFiles.length > 0 ? (
          <div className="flex flex-col items-center">
            <ImageIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-700 mb-1">
              {selectedFiles.length} file caricati
            </p>
            {selectedFiles.length < maxFiles && (
              <p className="text-xs text-gray-500 mb-3">
                Clicca per aggiungere più file (max {maxFiles})
              </p>
            )}
          </div>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className="text-xs text-gray-500 mb-3">
              Trascina qui le immagini del menu o clicca per scegliere (max {maxFiles} file)
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

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">
              File caricati ({selectedFiles.length}/{maxFiles})
            </h4>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Rimuovi Tutti
            </CustomButton>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {file.type}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  )
} 