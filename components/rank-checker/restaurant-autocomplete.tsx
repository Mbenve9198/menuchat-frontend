"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Star, Check } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface Restaurant {
  id: string
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
  rating?: number
  ratingsTotal?: number
  photo?: string | null
}

interface RestaurantAutocompleteProps {
  onSelect: (restaurant: Restaurant) => void
  selectedRestaurant: Restaurant | null
}

export function RestaurantAutocomplete({ onSelect, selectedRestaurant }: RestaurantAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Fetch search results when debouncedSearchQuery changes
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 3) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsLoading(true)

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/restaurants/search?query=${encodeURIComponent(debouncedSearchQuery)}`
        )
        
        if (!response.ok) {
          throw new Error('Errore durante la ricerca dei ristoranti')
        }
        
        const data = await response.json()
        setSearchResults(data.restaurants || [])
        setShowResults(true)
      } catch (err) {
        console.error('Errore ricerca ristoranti:', err)
        toast({
          title: "Errore",
          description: "Errore durante la ricerca. Riprova.",
          variant: "destructive"
        })
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurants()
  }, [debouncedSearchQuery])

  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    try {
      // Carica i dettagli completi del ristorante
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/restaurants/search?placeId=${restaurant.id}`
      )
      
      if (!response.ok) throw new Error('Errore caricamento dettagli ristorante')
      
      const data = await response.json()
      onSelect(data.restaurant)
      setShowResults(false)
      setSearchQuery(data.restaurant.name)
    } catch (error) {
      console.error('Errore:', error)
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli del ristorante",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-3 relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Cerca il tuo ristorante su Google Maps..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (selectedRestaurant && e.target.value !== selectedRestaurant.name) {
              onSelect(null as any) // Reset selection if user changes input
            }
          }}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true)
            }
          }}
          className="h-12 text-base rounded-xl border-gray-300 focus:border-purple-500 focus:ring-purple-500 pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl max-h-[400px] overflow-y-auto"
          >
            <div className="p-2">
              <p className="text-xs text-gray-500 font-medium px-3 py-2">
                Risultati della ricerca ({searchResults.length})
              </p>
              {searchResults.map((restaurant, index) => (
                <button
                  key={restaurant.id}
                  onClick={() => handleSelectRestaurant(restaurant)}
                  className="w-full text-left p-3 rounded-lg hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200"
                >
                  <div className="flex items-start gap-3">
                    {restaurant.photo && (
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                        <img 
                          src={restaurant.photo} 
                          alt={restaurant.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                      {restaurant.rating && (
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-xs text-gray-700">
                            {restaurant.rating} ({restaurant.ratingsTotal} recensioni)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Restaurant Display */}
      <AnimatePresence>
        {selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-purple-800 uppercase tracking-wide mb-1">
                    Ristorante Selezionato
                  </p>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {selectedRestaurant.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedRestaurant.address}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

