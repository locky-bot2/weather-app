# Weather App — Venue Suggestions Feature

## Overview
After the user enters a location and sees the weather, the app suggests venues/places to visit based on current weather conditions. Clear day? Outdoor parks and rooftop bars. Raining? Museums and cafés. Cold? Hot springs and indoor attractions.

## Architecture

### API: Foursquare Places API (free tier)
- **Search endpoint:** `https://api.foursquare.com/v3/places/search`
- Requires API key (free tier: 100k calls/month)
- Headers: `Authorization: <API_KEY>`, `Accept: application/json`
- Query params: `ll={lat},{lon}`, `radius=5000`, `categories={cat}`, `limit=6`, `sort=DISTANCE`

### Weather → Category Mapping
Map WMO weather codes to Foursquare category IDs for smart suggestions:

| Weather | Categories | Foursquare Category IDs |
|---------|-----------|------------------------|
| Clear/Sunny (0-3) | Outdoor dining, Parks, Beach, Rooftop bars | `13068`, `16032`, `16003`, `13017` |
| Rain (51-67, 80-82) | Museums, Cafés, Shopping malls, Libraries | `10027`, `13034`, `17069`, `12086` |
| Snow (71-77) | Ski resorts, Hot springs, Indoor entertainment | `18017`, `10055`, `10014` |
| Fog (45-48) | Cafés, Bookstores, Indoor markets | `13034`, `12086`, `17069` |
| Thunderstorm (95-99) | Indoor dining, Cinemas, Museums | `13065`, `13029`, `10027` |

### Component Structure (additions)
```
App
├── ...existing components...
└── VenueSuggestions     — "Places to visit" section with venue cards
```

### New Files
```
src/
├── components/
│   └── VenueSuggestions.tsx    — venue cards grid
├── hooks/
│   └── useVenues.ts            — Foursquare data fetching hook
├── utils/
│   └── venueCategories.ts      — weather → category mapping
├── types/
│   └── venue.ts                — TypeScript interfaces for venue data
```

### Data Flow
1. User selects city → weather fetched (existing)
2. Weather code determines venue categories via `venueCategories.ts`
3. `useVenues` hook calls Foursquare API with lat/lon + categories
4. VenueSuggestions component renders venue cards
5. Each card shows: name, category icon, distance, address, rating (if available)

### VenueSuggestions Component Design
- Section title: "☀️ Places to visit on a sunny day" (dynamic based on weather)
- 3x2 grid of venue cards (responsive: 2 cols mobile, 3 cols desktop)
- Glassmorphism card style matching existing app theme
- Each card:
  - Venue name (bold)
  - Category label + emoji (e.g. "☕ Café")
  - Distance (e.g. "0.8 km away")
  - Address (truncated)
  - Optional: Foursquare rating badge
- Click opens venue in Foursquare/Google Maps (new tab)
- Loading skeleton while fetching
- Graceful fallback if Foursquare API fails (hide section, no error banner)

### Foursquare API Key Handling
- Store in environment variable via Vite: `VITE_FOURSQUARE_API_KEY`
- Add to `.env.example` with placeholder
- If key is missing, venue section is hidden gracefully (no crash)

### TypeScript Interfaces
```typescript
interface Venue {
  fsq_id: string;
  name: string;
  categories: { id: number; name: string; icon?: { prefix: string; suffix: string } }[];
  distance: number; // meters
  location: { formatted_address: string };
  rating?: number;
}

interface VenueSuggestionState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
}
```

## Constraints
- Follow existing app code style (TypeScript, Tailwind, glassmorphism)
- Unit tests with ≥80% coverage
- Must work alongside existing features (no regressions)
- Push to `release/venue-suggestions` branch, create PR to `main`
- All existing tests must still pass
