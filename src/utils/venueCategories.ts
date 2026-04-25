export interface OsmTag {
  key: string;
  value: string;
  emoji: string;
  label: string;
}

export interface CategorySuggestion {
  tags: OsmTag[];
  emoji: string;
  label: string;
}

const SUNNY_TAGS: OsmTag[] = [
  { key: 'leisure', value: 'park', emoji: '🌳', label: 'Park' },
  { key: 'amenity', value: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { key: 'tourism', value: 'viewpoint', emoji: '🏞️', label: 'Viewpoint' },
  { key: 'leisure', value: 'beach_resort', emoji: '🏖️', label: 'Beach Resort' },
];

const RAINY_TAGS: OsmTag[] = [
  { key: 'tourism', value: 'museum', emoji: '🏛️', label: 'Museum' },
  { key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' },
  { key: 'amenity', value: 'library', emoji: '📚', label: 'Library' },
  { key: 'shop', value: 'mall', emoji: '🛍️', label: 'Mall' },
];

const SNOWY_TAGS: OsmTag[] = [
  { key: 'leisure', value: 'fitness_centre', emoji: '🏋️', label: 'Fitness Centre' },
  { key: 'amenity', value: 'cinema', emoji: '🎬', label: 'Cinema' },
  { key: 'tourism', value: 'hotel', emoji: '🏨', label: 'Hotel' },
];

const FOGGY_TAGS: OsmTag[] = [
  { key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' },
  { key: 'shop', value: 'books', emoji: '📖', label: 'Bookstore' },
  { key: 'amenity', value: 'marketplace', emoji: '🏪', label: 'Marketplace' },
];

const STORMY_TAGS: OsmTag[] = [
  { key: 'amenity', value: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { key: 'amenity', value: 'cinema', emoji: '🎬', label: 'Cinema' },
  { key: 'tourism', value: 'museum', emoji: '🏛️', label: 'Museum' },
];

const DEFAULT_TAGS: OsmTag[] = [
  { key: 'amenity', value: 'restaurant', emoji: '🍽️', label: 'Restaurant' },
  { key: 'leisure', value: 'park', emoji: '🌳', label: 'Park' },
  { key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' },
];

export function getVenueCategories(weatherCode: number): CategorySuggestion {
  if (weatherCode >= 0 && weatherCode <= 3) {
    return { tags: SUNNY_TAGS, emoji: '☀️', label: 'sunny' };
  }

  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return { tags: RAINY_TAGS, emoji: '🌧️', label: 'rainy' };
  }

  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86
  ) {
    return { tags: SNOWY_TAGS, emoji: '🌨️', label: 'snowy' };
  }

  if (weatherCode >= 45 && weatherCode <= 48) {
    return { tags: FOGGY_TAGS, emoji: '🌫️', label: 'foggy' };
  }

  if (weatherCode >= 95 && weatherCode <= 99) {
    return { tags: STORMY_TAGS, emoji: '⛈️', label: 'stormy' };
  }

  return { tags: DEFAULT_TAGS, emoji: '🌤️', label: 'fair' };
}

/** Build an Overpass QL query from OSM tags */
export function buildOverpassQuery(
  lat: number,
  lon: number,
  tags: OsmTag[],
  radius = 5000,
  limit = 10
): string {
  const tagQueries = tags
    .map((t) => `node["${t.key}"="${t.value}"](around:${radius},${lat},${lon});`)
    .join('\n');
  return `[out:json][timeout:10];(${tagQueries});out body ${limit};`;
}

/** Haversine distance in meters between two lat/lon points */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Human-friendly label mapping for OSM amenity/tourism/leisure values */
export function getVenueTypeLabel(
  key: string,
  value: string,
  cuisine?: string
): string {
  const labels: Record<string, Record<string, string>> = {
    amenity: {
      restaurant: cuisine ? `Restaurant · ${cuisine}` : 'Restaurant',
      cafe: 'Coffee Shop',
      cinema: 'Cinema',
      library: 'Library',
      marketplace: 'Marketplace',
      fitness_centre: 'Fitness Centre',
      bar: 'Bar',
      pub: 'Pub',
      fast_food: 'Fast Food',
      theatre: 'Theatre',
      nightclub: 'Nightclub',
      bank: 'Bank',
      pharmacy: 'Pharmacy',
      hospital: 'Hospital',
      parking: 'Parking',
      fuel: 'Gas Station',
      place_of_worship: 'Place of Worship',
    },
    tourism: {
      museum: 'Museum',
      viewpoint: 'Viewpoint',
      hotel: 'Hotel',
      hostel: 'Hostel',
      attraction: 'Attraction',
      artwork: 'Artwork',
      gallery: 'Gallery',
    },
    leisure: {
      park: 'Park',
      beach_resort: 'Beach Resort',
      fitness_centre: 'Fitness Centre',
      playground: 'Playground',
      garden: 'Garden',
      sports_centre: 'Sports Centre',
      swimming_pool: 'Swimming Pool',
    },
    shop: {
      mall: 'Mall',
      books: 'Bookstore',
      supermarket: 'Supermarket',
      bakery: 'Bakery',
      clothes: 'Clothing Store',
    },
  };

  return labels[key]?.[value] ?? (cuisine ? `${value} · ${cuisine}` : value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '));
}

/** Check if venue is currently open based on OSM opening_hours string */
export function isOpenNow(openingHours: string): boolean | null {
  if (!openingHours) return null;

  // Simple check for common formats like "Mo-Fr 09:00-18:00; Sa 10:00-14:00"
  const now = new Date();
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = days[now.getDay()];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentMinutes = currentHour * 60 + currentMinute;

  // Check for 24/7
  if (openingHours.toLowerCase().includes('24/7')) return true;

  // Split by semicolons to get individual day ranges
  const segments = openingHours.split(';').map((s) => s.trim());

  for (const segment of segments) {
    // Match pattern like "Mo-Fr 09:00-18:00" or "Sa 10:00-14:00"
    const dayMatch = segment.match(/^([A-Za-z]{2})(?:-([A-Za-z]{2}))?/);
    if (!dayMatch) continue;

    const startDay = dayMatch[1];
    const endDay = dayMatch[2] || startDay;

    // Check if today is in range
    const startIndex = days.indexOf(startDay);
    const endIndex = days.indexOf(endDay);
    const todayIndex = days.indexOf(today);

    if (startIndex === -1 || endIndex === -1 || todayIndex === -1) continue;

    let dayInRange = false;
    if (startIndex <= endIndex) {
      dayInRange = todayIndex >= startIndex && todayIndex <= endIndex;
    } else {
      // Wraps around (e.g., Fr-Mo)
      dayInRange = todayIndex >= startIndex || todayIndex <= endIndex;
    }

    if (!dayInRange) continue;

    // Extract time ranges
    const timeMatches = segment.matchAll(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/g);
    for (const tm of timeMatches) {
      const openMinutes = parseInt(tm[1]) * 60 + parseInt(tm[2]);
      const closeMinutes = parseInt(tm[3]) * 60 + parseInt(tm[4]);
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return true;
      }
    }
  }

  // If we found matching day segments but no matching time, it's closed
  return false;
}

/** Find the matching OsmTag for a given OSM element key/value */
export function findTagForElement(
  tags: OsmTag[],
  elementTags: Record<string, string>
): OsmTag | undefined {
  for (const t of tags) {
    if (elementTags[t.key] === t.value) return t;
  }
  return undefined;
}
