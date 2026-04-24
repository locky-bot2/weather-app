import { useState, useEffect, useCallback } from 'react';
import type { Venue, VenueSuggestionState } from '../types/venue';
import { getVenueCategories } from '../utils/venueCategories';

const FOURSQUARE_BASE = 'https://api.foursquare.com/v3/places/search';

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

    const apiKey = import.meta.env.VITE_FOURSQUARE_API_KEY;
    if (!apiKey) return; // Gracefully hide section if no key

    const { categoryIds } = getVenueCategories(weatherCode);
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        ll: `${lat},${lon}`,
        radius: '5000',
        categories: categoryIds,
        limit: '6',
        sort: 'DISTANCE',
      });

      const res = await fetch(`${FOURSQUARE_BASE}?${params}`, {
        headers: {
          Authorization: apiKey,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error(`Foursquare API error: ${res.status}`);

      const data = await res.json();
      setVenues(data.results ?? []);
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
