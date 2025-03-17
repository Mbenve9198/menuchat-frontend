"use client"

import React, { useState, useRef, ChangeEvent } from "react"
import { cn } from "@/lib/utils"
import { Upload, File, X } from "lucide-react"
import { CustomButton } from "./custom-button"

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  accept?: string
  maxSize?: number // in MB
  label?: string
  multiple?: boolean
  className?: string
}

export function FileUpload({
  onFileSelect,
  selectedFile,
  accept = ".pdf",
  maxSize = 10, // Default 10MB
  label = "Upload file",
  multiple = false,
  className,
  ...props
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    
    if (!files || files.length === 0) {
      onFileSelect(null)
      return
    }

    const file = files[0]
    validateAndSetFile(file)
  }

  const validateAndSetFile = (file: File) => {
    setError(null)
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase()
    const acceptTypes = accept.split(',').map(type => 
      type.trim().replace('.', '').toLowerCase()
    )
    
    if (accept !== '*' && !acceptTypes.includes(fileType || '')) {
      setError(`File type not supported. Please upload ${accept} files.`)
      return
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`)
      return
    }

    onFileSelect(file)
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
      validateAndSetFile(file)
    }
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    onFileSelect(null)
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
        accept={accept}
        multiple={multiple}
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-yellow-300 bg-yellow-50",
          "hover:border-yellow-400 hover:bg-yellow-100",
          selectedFile && "border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100"
        )}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <File className="w-8 h-8 text-green-500 mx-auto" />
              <X 
                className="w-5 h-5 text-gray-400 ml-2 hover:text-gray-600" 
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFile()
                }}
              />
            </div>
            <p className="text-sm font-medium text-green-700 mb-1">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your file here, or click to browse
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
              Choose File
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