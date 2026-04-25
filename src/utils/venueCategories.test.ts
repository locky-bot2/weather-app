import { describe, it, expect, vi } from 'vitest';
import {
  getVenueCategories,
  buildOverpassQuery,
  haversineDistance,
  findTagForElement,
  getVenueTypeLabel,
  isOpenNow,
} from '../utils/venueCategories';

describe('getVenueCategories', () => {
  it('returns sunny categories for clear sky (code 0)', () => {
    const result = getVenueCategories(0);
    expect(result.label).toBe('sunny');
    expect(result.emoji).toBe('☀️');
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.tags.some((t) => t.key === 'leisure' && t.value === 'park')).toBe(true);
  });

  it('returns sunny categories for mainly clear (code 1)', () => {
    expect(getVenueCategories(1).label).toBe('sunny');
  });

  it('returns sunny categories for partly cloudy (code 2)', () => {
    expect(getVenueCategories(2).label).toBe('sunny');
  });

  it('returns sunny categories for overcast (code 3)', () => {
    expect(getVenueCategories(3).label).toBe('sunny');
  });

  it('returns rainy categories for drizzle codes 51-67', () => {
    expect(getVenueCategories(51).label).toBe('rainy');
    expect(getVenueCategories(61).label).toBe('rainy');
    expect(getVenueCategories(65).label).toBe('rainy');
    expect(getVenueCategories(67).label).toBe('rainy');
  });

  it('returns rainy categories for shower codes 80-82', () => {
    expect(getVenueCategories(80).label).toBe('rainy');
    expect(getVenueCategories(82).label).toBe('rainy');
  });

  it('returns snowy categories for snow codes 71-77', () => {
    expect(getVenueCategories(71).label).toBe('snowy');
    expect(getVenueCategories(77).label).toBe('snowy');
  });

  it('returns snowy categories for snow shower codes 85-86', () => {
    expect(getVenueCategories(85).label).toBe('snowy');
    expect(getVenueCategories(86).label).toBe('snowy');
  });

  it('returns foggy categories for fog codes 45-48', () => {
    expect(getVenueCategories(45).label).toBe('foggy');
    expect(getVenueCategories(48).label).toBe('foggy');
  });

  it('returns stormy categories for thunderstorm codes 95-99', () => {
    expect(getVenueCategories(95).label).toBe('stormy');
    expect(getVenueCategories(99).label).toBe('stormy');
  });

  it('returns fallback for unknown codes', () => {
    const result = getVenueCategories(999);
    expect(result.label).toBe('fair');
    expect(result.emoji).toBe('🌤️');
  });

  it('always includes tags array', () => {
    const codes = [0, 1, 45, 51, 71, 80, 85, 95, 999];
    for (const code of codes) {
      expect(getVenueCategories(code).tags.length).toBeGreaterThan(0);
    }
  });
});

describe('buildOverpassQuery', () => {
  it('builds a valid Overpass QL query', () => {
    const tags = [
      { key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' },
      { key: 'tourism', value: 'museum', emoji: '🏛️', label: 'Museum' },
    ];
    const query = buildOverpassQuery(40.7, -74.0, tags, 5000, 10);
    expect(query).toContain('[out:json][timeout:10]');
    expect(query).toContain('node["amenity"="cafe"](around:5000,40.7,-74)');
    expect(query).toContain('out body 10');
  });

  it('uses default radius and limit', () => {
    const tags = [{ key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' }];
    const query = buildOverpassQuery(51.5, -0.1, tags);
    expect(query).toContain('out body 10');
  });
});

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistance(40.7, -74.0, 40.7, -74.0)).toBeCloseTo(0, 0);
  });

  it('calculates distance between two points', () => {
    const dist = haversineDistance(40.7, -74.0, 41.7, -74.0);
    expect(dist).toBeGreaterThan(100_000);
    expect(dist).toBeLessThan(120_000);
  });
});

describe('findTagForElement', () => {
  it('finds matching tag for element', () => {
    const tags = [
      { key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' },
      { key: 'tourism', value: 'museum', emoji: '🏛️', label: 'Museum' },
    ];
    const result = findTagForElement(tags, { amenity: 'cafe', name: 'Test' });
    expect(result?.label).toBe('Café');
  });

  it('returns undefined when no tag matches', () => {
    const tags = [
      { key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' },
    ];
    const result = findTagForElement(tags, { shop: 'supermarket' });
    expect(result).toBeUndefined();
  });
});

describe('getVenueTypeLabel', () => {
  it('returns human-friendly label for known amenity', () => {
    expect(getVenueTypeLabel('amenity', 'cafe')).toBe('Coffee Shop');
  });

  it('returns human-friendly label for known tourism', () => {
    expect(getVenueTypeLabel('tourism', 'museum')).toBe('Museum');
  });

  it('returns human-friendly label for known leisure', () => {
    expect(getVenueTypeLabel('leisure', 'park')).toBe('Park');
  });

  it('appends cuisine for restaurants', () => {
    expect(getVenueTypeLabel('amenity', 'restaurant', 'Italian')).toBe('Restaurant · Italian');
  });

  it('returns restaurant without cuisine if not provided', () => {
    expect(getVenueTypeLabel('amenity', 'restaurant')).toBe('Restaurant');
  });

  it('title-cases unknown values', () => {
    expect(getVenueTypeLabel('amenity', 'some_new_type')).toBe('Some new type');
  });

  it('appends cuisine for unknown types when cuisine provided', () => {
    expect(getVenueTypeLabel('amenity', 'unknown_type', 'Thai')).toBe('unknown_type · Thai');
  });
});

describe('isOpenNow', () => {
  it('returns null for empty string', () => {
    expect(isOpenNow('')).toBeNull();
  });

  it('returns true for 24/7', () => {
    expect(isOpenNow('24/7')).toBe(true);
  });

  it('returns true when currently within open hours', () => {
    // Monday noon, open Mo-Fr 09:00-18:00
    vi.setSystemTime(new Date('2024-01-15T12:00:00'));
    expect(isOpenNow('Mo-Fr 09:00-18:00')).toBe(true);
    vi.useRealTimers();
  });

  it('returns false when outside open hours', () => {
    // Monday 8pm, open Mo-Fr 09:00-18:00
    vi.setSystemTime(new Date('2024-01-15T20:00:00'));
    expect(isOpenNow('Mo-Fr 09:00-18:00')).toBe(false);
    vi.useRealTimers();
  });

  it('returns false on closed day', () => {
    // Saturday noon, open Mo-Fr only
    vi.setSystemTime(new Date('2024-01-13T12:00:00')); // Saturday
    expect(isOpenNow('Mo-Fr 09:00-18:00')).toBe(false);
    vi.useRealTimers();
  });

  it('handles single day format', () => {
    // Wednesday noon, open We 10:00-20:00
    vi.setSystemTime(new Date('2024-01-17T14:00:00')); // Wednesday
    expect(isOpenNow('We 10:00-20:00')).toBe(true);
    vi.useRealTimers();
  });

  it('handles multiple day segments separated by semicolons', () => {
    // Saturday 11am, Mo-Fr 09:00-18:00; Sa 10:00-14:00
    vi.setSystemTime(new Date('2024-01-13T11:00:00')); // Saturday
    expect(isOpenNow('Mo-Fr 09:00-18:00; Sa 10:00-14:00')).toBe(true);
    vi.useRealTimers();
  });
});
