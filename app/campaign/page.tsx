"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Search, Plus, Filter, ArrowUpDown, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BubbleBackground from "@/components/bubble-background"
import { CustomButton } from "@/components/ui/custom-button"

// Mock data for campaigns
const mockCampaigns = [
  {
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
  },
  {
    id: 2,
    name: "New Menu Items Launch",
    type: "update",
    status: "scheduled",
    sentDate: null,
    scheduledDate: "2023-07-05T10:00:00",
    recipients: 156,
    openRate: null,
    clickRate: null,
    responseRate: null,
  },
  {
    id: 3,
    name: "Customer Feedback Request",
    type: "feedback",
    status: "sent",
    sentDate: "2023-05-20T09:15:00",
    scheduledDate: null,
    recipients: 98,
    openRate: 82,
    clickRate: 65,
    responseRate: 31,
  },
  {
    id: 4,
    name: "Weekend Brunch Event",
    type: "event",
    status: "in_progress",
    sentDate: "2023-06-28T08:45:00",
    scheduledDate: null,
    recipients: 75,
    openRate: 45,
    clickRate: 20,
    responseRate: 8,
  },
  {
    id: 5,
    name: "Holiday Special Menu",
    type: "update",
    status: "draft",
    sentDate: null,
    scheduledDate: null,
    recipients: 0,
    openRate: null,
    clickRate: null,
    responseRate: null,
  },
  {
    id: 6,
    name: "Loyalty Program Launch",
    type: "promo",
    status: "failed",
    sentDate: "2023-06-10T16:20:00",
    scheduledDate: null,
    recipients: 145,
    openRate: 12,
    clickRate: 5,
    responseRate: 2,
  },
  {
    id: 7,
    name: "Valentine's Day Special",
    type: "event",
    status: "sent",
    sentDate: "2023-02-12T12:00:00",
    scheduledDate: null,
    recipients: 112,
    openRate: 91,
    clickRate: 78,
    responseRate: 45,
  },
]

// Campaign status options
const statusOptions = [
  { value: "all", label: "All Campaigns" },
  { value: "sent", label: "Sent" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "draft", label: "Draft" },
  { value: "failed", label: "Failed" },
]

// Campaign type options
const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "promo", label: "Promotional" },
  { value: "event", label: "Event" },
  { value: "update", label: "Update" },
  { value: "feedback", label: "Feedback" },
]

// Sort options
const sortOptions = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "performance", label: "Best Performing" },
]

