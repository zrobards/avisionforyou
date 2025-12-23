 import axios from 'axios';

export interface PlaceSearchParams {
  location: string; // "Louisville, KY"
  radius: number; // meters (16000 = 10 miles)
  type?: string; // "nonprofit", "restaurant", "store", etc.
  keyword?: string; // Additional search terms
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  totalRatings?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types: string[];
  businessStatus: string;
  priceLevel?: number;
  geometry?: {
    lat: number;
    lng: number;
  };
}

/**
 * Search for places using Google Places API
 */
export async function searchPlaces(params: PlaceSearchParams): Promise<PlaceDetails[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY environment variable is not set');
  }

  console.log('🔑 API Key configured:', apiKey ? `${apiKey.substring(0, 20)}...` : 'MISSING');
  console.log('🔑 Key length:', apiKey?.length);

  try {
    // 1. First, geocode the location to get coordinates
    console.log('📍 Step 1: Geocoding location...', params.location);
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.location)}&key=${apiKey}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    console.log('✅ Geocoding successful');

    if (!geocodeResponse.data.results?.length) {
      throw new Error(`Could not geocode location: ${params.location}`);
    }

    const location = geocodeResponse.data.results[0].geometry.location;
    
    // 2. Use NEW Places API - Text Search
    console.log('📍 Step 2: Searching places with New Places API...');
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    
    // Build text query
    const queryParts: string[] = [];
    if (params.type) queryParts.push(params.type);
    if (params.keyword) queryParts.push(params.keyword);
    queryParts.push(`in ${params.location}`);
    
    const searchBody: Record<string, any> = {
      textQuery: queryParts.join(' ')
    };
    
    // Add location bias if we have coordinates
    // Google Places API max radius is 50000 meters (31 miles)
    const clampedRadius = Math.min(params.radius || 16000, 50000);
    console.log(`📍 Using radius: ${clampedRadius}m (requested: ${params.radius}m)`);
    
    if (location.lat && location.lng) {
      searchBody.locationBias = {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng
          },
          radius: clampedRadius
        }
      };
    }
    
    // Request more results
    searchBody.maxResultCount = 20;

    console.log('📍 Search query:', searchBody.textQuery);

    const searchResponse = await axios.post(searchUrl, searchBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.types,places.businessStatus,places.priceLevel,places.location'
      }
    });

    console.log('✅ Places search successful, found:', searchResponse.data.places?.length || 0);

    if (!searchResponse.data.places) {
      return [];
    }

    // 3. Process results
    const places: PlaceDetails[] = [];
    
    for (const place of searchResponse.data.places) {
      if (!place.id) continue;

      try {
        places.push({
          placeId: place.id,
          name: place.displayName?.text || 'Unknown',
          address: place.formattedAddress || '',
          phone: place.nationalPhoneNumber,
          website: place.websiteUri,
          rating: place.rating,
          totalRatings: place.userRatingCount,
          reviews: [],
          photos: [],
          types: place.types || [],
          businessStatus: place.businessStatus || 'OPERATIONAL',
          priceLevel: place.priceLevel,
          geometry: place.location ? {
            lat: place.location.latitude,
            lng: place.location.longitude
          } : undefined
        });
      } catch (error) {
        console.error(`Failed to process place ${place.id}:`, error);
        // Continue with next place
      }
    }

    return places;
  } catch (error: any) {
    // Log detailed error info from Google
    if (error.response) {
      console.error('Error response from Google:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    console.error('Error searching places:', error.message);
    throw error;
  }
}

/**
 * Filter places by various criteria
 * For a web agency, places WITHOUT websites are actually the BEST leads!
 */
export function filterPlaces(
  places: PlaceDetails[],
  filters: {
    hasWebsite?: boolean; // true = require website, false = require NO website, undefined = don't filter
    minRating?: number;
    minReviews?: number;
    businessStatus?: string;
    prioritizeNoWebsite?: boolean; // Sort places without websites first
  }
): PlaceDetails[] {
  console.log('🔍 Applying filters:', filters);
  console.log('📊 Places before filter:', places.length);
  
  // Debug: Log website stats
  const withWebsite = places.filter(p => !!p.website).length;
  const withoutWebsite = places.filter(p => !p.website).length;
  console.log(`📊 Website stats: ${withWebsite} with website, ${withoutWebsite} without (potential leads!)`);
  
  let filtered = places.filter(place => {
    // Filter by website requirement
    if (filters.hasWebsite === true && !place.website) {
      return false; // Require website but doesn't have one
    }
    if (filters.hasWebsite === false && place.website) {
      return false; // Require NO website but has one
    }
    // If undefined, accept all

    // Filter by rating - only if filter is set and > 0
    if (filters.minRating && filters.minRating > 0) {
      if (!place.rating || place.rating < filters.minRating) {
        return false;
      }
    }

    // Filter by review count - only if filter is set and > 0
    if (filters.minReviews && filters.minReviews > 0) {
      if (!place.totalRatings || place.totalRatings < filters.minReviews) {
        return false;
      }
    }

    return true;
  });
  
  // Sort places without websites first (they're the best leads for a web agency!)
  if (filters.prioritizeNoWebsite !== false) {
    filtered = filtered.sort((a, b) => {
      const aHasWebsite = a.website ? 1 : 0;
      const bHasWebsite = b.website ? 1 : 0;
      return aHasWebsite - bHasWebsite; // Places without websites come first
    });
  }
  
  console.log(`✅ ${filtered.length} places passed filters`);
  return filtered;
}

/**
 * Get photo URL from photo reference
 */
export function getPlacePhotoUrl(
  photoReference: string,
  maxWidth: number = 400
): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}
