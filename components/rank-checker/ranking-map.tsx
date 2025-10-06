"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface MapLocation {
  name: string
  rank: number | string
  coordinates: { lat: number; lng: number }
  rating?: number
  reviews?: number
  address?: string
}

interface RankingMapProps {
  userRestaurant: MapLocation
  competitors: MapLocation[]
}

// Dichiara il tipo google per TypeScript
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function RankingMap({ userRestaurant, competitors }: RankingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Funzione per inizializzare la mappa
    const initializeMap = () => {
      if (!mapRef.current || !window.google) return

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: userRestaurant.coordinates,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        mapInstanceRef.current = map

        // Crea bounds per includere tutti i marker
        const bounds = new window.google.maps.LatLngBounds()

        // Aggiungi marker per il ristorante dell'utente (Stella Blu)
        const userMarker = new window.google.maps.Marker({
          position: userRestaurant.coordinates,
          map: map,
          title: userRestaurant.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#3B82F6', // Blue
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
            scale: 15
          },
          label: {
            text: typeof userRestaurant.rank === 'number' ? `${userRestaurant.rank}` : '?',
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: '14px'
          },
          zIndex: 1000
        })

        // Info window per il ristorante dell'utente
        const userInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-weight: bold; color: #3B82F6; margin: 0 0 8px 0; font-size: 16px;">
                ${userRestaurant.name}
              </h3>
              <div style="background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; padding: 8px 12px; border-radius: 8px; text-align: center; margin-bottom: 8px;">
                <div style="font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Il Tuo Locale</div>
                <div style="font-size: 24px; font-weight: bold;">
                  ${typeof userRestaurant.rank === 'number' ? `#${userRestaurant.rank}` : userRestaurant.rank}
                </div>
              </div>
              ${userRestaurant.address ? `
                <p style="margin: 4px 0; color: #666; font-size: 13px;">
                  📍 ${userRestaurant.address}
                </p>
              ` : ''}
              ${userRestaurant.rating ? `
                <p style="margin: 4px 0; color: #666; font-size: 13px;">
                  ⭐ ${userRestaurant.rating} (${userRestaurant.reviews || 0} recensioni)
                </p>
              ` : ''}
            </div>
          `
        })

        userMarker.addListener('click', () => {
          userInfoWindow.open(map, userMarker)
        })

        bounds.extend(userRestaurant.coordinates)

        // Aggiungi marker per i competitor
        competitors.forEach((competitor, index) => {
          // Colore basato sul rank
          let color = '#9333EA' // Purple per competitor
          
          const competitorMarker = new window.google.maps.Marker({
            position: competitor.coordinates,
            map: map,
            title: competitor.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 12
            },
            label: {
              text: `${competitor.rank}`,
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '12px'
            },
            zIndex: 100
          })

          // Info window per i competitor
          const competitorInfoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="font-weight: bold; color: #9333EA; margin: 0 0 8px 0; font-size: 15px;">
                  ${competitor.name}
                </h3>
                <div style="background: linear-gradient(135deg, #9333EA, #7C3AED); color: white; padding: 6px 10px; border-radius: 6px; text-align: center; margin-bottom: 8px;">
                  <div style="font-size: 11px; opacity: 0.9;">Competitor</div>
                  <div style="font-size: 20px; font-weight: bold;">#${competitor.rank}</div>
                </div>
                ${competitor.address ? `
                  <p style="margin: 4px 0; color: #666; font-size: 12px;">
                    📍 ${competitor.address}
                  </p>
                ` : ''}
                ${competitor.rating ? `
                  <p style="margin: 4px 0; color: #666; font-size: 12px;">
                    ⭐ ${competitor.rating} (${competitor.reviews || 0} recensioni)
                  </p>
                ` : ''}
              </div>
            `
          })

          competitorMarker.addListener('click', () => {
            competitorInfoWindow.open(map, competitorMarker)
          })

          bounds.extend(competitor.coordinates)
        })

        // Fit map to bounds
        if (competitors.length > 0) {
          map.fitBounds(bounds)
          // Aggiungi un po' di padding
          const listener = window.google.maps.event.addListener(map, "idle", function() { 
            if (map.getZoom() > 16) map.setZoom(16); 
            window.google.maps.event.removeListener(listener); 
          })
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Errore inizializzazione mappa:', err)
        setError('Errore nel caricamento della mappa')
        setIsLoading(false)
      }
    }

    // Carica Google Maps API se non è già caricata
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeMap()
      }
      script.onerror = () => {
        setError('Impossibile caricare Google Maps')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    } else {
      initializeMap()
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [userRestaurant, competitors])

  if (error) {
    return (
      <div className="w-full h-[500px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500">
            Verifica che la Google Maps API key sia configurata correttamente
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-gray-200">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Caricamento mappa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h4 className="font-bold text-sm mb-3 text-gray-900">Legenda</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {typeof userRestaurant.rank === 'number' ? userRestaurant.rank : '?'}
            </div>
            <span className="text-gray-700">Il tuo locale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              #
            </div>
            <span className="text-gray-700">Competitor</span>
          </div>
        </div>
      </div>
    </div>
  )
}