export default function CampaignsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date_desc")
  const [filteredCampaigns, setFilteredCampaigns] = useState(mockCampaigns)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Filter and sort campaigns based on current filters
    let result = [...mockCampaigns]

    // Apply search filter
    if (searchQuery) {
      result = result.filter((campaign) => campaign.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((campaign) => campaign.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((campaign) => campaign.type === typeFilter)
    }

    // Apply tab filter
    if (activeTab === "scheduled") {
      result = result.filter((campaign) => campaign.status === "scheduled")
    } else if (activeTab === "sent") {
      result = result.filter((campaign) => ["sent", "in_progress", "failed"].includes(campaign.status))
    } else if (activeTab === "drafts") {
      result = result.filter((campaign) => campaign.status === "draft")
    }

    // Apply sorting
    result = sortCampaigns(result, sortBy)

    setFilteredCampaigns(result)
  }, [searchQuery, statusFilter, typeFilter, sortBy, activeTab])

  const sortCampaigns = (campaigns, sortOption) => {
    switch (sortOption) {
      case "date_desc":
        return [...campaigns].sort((a, b) => {
          const dateA = a.sentDate || a.scheduledDate || "0"
          const dateB = b.sentDate || b.scheduledDate || "0"
          return dateB.localeCompare(dateA)
        })
      case "date_asc":
        return [...campaigns].sort((a, b) => {
          const dateA = a.sentDate || a.scheduledDate || "9999"
          const dateB = b.sentDate || b.scheduledDate || "9999"
          return dateA.localeCompare(dateB)
        })
      case "name_asc":
        return [...campaigns].sort((a, b) => a.name.localeCompare(b.name))
      case "name_desc":
        return [...campaigns].sort((a, b) => b.name.localeCompare(a.name))
      case "performance":
        return [...campaigns].sort((a, b) => (b.openRate || 0) - (a.openRate || 0))
      default:
        return campaigns
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <span>✅</span> Sent
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <span>📆</span> Scheduled
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <span>⏳</span> In Progress
          </Badge>
        )
      case "draft":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            <span>📝</span> Draft
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <span>❌</span> Failed
          </Badge>
        )
      default:
        return null
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "promo":
        return <span className="text-lg">🎁</span>
      case "event":
        return <span className="text-lg">📅</span>
      case "update":
        return <span className="text-lg">📋</span>
      case "feedback":
        return <span className="text-lg">⭐</span>
      default:
        return <span className="text-lg">💬</span>
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

  const getMascotImage = () => {
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-mint-100 to-mint-200">
      <BubbleBackground />

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 py-6 pb-24">
        {/* Header */}
        <div className="w-full max-w-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button onClick={() => router.push("/dashboard")} className="mr-2">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-extrabold text-[#1B9AAA]">Campaigns</h1>
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

          {/* Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-transparent shadow-none border-b border-gray-200">
              <TabsTrigger value="all" className="text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="sent" className="text-sm">
                Sent
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="text-sm">
                Scheduled
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-xl border-gray-200 h-9 text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="rounded-xl border-gray-200 h-9 text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-xl border-gray-200 h-9 text-xs">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        <div className="w-full max-w-md space-y-4 mb-6">
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                className="bg-white rounded-3xl p-5 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div>{getTypeIcon(campaign.type)}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{campaign.name}</h3>
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
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-xl">👥</span>
                    </div>
                    <p className="text-xs text-gray-500">Recipients</p>
                    <p className="text-sm font-bold text-gray-800">{campaign.recipients}</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-xl">👁️</span>
                    </div>
                    <p className="text-xs text-gray-500">Open Rate</p>
                    <p className="text-sm font-bold text-gray-800">
                      {campaign.openRate !== null ? `${campaign.openRate}%` : "—"}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-xl">👆</span>
                    </div>
                    <p className="text-xs text-gray-500">Click Rate</p>
                    <p className="text-sm font-bold text-gray-800">
                      {campaign.clickRate !== null ? `${campaign.clickRate}%` : "—"}
                    </p>
                  </div>
                </div>

                {campaign.status === "sent" && campaign.openRate !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Performance</span>
                      <span className="font-medium text-gray-700">
                        {campaign.openRate >= 75 ? "Excellent" : campaign.openRate >= 50 ? "Good" : "Average"}
                      </span>
                    </div>
                    <Progress
                      value={campaign.openRate}
                      className="h-2 bg-gray-100"
                      indicatorClassName={`transition-all duration-700 ease-in-out ${
                        campaign.openRate >= 75
                          ? "bg-green-500"
                          : campaign.openRate >= 50
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                      }`}
                    />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src={getMascotImage() || "/placeholder.svg"}
                  alt="Mascot"
                  width={80}
                  height={80}
                  className="opacity-50"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No campaigns found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Create your first campaign to get started!"}
              </p>
              <CustomButton
                className="py-2 px-4 flex items-center justify-center mx-auto"
                onClick={() => router.push("/campaign/create")}
              >
                <Plus className="w-4 h-4 mr-2" /> Create Campaign
              </CustomButton>
            </div>
          )}
        </div>

        {/* Campaign Stats Summary */}
        {filteredCampaigns.length > 0 && (
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Campaign Performance</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Sent</p>
                <p className="text-2xl font-extrabold text-[#1B9AAA]">
                  {mockCampaigns.filter((c) => c.status === "sent" || c.status === "in_progress").length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Avg. Open Rate</p>
                <p className="text-2xl font-extrabold text-[#EF476F]">
                  {Math.round(
                    mockCampaigns.filter((c) => c.openRate !== null).reduce((sum, c) => sum + c.openRate, 0) /
                      mockCampaigns.filter((c) => c.openRate !== null).length,
                  )}
                  %
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Avg. Click Rate</p>
                <p className="text-2xl font-extrabold text-[#06D6A0]">
                  {Math.round(
                    mockCampaigns.filter((c) => c.clickRate !== null).reduce((sum, c) => sum + c.clickRate, 0) /
                      mockCampaigns.filter((c) => c.clickRate !== null).length,
                  )}
                  %
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Performance Tip</p>
                  <p className="text-xs text-gray-600">
                    Campaigns sent between 5-7 PM have 25% higher open rates. Try scheduling your next campaign during
                    this time!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Fixed Create Campaign Button */}
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center">
          <CustomButton
            className="py-3 px-6 shadow-lg flex items-center justify-center max-w-md w-[90%]"
            onClick={() => router.push("/campaign/create")}
          >
            <Plus className="w-5 h-5 mr-2" /> Create New Campaign
          </CustomButton>
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

// Custom ChevronRight icon component
function ChevronRight({ className }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
