import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVenues } from '../hooks/useVenues';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useVenues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_FOURSQUARE_API_KEY = 'test-key';
  });

  it('returns empty state when lat/lon/weatherCode are null', () => {
    const { result } = renderHook(() => useVenues(null, null, null));
    expect(result.current.venues).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when API key is missing', () => {
    const prev = import.meta.env.VITE_FOURSQUARE_API_KEY;
    import.meta.env.VITE_FOURSQUARE_API_KEY = '' as any;
    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));
    // Empty string is falsy, so no fetch should happen
    expect(mockFetch).not.toHaveBeenCalled();
    import.meta.env.VITE_FOURSQUARE_API_KEY = prev;
  });

  it('fetches venues and returns results', async () => {
    const mockVenues = {
      results: [
        {
          fsq_id: 'abc',
          name: 'Central Park',
          categories: [{ id: 16032, name: 'Park' }],
          distance: 500,
          location: { formatted_address: 'New York, NY' },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockVenues),
    });

    const { result } = renderHook(() => useVenues(40.7, -74.0, 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.venues).toHaveLength(1);
    expect(result.current.venues[0].name).toBe('Central Park');
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

    expect(result.current.error).toBeTruthy();
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

  it('uses correct category IDs for weather code', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    });

    renderHook(() => useVenues(40.7, -74.0, 61));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('categories=');
    // Rainy weather should include museum category
    expect(url).toContain('10027');
  });
});
