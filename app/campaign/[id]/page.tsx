"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Calendar,
  Users,
  Eye,
  MousePointerClick,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gift,
  CalendarClock,
  Menu,
  Star,
  Share2,
  Edit3,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BubbleBackground from "@/components/bubble-background"
import { CustomButton } from "@/components/ui/custom-button"

// Mock campaign data
const mockCampaign = {
  id: 1,
  name: "Summer Special Offer",
  type: "promo",
  status: "sent",
  sentDate: "2023-06-15T14:30:00",
  scheduledDate: null,
  recipients: 128,
  openRate: 76,
  clickRate: 42,
  responseRate: 18,
  message:
    "🌟 Special Offer! Enjoy 20% off your next order this weekend. Use code TASTY20 at checkout. Limited time only!",
  imageUrl: "/restaurant-special-offer.png",
  cta: "Order Now",
  ctaUrl: "https://example.com/order",
  openCount: 97,
  clickCount: 54,
  responseCount: 23,
  deliveryFailed: 3,
}

// Mock recipient data
const mockRecipients = [
  {
    id: 1,
    name: "John Smith",
    phone: "+1 555-123-4567",
    status: "opened",
    openTime: "2023-06-15T14:35:00",
    clicked: true,
  },
  {
    id: 2,
    name: "Maria Garcia",
    phone: "+34 612-345-678",
    status: "opened",
    openTime: "2023-06-15T14:40:00",
    clicked: true,
  },
  {
    id: 3,
    name: "Paolo Rossi",
    phone: "+39 333-789-0123",
    status: "opened",
    openTime: "2023-06-15T15:10:00",
    clicked: false,
  },
  { id: 4, name: "Emma Wilson", phone: "+44 7700-900123", status: "delivered", openTime: null, clicked: false },
  {
    id: 5,
    name: "Ahmed Hassan",
    phone: "+20 100-456-7890",
    status: "opened",
    openTime: "2023-06-15T16:20:00",
    clicked: true,
  },
  { id: 6, name: "Sophia Chen", phone: "+86 138-0123-4567", status: "failed", openTime: null, clicked: false },
  { id: 7, name: "Carlos Mendez", phone: "+52 55-1234-5678", status: "delivered", openTime: null, clicked: false },
  {
    id: 8,
    name: "Aisha Patel",
    phone: "+91 98765-43210",
    status: "opened",
    openTime: "2023-06-15T14:50:00",
    clicked: false,
  },
]

