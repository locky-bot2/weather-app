import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeather } from './useWeather';
import { fetchWeather } from '../utils/api';

vi.mock('../utils/api', () => ({
  fetchWeather: vi.fn(),
}));

describe('useWeather', () => {
  const mockCity = {
    id: 1,
    name: 'Paris',
    latitude: 48.85,
    longitude: 2.35,
    country: 'France',
  };

  it('starts with null weather', () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current.weather).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads weather successfully', async () => {
    const mockData = {
      current: { temperature_2m: 20, relative_humidity_2m: 50, apparent_temperature: 18, weather_code: 0, wind_speed_10m: 10 },
      daily: { time: ['2026-04-26'], weather_code: [0], temperature_2m_max: [22], temperature_2m_min: [12] },
    };
    (fetchWeather as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.loadWeather(mockCity);
    });

    expect(result.current.weather).toEqual(mockData);
    expect(result.current.selectedCity).toEqual(mockCity);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    (fetchWeather as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.loadWeather(mockCity);
    });

    expect(result.current.weather).toBeNull();
    expect(result.current.error).toBe('Failed to fetch weather data. Please try again.');
    expect(result.current.loading).toBe(false);
  });
});
