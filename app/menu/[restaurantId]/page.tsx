"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  MapPin, 
  Star, 
  Clock,
  Search,
  Filter,
  X
} from "lucide-react"

// --- TYPES ---
interface RestaurantInfo {
  name: string
  profileImage?: string
  address?: {
    formattedAddress: string
  }
  googleRating?: {
    rating: number
    reviewCount: number
  }
  description?: string
}

interface DesignSettings {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  coverImageUrl?: string
  logoUrl?: string
  showImages: boolean
  showPrices: boolean
}

interface Tag {
  id: string
  text: string
  color: string
}

interface Dish {
  id: string
  name: string
  price: number
  available: boolean
  photoUrl?: string
  tags: Tag[]
  description?: string
  ingredients?: string[]
}

interface Category {
  id: string
  name: string
  icon: string
  dishes: Dish[]
}

interface MenuData {
  menu: {
    id: string
    name: string
    designSettings: DesignSettings
  }
  categories: Category[]
  availableTags: Tag[]
}

export default function PublicMenuPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const restaurantId = params.restaurantId as string
  const customerName = searchParams.get('customerName') || searchParams.get('name') || null
  
  // States
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Load data
  useEffect(() => {
    if (restaurantId) {
      loadData()
    }
  }, [restaurantId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load restaurant info (parallel)
      const [restaurantResponse, menuResponse] = await Promise.all([
        fetch(`/api/restaurants-public/${restaurantId}`),
        fetch(`/api/menu/${restaurantId}`)
      ])

      // Handle restaurant info
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json()
        if (restaurantData.success) {
          setRestaurantInfo(restaurantData.restaurant)
        }
      }

      // Handle menu data
      if (!menuResponse.ok) {
        throw new Error('Menu non trovato')
      }

      const menuData = await menuResponse.json()
      if (!menuData.success) {
        throw new Error(menuData.error || 'Errore nel caricamento del menu')
      }

      setMenuData(menuData.data)
      
      // Set first category as active
      if (menuData.data.categories.length > 0) {
        setActiveCategory(menuData.data.categories[0].id)
      }

    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Errore nel caricamento')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter dishes based on search and tags
  const getFilteredCategories = () => {
    if (!menuData) return []

    return menuData.categories.map(category => ({
      ...category,
      dishes: category.dishes.filter(dish => {
        // Search filter
        const matchesSearch = !searchTerm || 
          dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))

        // Tag filter
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.some(tagId => dish.tags.some(tag => tag.id === tagId))

        // Available filter
        const isAvailable = dish.available

        return matchesSearch && matchesTags && isAvailable
      })
    })).filter(category => category.dishes.length > 0)
  }

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTags([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!menuData) return null

  const designSettings = menuData.menu.designSettings
  const filteredCategories = getFilteredCategories()

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ 
        backgroundColor: designSettings.backgroundColor,
        color: designSettings.textColor 
      }}
    >
      {/* Cover Image */}
      {designSettings.coverImageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={designSettings.coverImageUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      )}

      {/* Header */}
      <div className="relative bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4">
            {/* Logo/Profile */}
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {(designSettings.logoUrl || restaurantInfo?.profileImage) ? (
                <img
                  src={designSettings.logoUrl || restaurantInfo?.profileImage}
                  alt={restaurantInfo?.name || 'Restaurant'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: designSettings.primaryColor }}
                >
                  {restaurantInfo?.name?.charAt(0) || 'R'}
                </div>
              )}
            </div>

            <div className="flex-1">
              {/* Personalized Greeting */}
              {customerName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg font-medium mb-1"
                  style={{ color: designSettings.primaryColor }}
                >
                  Ciao <span className="font-bold">{customerName}</span>! 👋
                </motion.p>
              )}

              <h1 className="text-2xl font-bold text-gray-900">
                {restaurantInfo?.name || 'Menu'}
              </h1>

              {restaurantInfo?.address && (
                <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurantInfo.address.formattedAddress}</span>
                </div>
              )}

              {restaurantInfo?.googleRating && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurantInfo.googleRating.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500">
                    ({restaurantInfo.googleRating.reviewCount} recensioni)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca piatti, ingredienti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tags */}
          {menuData.availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {menuData.availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? `${tag.color} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.text}
                </button>
              ))}
            </div>
          )}

          {/* Clear Filters */}
          {(searchTerm || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              Cancella filtri
            </button>
          )}

          {/* Category Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{
                  backgroundColor: activeCategory === category.id ? designSettings.primaryColor : undefined
                }}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                <span className="text-sm opacity-75">({category.dishes.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto p-4 pb-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun piatto trovato</h3>
            <p className="text-gray-600 mb-4">
              Prova a modificare i filtri o la ricerca
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: designSettings.primaryColor }}
            >
              Cancella filtri
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                id={`category-${category.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  <span className="text-gray-500 text-sm">({category.dishes.length})</span>
                </div>

                {/* Dishes */}
                <div className="space-y-3">
                  {category.dishes.map((dish) => (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Dish Image */}
                        {designSettings.showImages && dish.photoUrl && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={dish.photoUrl}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Dish Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">
                              {dish.name}
                            </h3>
                            {designSettings.showPrices && (
                              <span 
                                className="font-bold text-lg whitespace-nowrap"
                                style={{ color: designSettings.primaryColor }}
                              >
                                €{dish.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {dish.description && (
                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                              {dish.description}
                            </p>
                          )}

                          {dish.ingredients && dish.ingredients.length > 0 && (
                            <p className="text-gray-500 text-xs mt-2">
                              <span className="font-medium">Ingredienti:</span> {dish.ingredients.join(', ')}
                            </p>
                          )}

                          {dish.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {dish.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className={`px-2 py-1 rounded text-xs font-medium text-white ${tag.color}`}
                                >
                                  {tag.text}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto p-6 text-center text-gray-500 text-sm">
          <p>Powered by <span className="font-medium">MenuChat</span></p>
        </div>
      </div>
    </div>
  )
} 