import { useState, useEffect, useCallback } from 'react';
import type { Venue, VenueSuggestionState } from '../types/venue';
import {
  getVenueCategories,
  buildOverpassQuery,
  haversineDistance,
  findTagForElement,
} from '../utils/venueCategories';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

export function useVenues(
  lat: number | null,
  lon: number | null,
  weatherCode: number | null
): VenueSuggestionState {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    if (lat === null || lon === null || weatherCode === null) return;

    const { tags } = getVenueCategories(weatherCode);
    const query = buildOverpassQuery(lat, lon, tags);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

      const data = await res.json();
      const elements: OverpassElement[] = data.elements ?? [];

      const mapped: Venue[] = elements
        .filter((el) => el.tags?.name)
        .map((el) => {
          const tag = findTagForElement(tags, el.tags);
          return {
            id: el.id,
            name: el.tags.name,
            category: tag?.label ?? 'Place',
            categoryEmoji: tag?.emoji ?? '📍',
            distance: haversineDistance(lat, lon, el.lat, el.lon),
            address: el.tags['addr:street'] || el.tags['addr:city'],
            lat: el.lat,
            lon: el.lon,
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 6);

      setVenues(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch venues');
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, weatherCode]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  return { venues, loading, error };
}
