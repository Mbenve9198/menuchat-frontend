import { NextResponse } from 'next/server';

// Get Google Places API key from environment variables
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const placeId = searchParams.get('placeId');
    
    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }

    // Se viene fornito un placeId, ottieni i dettagli specifici di quel ristorante
    if (placeId) {
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,types,price_level,rating,user_ratings_total,photos,reviews,url&key=${GOOGLE_PLACES_API_KEY}`
      );
      
      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch place details');
      }
      
      const detailsData = await detailsResponse.json();
      const details = detailsData.result;

      // Ottieni fino a 10 foto
      const photoUrls = details.photos
        ?.slice(0, 10)
        .map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        ) || [];

      // Determina il tipo di cucina dalle categorie
      const cuisineTypes = details.types
        .filter((type: string) => type.includes('cuisine') || type === 'restaurant')
        .map((type: string) => type.replace('_cuisine', '').replace('_', ' '));

      return NextResponse.json({
        restaurant: {
          id: placeId,
          name: details.name,
          address: details.formatted_address,
          phoneNumber: details.formatted_phone_number,
          website: details.website,
          openingHours: details.opening_hours?.weekday_text,
          cuisineTypes,
          location: details.geometry?.location,
          rating: details.rating,
          ratingsTotal: details.user_ratings_total,
          priceLevel: details.price_level,
          photos: photoUrls,
          googleMapsUrl: details.url,
          reviews: details.reviews
        }
      });
    }

    // Altrimenti, esegui la ricerca base
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const searchResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to fetch data from Google Places API');
    }

    const data = await searchResponse.json();
    
    // Restituisci solo le informazioni base per la lista di ricerca
    const restaurants = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry.location,
      rating: place.rating,
      ratingsTotal: place.user_ratings_total,
      photo: place.photos && place.photos.length > 0
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${
            place.photos[0].photo_reference
          }&key=${GOOGLE_PLACES_API_KEY}`
        : null,
    }));

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error('Error searching for restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to search for restaurants' },
      { status: 500 }
    );
  }
} 
    // Per ogni risultato, ottieni i dettagli completi
    const detailedRestaurants = await Promise.all(
      searchData.results.map(async (place: any) => {
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,types,price_level,rating,user_ratings_total,photos,reviews,url&key=${GOOGLE_PLACES_API_KEY}`
        );
        
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch place details');
        }
        
        const detailsData = await detailsResponse.json();
        const details = detailsData.result;

        // Ottieni fino a 10 foto
        const photoUrls = details.photos
          ?.slice(0, 10)
          .map((photo: any) => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
          ) || [];

        // Determina il tipo di cucina dalle categorie
        const cuisineTypes = details.types
          .filter((type: string) => type.includes('cuisine') || type === 'restaurant')
          .map((type: string) => type.replace('_cuisine', '').replace('_', ' '));

        return {
          id: place.place_id,
          name: details.name,
          address: details.formatted_address,
          phoneNumber: details.formatted_phone_number,
          website: details.website,
          openingHours: details.opening_hours?.weekday_text,
          cuisineTypes,
          location: place.geometry.location,
          rating: details.rating,
          ratingsTotal: details.user_ratings_total,
          priceLevel: details.price_level, // 0-4, dove 0 è economico e 4 è lusso
          photos: photoUrls,
          googleMapsUrl: details.url,
          reviews: details.reviews
        };
      })
    );

    return NextResponse.json({ restaurants: detailedRestaurants });
  } catch (error) {
    console.error('Error searching for restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to search for restaurants' },
      { status: 500 }
    );
  }
} 