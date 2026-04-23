import { useState, useCallback } from 'react';
import { fetchWeather } from '../utils/api';
import type { GeoResult, WeatherResponse } from '../types/weather';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<GeoResult | null>(null);

  const loadWeather = useCallback(async (city: GeoResult) => {
    setLoading(true);
    setError(null);
    setSelectedCity(city);
    try {
      const data = await fetchWeather(city.latitude, city.longitude);
      setWeather(data);
      localStorage.setItem('lastCity', JSON.stringify(city));
    } catch {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, error, selectedCity, loadWeather };
}
