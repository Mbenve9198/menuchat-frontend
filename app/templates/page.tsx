"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MessageSquare,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send
} from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { CustomButton } from "@/components/ui/custom-button"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { useParams } from 'next/navigation'
import BubbleBackground from "@/components/bubble-background"

interface Template {
  _id: string
  type: 'MEDIA' | 'CALL_TO_ACTION' | 'REVIEW'
  name: string
  language: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  restaurant: string
  components: {
    body: {
      text: string
    }
    buttons?: Array<{
      type: string
      text: string
      url: string
    }>
  }
  createdAt: string
  updatedAt: string
  rejectionReason?: string
}

interface TemplateGroup {
  type: string
  templates: Template[]
}

export default function TemplatesPage() {
  const params = useParams()
  const restaurantId = params.restaurantId as string
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [editedMessage, setEditedMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/templates?restaurantId=${restaurantId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load templates')
      }
      
      if (!data.success || !data.templates) {
        throw new Error('Invalid response format')
      }

      // Raggruppa i template per tipo
      const groups = data.templates.reduce((acc: TemplateGroup[], template: Template) => {
        const existingGroup = acc.find(g => g.type === template.type)
        if (existingGroup) {
          existingGroup.templates.push(template)
        } else {
          acc.push({ type: template.type, templates: [template] })
        }
        return acc
      }, [])

      setTemplateGroups(groups)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load templates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-500'
      case 'REJECTED':
        return 'text-red-500'
      default:
        return 'text-amber-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template._id)
    setEditedMessage(template.components.body.text)
  }

  const handleSave = async (template: Template) => {
    try {
      const response = await fetch(`/api/templates/${template._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: template._id,
          message: editedMessage
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update template')
      }

      if (!data.success) {
        throw new Error('Invalid response format')
      }

      toast({
        title: "Success",
        description: "Template updated successfully",
      })

      // Refresh templates
      await fetchTemplates()
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update template",
        variant: "destructive",
      })
    }
  }

  const regenerateWithAI = async (template: Template) => {
    try {
      setIsGenerating(true)
      
      const endpoint = template.type === 'REVIEW' 
        ? '/api/review'
        : '/api/welcome'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: template.restaurant,
          type: template.type === 'MEDIA' ? 'pdf' : 'url'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate message')
      }

      const data = await response.json()
      setEditedMessage(data.message || data.templates[0])
    } catch (error) {
      console.error('Error generating message:', error)
      toast({
        title: "Error",
        description: "Failed to generate message",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6">
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1B9AAA]">WhatsApp Templates</h1>
              <p className="text-gray-700">Manage your message templates</p>
            </div>
            <div className="relative w-8 h-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
                alt="Mascot"
                width={32}
                height={32}
                className="absolute -top-1 -right-1"
              />
            </div>
          </div>

          {templateGroups.map((group) => (
            <motion.div
              key={group.type}
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                {group.type === 'MEDIA' ? (
                  <div className="bg-[#1B9AAA]/10 p-2 rounded-full">
                    <MessageSquare className="w-5 h-5 text-[#1B9AAA]" />
                  </div>
                ) : group.type === 'CALL_TO_ACTION' ? (
                  <div className="bg-[#EF476F]/10 p-2 rounded-full">
                    <Send className="w-5 h-5 text-[#EF476F]" />
                  </div>
                ) : (
                  <div className="bg-[#06D6A0]/10 p-2 rounded-full">
                    <Star className="w-5 h-5 text-[#06D6A0]" />
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-800">
                  {group.type === 'MEDIA' ? 'Menu PDF Templates' :
                   group.type === 'CALL_TO_ACTION' ? 'Menu URL Templates' :
                   'Review Templates'}
                </h2>
              </div>

              <div className="space-y-4">
                {group.templates.map((template) => (
                  <motion.div
                    key={template._id}
                    className="bg-white rounded-xl p-4 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{template.language}</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)} bg-opacity-10`}>
                          {getStatusIcon(template.status)}
                          {template.status}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedTemplate(
                          expandedTemplate === template._id ? null : template._id
                        )}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedTemplate === template._id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {template.status === 'REJECTED' && template.rejectionReason && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 p-2 bg-red-50 rounded-lg border border-red-100"
                      >
                        <p className="text-xs text-red-700">
                          <XCircle className="w-3 h-3 inline mr-1" />
                          Rejection reason: {template.rejectionReason}
                        </p>
                      </motion.div>
                    )}

                    {editingTemplate === template._id ? (
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Textarea
                          value={editedMessage}
                          onChange={(e) => setEditedMessage(e.target.value)}
                          className="w-full min-h-[100px] text-sm rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                        <div className="flex gap-2">
                          <CustomButton
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setEditingTemplate(null)}
                          >
                            Cancel
                          </CustomButton>
                          <CustomButton
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => regenerateWithAI(template)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 mr-1" />
                                Regenerate
                              </>
                            )}
                          </CustomButton>
                          <CustomButton
                            size="sm"
                            className="text-xs"
                            onClick={() => handleSave(template)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Save
                          </CustomButton>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="text-sm text-gray-700 mb-3">
                          {template.components.body.text}
                        </p>
                        {expandedTemplate === template._id && (
                          <motion.div
                            className="mt-3 pt-3 border-t"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span>Last updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                              <button
                                onClick={() => handleEdit(template)}
                                className="text-[#1B9AAA] hover:text-[#26C6D9] font-medium"
                              >
                                Edit Message
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
} 