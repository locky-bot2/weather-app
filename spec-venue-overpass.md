# Weather App — Fix Venue API: Switch to Overpass (OpenStreetMap)

## Problem
Foursquare API v3 is deprecated and the new API (`places-api.foursquare.com`) is returning "Invalid request token" with the provided key. The API migration is messy.

## Solution
Replace Foursquare with **Overpass API** (OpenStreetMap). Free, no API key required, works everywhere.

## Changes Required

### API: Overpass API
- **Endpoint:** `https://overpass-api.de/api/interpreter`
- **Method:** POST
- **Body:** Overpass QL query
- **No API key needed**

### Query Format
```
[out:json][timeout:10];(
  node["amenity"="cafe"](around:5000,{lat},{lon});
  node["tourism"="museum"](around:5000,{lat},{lon});
  node["leisure"="park"](around:5000,{lat},{lon});
  ...
);out body:{limit};
```

### Weather → OSM Tag Mapping

| Weather | OSM Tags |
|---------|----------|
| Clear/Sunny (0-3) | `leisure=park`, `amenity=restaurant`+outdoor_seating, `tourism=viewpoint`, `leisure=beach_resort` |
| Rain (51-67, 80-82) | `tourism=museum`, `amenity=cafe`, `amenity=library`, `shop=mall` |
| Snow (71-77, 85-86) | `leisure=fitness_centre`, `tourism=hotel`+spa, `amenity=cinema` |
| Fog (45-48) | `amenity=cafe`, `shop=books`, `amenity=marketplace` |
| Thunderstorm (95-99) | `amenity=restaurant`, `amenity=cinema`, `tourism=museum` |
| Default | `amenity=restaurant`, `leisure=park`, `amenity=cafe` |

### Response Parsing
Overpass returns `elements[]` with: `id`, `tags.name`, `tags.amenity`/`tags.tourism`/etc, `lat`, `lon`, `tags["addr:street"]`

### Files to Modify
- `src/hooks/useVenues.ts` — Replace Foursquare fetch with Overpass API call
- `src/utils/venueCategories.ts` — Replace Foursquare category IDs with OSM tag queries
- `src/types/venue.ts` — Update Venue interface for OSM data (no fsq_id, no rating)
- `src/components/VenueSuggestions.tsx` — Update card rendering for OSM fields
- `.env.example` — Remove VITE_FOURSQUARE_API_KEY
- `src/components/VenueSuggestions.test.tsx` — Update tests
- `src/hooks/useVenues.test.ts` — Update tests
- `src/utils/venueCategories.test.ts` — Update tests

### Updated Venue Interface
```typescript
interface Venue {
  id: number;
  name: string;
  category: string;        // e.g. "Café", "Museum", "Park"
  categoryEmoji: string;   // e.g. "☕", "🏛️", "🌳"
  distance: number;        // meters (calculated from lat/lon)
  address?: string;
  lat: number;
  lon: number;
}
```

### Distance Calculation
Calculate from user's lat/lon to venue lat/lon using Haversine formula.

### Important
- Remove all Foursquare references and API key logic
- No API key needed = no .env needed for this feature
- Keep glassmorphism UI style unchanged
- Keep graceful fallback (section hidden on error/no results)
- Unit tests with ≥80% coverage
- Push to `release/venue-overpass` branch, create PR to `main`
- All existing tests must still pass
