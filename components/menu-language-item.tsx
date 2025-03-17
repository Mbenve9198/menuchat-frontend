"use client"

import { useState } from "react"
import { FileUpload } from "../components/ui/file-upload"
import { Input } from "../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Label } from "../components/ui/label"
import { Globe, File, Link } from "lucide-react"
import { MenuLanguage } from "./language-selector"

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

  const handleFileChange = (file: File | null) => {
    onLanguageChange({
      ...language,
      menuFile: file,
      menuUrl: file ? "" : language.menuUrl
    })
    if (file) setActiveTab("file")
  }

  const handleUrlChange = (url: string) => {
    onLanguageChange({
      ...language,
      menuUrl: url,
      menuFile: url ? null : language.menuFile
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
        </TabsContent>
      </Tabs>
    </div>
  )
} 