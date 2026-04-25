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
  return `[out:json][timeout:10];(${tagQueries});out body:${limit};`;
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
