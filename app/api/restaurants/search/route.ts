import { NextResponse } from 'next/server';

// Get Google Places API key from environment variables
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key is not configured' },
        { status: 500 }
      );
    }

    // Call Google Places API to search for restaurants
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Places API');
    }

    const data = await response.json();
    
    // Format the response data
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