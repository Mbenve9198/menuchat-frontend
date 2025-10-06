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
      // Non fare ricerca se c'è già un ristorante selezionato
      if (selectedRestaurant) {
        return
      }

      if (!debouncedSearchQuery || debouncedSearchQuery.length < 3) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsLoading(true)

      try {
        // Chiama la route API di Next.js (non il backend)
        const response = await fetch(
          `/api/restaurants/search?query=${encodeURIComponent(debouncedSearchQuery)}`
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
  }, [debouncedSearchQuery, selectedRestaurant])

  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    try {
      // Carica i dettagli completi del ristorante
      const response = await fetch(
        `/api/restaurants/search?placeId=${restaurant.id}`
      )
      
      if (!response.ok) throw new Error('Errore caricamento dettagli ristorante')
      
      const data = await response.json()
      onSelect(data.restaurant)
      setShowResults(false)
      setSearchResults([]) // Svuota i risultati per evitare che si riapra la lista
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
    <div className="space-y-2 relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Cerca il tuo ristorante..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (selectedRestaurant && e.target.value !== selectedRestaurant.name) {
              onSelect(null as any)
              setSearchResults([]) // Reset dei risultati quando l'utente cancella
            }
          }}
          onFocus={() => {
            // Mostra i risultati solo se non c'è un ristorante già selezionato
            if (searchResults.length > 0 && !selectedRestaurant) {
              setShowResults(true)
            }
          }}
          className="w-full h-12 px-4 pr-10 border-2 border-gray-200 rounded-xl text-sm focus:border-[#1B9AAA] focus:ring-2 focus:ring-[#1B9AAA]/20 outline-none transition"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-[#1B9AAA]" />
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
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl border-2 border-[#1B9AAA]/20 shadow-2xl max-h-[400px] overflow-y-auto"
          >
            <div className="p-2">
              <p className="text-xs text-gray-500 font-bold px-3 py-2 uppercase tracking-wide">
                {searchResults.length} Risultati
              </p>
              {searchResults.map((restaurant, index) => (
                <button
                  key={restaurant.id}
                  onClick={() => handleSelectRestaurant(restaurant)}
                  className="w-full text-left p-3 rounded-xl hover:bg-gradient-to-r hover:from-[#1B9AAA]/5 hover:to-[#06D6A0]/5 transition-all border border-transparent hover:border-[#1B9AAA]/20"
                >
                  <div className="flex items-start gap-3">
                    {restaurant.photo && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                        <img 
                          src={restaurant.photo} 
                          alt={restaurant.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-xs mt-1">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                      {restaurant.rating && (
                        <div className="flex items-center mt-1.5 bg-gray-50 px-2 py-0.5 rounded-full w-fit">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-xs font-bold text-gray-900">
                            {restaurant.rating}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({restaurant.ratingsTotal})
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
            <div className="p-4 bg-gradient-to-r from-[#1B9AAA]/10 to-[#06D6A0]/10 rounded-2xl border-2 border-[#1B9AAA]/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#1B9AAA] to-[#06D6A0] flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#1B9AAA] uppercase tracking-wide mb-1">
                    ✓ Selezionato
                  </p>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {selectedRestaurant.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
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

