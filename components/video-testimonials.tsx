"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUp, Star, TrendingUp } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  city: string
  initialReviews: number
  currentReviews: number
  growth: number
  daysUsing: number
  rating: number
}

interface TestimonialVideo {
  restaurantName: string
  videoUrl: string
  city: string
}

const videoData: TestimonialVideo[] = [
  {
    restaurantName: "Impact Food",
    videoUrl: "https://ik.imagekit.io/menuchat/app/impact_food.mp4?updatedAt=1763119462996",
    city: "Roma"
  },
  {
    restaurantName: "Ziga Bistrò",
    videoUrl: "https://ik.imagekit.io/menuchat/app/Ziga%20Bistro.mp4?updatedAt=1763119463885",
    city: "Verona"
  },
  {
    restaurantName: "Il Tegolo Livorno",
    videoUrl: "https://ik.imagekit.io/menuchat/app/Il%20Tegolo.mp4?updatedAt=1763119461573",
    city: "Livorno"
  }
]

export default function VideoTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      const response = await fetch('/api/public-stats/testimonials')
      const data = await response.json()
      
      if (data.success && data.data) {
        setTestimonials(data.data)
      }
    } catch (error) {
      console.error('Error loading testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTestimonialData = (videoInfo: TestimonialVideo) => {
    return testimonials.find(t => 
      t.name.toLowerCase().includes(videoInfo.restaurantName.toLowerCase()) ||
      videoInfo.restaurantName.toLowerCase().includes(t.name.toLowerCase())
    )
  }

  const formatGrowth = (growth: number) => {
    if (growth >= 1000) {
      return `+${(growth / 1000).toFixed(1)}K`
    }
    return `+${growth}`
  }

  return (
    <div className="w-full space-y-12">
      {videoData.map((video, index) => {
        const data = getTestimonialData(video)
        
        return (
          <motion.div
            key={video.restaurantName}
            className="w-full"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Video - Alternato sinistra/destra */}
              <div className={`${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    className="w-full h-auto"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Il tuo browser non supporta il tag video.
                  </video>
                </div>
              </div>

              {/* Dati - Alternato sinistra/destra */}
              <div className={`${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <div className="space-y-4">
                  {/* Nome e città */}
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {data?.name || video.restaurantName}
                    </h3>
                    <p className="text-lg text-gray-600 flex items-center gap-2">
                      📍 {data?.city || video.city}
                    </p>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
                    </div>
                  ) : data ? (
                    <>
                      {/* Statistiche Recensioni */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600">Recensioni Google</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= data.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-end gap-4 mb-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Prima di MenuChat</p>
                            <p className="text-3xl font-bold text-gray-400">{data.initialReviews}</p>
                          </div>
                          
                          <div className="flex-1 flex items-center justify-center pb-2">
                            <ArrowUp className="w-8 h-8 text-green-600" />
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Oggi</p>
                            <p className="text-3xl font-bold text-green-600">{data.currentReviews}</p>
                          </div>
                        </div>

                        <div className="bg-white/60 rounded-xl p-3 flex items-center justify-between">
                          <span className="text-sm text-gray-700">Crescita totale</span>
                          <span className="text-2xl font-extrabold text-green-600">
                            {formatGrowth(data.growth)}
                          </span>
                        </div>
                      </div>

                      {/* Tempo di utilizzo */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Con MenuChat da</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {data.daysUsing} giorni
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Media: {(data.growth / (data.daysUsing || 1)).toFixed(1)} nuove recensioni al giorno
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      Dati non disponibili
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

