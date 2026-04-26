import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVenues } from './useVenues';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useVenues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty state when lat/lon/weatherCode are null', () => {
    const { result } = renderHook(() => useVenues(null, null, null));
    expect(result.current.venues).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches venues from Overpass API and returns results', async () => {
    const overpassResponse = {
      elements: [
        {
          id: 123,
          lat: 40.701,
          lon: -73.99,
          tags: { name: 'Central Park', leisure: 'park', 'addr:street': '5th Ave' },
        },
        {
          id: 456,
          lat: 40.702,
          lon: -73.98,
          tags: { name: 'Local Café', amenity: 'cafe' },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(overpassResponse),
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.venues).toHaveLength(2);
    expect(result.current.venues[0].name).toBe('Central Park');
    expect(result.current.venues[0].category).toBe('Park');
    expect(result.current.venues[0].id).toBe(123);
    expect(result.current.venues[0].lat).toBe(40.701);
    expect(result.current.venues[0].lon).toBe(-73.99);
    // Should be sorted by distance
    expect(result.current.venues[0].distance).toBeLessThanOrEqual(
      result.current.venues[1].distance
    );
  });

  it('parses additional OSM tags (phone, website, openingHours, cuisine)', async () => {
    const overpassResponse = {
      elements: [
        {
          id: 789,
          lat: 40.701,
          lon: -73.99,
          tags: {
            name: 'Italian Place',
            amenity: 'restaurant',
            phone: '02-2881-2661',
            website: 'https://example.com',
            opening_hours: 'Mo-Fr 09:00-18:00',
            cuisine: 'italian',
            description: 'Best pasta in town',
            'addr:suburb': 'Downtown',
          },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(overpassResponse),
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const venue = result.current.venues[0];
    expect(venue.phone).toBe('02-2881-2661');
    expect(venue.website).toBe('https://example.com');
    expect(venue.openingHours).toBe('Mo-Fr 09:00-18:00');
    expect(venue.cuisine).toBe('italian');
    expect(venue.description).toBe('Best pasta in town');
    expect(venue.neighborhood).toBe('Downtown');
  });

  it('uses contact:phone and contact:website as fallback', async () => {
    const overpassResponse = {
      elements: [
        {
          id: 999,
          lat: 40.701,
          lon: -73.99,
          tags: {
            name: 'Fallback Place',
            amenity: 'cafe',
            'contact:phone': '+1-555-0123',
            'contact:website': 'https://fallback.com',
          },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(overpassResponse),
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const venue = result.current.venues[0];
    expect(venue.phone).toBe('+1-555-0123');
    expect(venue.website).toBe('https://fallback.com');
  });

  it('builds address from addr:housenumber, addr:street, addr:city', async () => {
    const overpassResponse = {
      elements: [
        {
          id: 111,
          lat: 40.701,
          lon: -73.99,
          tags: {
            name: 'Address Place',
            amenity: 'cafe',
            'addr:housenumber': '42',
            'addr:street': 'Main St',
            'addr:city': 'Springfield',
          },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(overpassResponse),
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.venues[0].address).toBe('Main St, 42, Springfield');
  });

  it('sends POST request to Overpass API with correct body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ elements: [] }),
    });

    renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://overpass-api.de/api/interpreter');
    expect(options.method).toBe('POST');
    expect(options.body).toContain('data=');
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Overpass API error');
    expect(result.current.venues).toEqual([]);
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('filters out elements without a name', async () => {
    const overpassResponse = {
      elements: [
        { id: 1, lat: 40.701, lon: -73.99, tags: { leisure: 'park' } },
        { id: 2, lat: 40.702, lon: -73.98, tags: { name: 'Named Place', amenity: 'cafe' } },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(overpassResponse),
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.venues).toHaveLength(1);
    expect(result.current.venues[0].name).toBe('Named Place');
  });

  it('uses correct OSM tags for rainy weather', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ elements: [] }),
    });

    renderHook(() => useVenues(40.7, -74.0, 61));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const body = decodeURIComponent(mockFetch.mock.calls[0][1].body);
    expect(body).toContain('"tourism"="museum"');
    expect(body).toContain('"amenity"="cafe"');
  });

  it('limits results to 6 venues', async () => {
    const elements = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      lat: 40.7 + i * 0.001,
      lon: -74.0,
      tags: { name: `Place ${i}`, amenity: 'cafe' },
    }));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ elements }),
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.venues).toHaveLength(6);
  });
});
