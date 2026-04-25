# Weather App — Improve Venue Cards

## Problems
1. Cards show minimal info: name, category, distance, address (often missing)
2. Google Maps link only uses lat/lon — not informative, shows generic pin
3. No visual distinction between venue types

## Improvements

### Card Design
- **Category emoji larger and prominent** — make it the visual anchor (left side or top-left badge)
- **Add venue type subtitle** — e.g. "Outdoor Dining" not just "Restaurant"
- **Show "Open now" indicator** if we can infer from OSM tags (`opening_hours`)
- **Add neighborhood/district** from OSM `addr:city` or `addr:suburb`
- **Phone number** from OSM `phone` or `contact:phone` — clickable `tel:` link
- **Website** from OSM `website` or `contact:website` — small icon link

### Google Maps Link
- Use **place name + address** instead of just coordinates: 
  `https://www.google.com/maps/search/?api=1&query=encodeURIComponent(name + ' ' + address)`
- This shows the actual place name, photos, reviews, hours in Google Maps

### Expanded Card Layout
```
┌─────────────────────────────────────┐
│ 🏛️  National Palace Museum          │
│     Museum · 1.2 km away            │
│     100, Sec. 2, Zhishan Rd         │
│     📞 02-2881-2661  🌐 Website     │
└─────────────────────────────────────┘
```

### OSM Tags to Extract (in useVenues.ts)
Add these to the venue parsing:
- `tags.opening_hours` → display as "Open now ✓" or "Closed" (parse with simple regex)
- `tags.phone` / `tags.contact:phone` → clickable phone link
- `tags.website` / `tags.contact:website` → external link icon
- `tags.addr:street` + `tags.addr:city` → better address
- `tags.cuisine` → show for restaurants (e.g. "Italian", "Japanese")
- `tags.description` → short description if available

### Venue Type Mapping
Map OSM amenity/tourism/leisure values to human-friendly labels:
- `amenity=restaurant` → "Restaurant" (show cuisine if available)
- `amenity=cafe` → "Coffee Shop"
- `tourism=museum` → "Museum"
- `leisure=park` → "Park"
- `amenity=cinema` → "Cinema"
- `amenity=library` → "Library"
- etc.

### Files to Modify
- `src/types/venue.ts` — Add phone, website, openingHours, cuisine, description fields
- `src/hooks/useVenues.ts` — Parse additional OSM tags
- `src/utils/venueCategories.ts` — Add human-friendly label mapping function
- `src/components/VenueSuggestions.tsx` — Redesign card with more info

### Constraints
- Keep glassmorphism style
- Keep responsive grid layout
- All existing tests must pass
- Push to `release/improve-venue-cards`, create PR to `main`
