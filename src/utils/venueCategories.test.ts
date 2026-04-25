import { describe, it, expect } from 'vitest';
import {
  getVenueCategories,
  buildOverpassQuery,
  haversineDistance,
  findTagForElement,
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
    expect(query).toContain('node["tourism"="museum"](around:5000,40.7,-74)');
    expect(query).toContain('out body:10');
  });

  it('uses default radius and limit', () => {
    const tags = [{ key: 'amenity', value: 'cafe', emoji: '☕', label: 'Café' }];
    const query = buildOverpassQuery(51.5, -0.1, tags);
    expect(query).toContain('around:5000,51.5,-0.1');
    expect(query).toContain('out body:10');
  });
});

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistance(40.7, -74.0, 40.7, -74.0)).toBeCloseTo(0, 0);
  });

  it('calculates distance between two points', () => {
    // NYC to roughly 1 degree away
    const dist = haversineDistance(40.7, -74.0, 41.7, -74.0);
    expect(dist).toBeGreaterThan(100_000); // ~111km
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