export default function CampaignDetailPage({ params }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const campaign = mockCampaign // In a real app, fetch the campaign by params.id

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sent
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Scheduled
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </Badge>
        )
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <Edit className="w-3 h-3" /> Draft
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Failed
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "promo":
        return <Gift className="w-5 h-5 text-[#EF476F]" />
      case "event":
        return <CalendarClock className="w-5 h-5 text-[#1B9AAA]" />
      case "update":
        return <Menu className="w-5 h-5 text-[#FFE14D]" />
      case "feedback":
        return <Star className="w-5 h-5 text-[#06D6A0]" />
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />
    }
  }

  const getRecipientStatusBadge = (status) => {
    switch (status) {
      case "opened":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Opened</Badge>
      case "delivered":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Delivered</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "—"
    return `${formatDate(dateString)} at ${formatTime(dateString)}`
  }

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  const getExcitedMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <button onClick={() => router.push("/campaigns")} className="mr-2">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-extrabold text-[#1B9AAA]">Campaign Details</h1>
            </div>
            <div className="relative w-10 h-10">
              <Image
                src={getMascotImage() || "/placeholder.svg"}
                alt="Mascot"
                width={40}
                height={40}
                className="drop-shadow-lg"
              />
            </div>
          </div>

          {/* Campaign Header */}
          <div className="bg-white rounded-3xl p-5 shadow-xl mb-4">
            <div className="flex items-start gap-4 mb-3">
              <div className="p-3 rounded-full bg-gray-100">{getTypeIcon(campaign.type)}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{campaign.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(campaign.status)}
                  <span className="text-xs text-gray-500">
                    {campaign.sentDate
                      ? `Sent: ${formatDate(campaign.sentDate)}`
                      : campaign.scheduledDate
                        ? `Scheduled: ${formatDate(campaign.scheduledDate)}`
                        : "Not scheduled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">Recipients</p>
                <p className="text-sm font-bold text-gray-800">{campaign.recipients}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Eye className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">Open Rate</p>
                <p className="text-sm font-bold text-gray-800">
                  {campaign.openRate !== null ? `${campaign.openRate}%` : "—"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <MousePointerClick className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">Click Rate</p>
                <p className="text-sm font-bold text-gray-800">
                  {campaign.clickRate !== null ? `${campaign.clickRate}%` : "—"}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <CustomButton
                variant="outline"
                className="flex-1 py-2 flex items-center justify-center text-xs"
                onClick={() => {}}
              >
                <Share2 className="w-4 h-4 mr-1" /> Share Results
              </CustomButton>
              <CustomButton
                className="flex-1 py-2 flex items-center justify-center text-xs"
                onClick={() => router.push(`/campaign/create?duplicate=${campaign.id}`)}
              >
                <Edit3 className="w-4 h-4 mr-1" /> Duplicate
              </CustomButton>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="overview" className="text-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="recipients" className="text-sm">
                Recipients
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Message Preview */}
              <div className="bg-white rounded-3xl p-5 shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Message Preview</h3>
                <div className="bg-gray-100 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    <div className="self-start bg-white rounded-lg p-3 shadow-sm max-w-[280px]">
                      {campaign.imageUrl && (
                        <div className="mb-2 rounded-md overflow-hidden">
                          <Image
                            src={campaign.imageUrl || "/placeholder.svg"}
                            alt="Campaign image"
                            width={260}
                            height={180}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      <p className="text-sm">{campaign.message}</p>
                      {campaign.cta && (
                        <div className="mt-2 bg-[#EF476F] text-white text-sm font-medium py-1 px-3 rounded-md inline-block">
                          {campaign.cta}
                        </div>
                      )}
                      <div className="mt-1 bg-gray-200 text-gray-700 text-xs py-1 px-2 rounded-md inline-block">
                        Opt-out
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-3xl p-5 shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Metrics</h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Delivered</span>
                      <span className="font-medium text-gray-800">
                        {campaign.recipients - campaign.deliveryFailed} / {campaign.recipients}
                      </span>
                    </div>
                    <Progress
                      value={((campaign.recipients - campaign.deliveryFailed) / campaign.recipients) * 100}
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-blue-500 transition-all duration-700 ease-in-out"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Opened</span>
                      <span className="font-medium text-gray-800">
                        {campaign.openCount} / {campaign.recipients}
                      </span>
                    </div>
                    <Progress
                      value={(campaign.openCount / campaign.recipients) * 100}
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-green-500 transition-all duration-700 ease-in-out"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Clicked</span>
                      <span className="font-medium text-gray-800">
                        {campaign.clickCount} / {campaign.recipients}
                      </span>
                    </div>
                    <Progress
                      value={(campaign.clickCount / campaign.recipients) * 100}
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-yellow-500 transition-all duration-700 ease-in-out"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Responded</span>
                      <span className="font-medium text-gray-800">
                        {campaign.responseCount} / {campaign.recipients}
                      </span>
                    </div>
                    <Progress
                      value={(campaign.responseCount / campaign.recipients) * 100}
                      className="h-2 bg-gray-100"
                      indicatorClassName="bg-purple-500 transition-all duration-700 ease-in-out"
                    />
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-white rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Insights</h3>
                  <div className="relative">
                    <Image
                      src={getExcitedMascotImage() || "/placeholder.svg"}
                      alt="Excited Mascot"
                      width={40}
                      height={40}
                      className="drop-shadow-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-green-100 flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Above Average Performance</p>
                        <p className="text-xs text-gray-600">
                          This campaign's open rate is 15% higher than your average. The promotional offer was
                          particularly effective!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Best Time to Send</p>
                        <p className="text-xs text-gray-600">
                          Most of your customers opened this message within 30 minutes of receiving it. Consider sending
                          future campaigns at similar times.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recipients" className="space-y-4">
              {/* Recipients List */}
              <div className="bg-white rounded-3xl p-5 shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recipients</h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {mockRecipients.map((recipient) => (
                    <motion.div
                      key={recipient.id}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div>
                        <p className="font-medium text-gray-800">{recipient.name}</p>
                        <p className="text-sm text-gray-500">{recipient.phone}</p>
                      </div>
                      <div className="text-right">
                        <div className="mb-1">{getRecipientStatusBadge(recipient.status)}</div>
                        {recipient.clicked && (
                          <span className="text-xs text-green-600 font-medium flex items-center justify-end">
                            <MousePointerClick className="w-3 h-3 mr-1" /> Clicked
                          </span>
                        )}
                        {recipient.openTime && (
                          <p className="text-xs text-gray-400">{formatTime(recipient.openTime)}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recipients Summary */}
              <div className="bg-white rounded-3xl p-5 shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Opened</p>
                    <p className="text-lg font-bold text-green-600">
                      {mockRecipients.filter((r) => r.status === "opened").length}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Clicked</p>
                    <p className="text-lg font-bold text-yellow-600">
                      {mockRecipients.filter((r) => r.clicked).length}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Delivered Only</p>
                    <p className="text-lg font-bold text-blue-600">
                      {mockRecipients.filter((r) => r.status === "delivered").length}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Failed</p>
                    <p className="text-lg font-bold text-red-600">
                      {mockRecipients.filter((r) => r.status === "failed").length}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}

// Custom Edit icon component
function Edit({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
