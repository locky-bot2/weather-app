import { describe, it, expect } from 'vitest';
import { getVenueCategories } from '../utils/venueCategories';

describe('getVenueCategories', () => {
  it('returns sunny categories for clear sky (code 0)', () => {
    const result = getVenueCategories(0);
    expect(result.label).toBe('sunny');
    expect(result.emoji).toBe('☀️');
    expect(result.categoryIds).toContain('13068');
    expect(result.categoryIds).toContain('16032');
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

  it('always includes categoryIds string', () => {
    const codes = [0, 1, 45, 51, 71, 80, 85, 95, 999];
    for (const code of codes) {
      expect(getVenueCategories(code).categoryIds).toBeTruthy();
    }
  });
});
