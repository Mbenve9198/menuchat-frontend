"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomButton } from "@/components/ui/custom-button"
import { Loader2, MapPin, Star } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "@/components/ui/use-toast"

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

interface RestaurantSearchProps {
  onSelect: (restaurant: Restaurant) => void
  selectedRestaurant: Restaurant | null
  restaurantName?: string
  labelText?: string
}

export function RestaurantSearch({ onSelect, selectedRestaurant, restaurantName, labelText }: RestaurantSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Fetch search results when debouncedSearchQuery changes
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 3) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Combina il nome del ristorante con la query di ricerca se disponibile
        const combinedQuery = restaurantName && restaurantName.trim() !== "" 
          ? `${restaurantName} ${debouncedSearchQuery}`
          : debouncedSearchQuery;
          
        const response = await fetch(`/api/restaurants/search?query=${encodeURIComponent(combinedQuery)}`)
        
        if (!response.ok) {
          throw new Error('Failed to search for restaurants')
        }
        
        const data = await response.json()
        setSearchResults(data.restaurants || [])
      } catch (err) {
        setError('Error searching for restaurants. Please try again.')
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurants()
  }, [debouncedSearchQuery, restaurantName])

  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    try {
      // Carica i dettagli completi del ristorante
      const response = await fetch(`/api/restaurants/search?placeId=${restaurant.id}`);
      if (!response.ok) throw new Error('Failed to fetch restaurant details');
      
      const data = await response.json();
      onSelect(data.restaurant);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant details",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="restaurant-search" className="text-gray-800 font-medium">
          {labelText || "Search for your restaurant"}
        </Label>
        <Input
          id="restaurant-search"
          placeholder="Enter restaurant address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
        />
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <span className="ml-2 text-sm text-gray-500">Searching...</span>
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          <p className="text-sm text-gray-500 font-medium">Search Results</p>
          {searchResults.map((restaurant) => (
            <div
              key={restaurant.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedRestaurant?.id === restaurant.id
                  ? "border-purple-400 bg-purple-50"
                  : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
              }`}
              onClick={() => handleSelectRestaurant(restaurant)}
            >
              <div className="flex items-start gap-3">
                {restaurant.photo && (
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <img src={restaurant.photo} alt={restaurant.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">{restaurant.address}</span>
                  </div>
                  {restaurant.rating && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs ml-1 text-gray-700">
                        {restaurant.rating} ({restaurant.ratingsTotal} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Restaurant */}
      {selectedRestaurant && (
        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm font-medium text-purple-800 mb-2">Selected Restaurant</p>
          <h3 className="font-semibold text-gray-900">{selectedRestaurant.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{selectedRestaurant.address}</p>
        </div>
      )}
    </div>
  )
} 