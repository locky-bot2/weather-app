import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CurrentWeather from './CurrentWeather';
import type { CurrentWeatherData, GeoResult } from '../types/weather';

const mockCurrent: CurrentWeatherData = {
  temperature_2m: 22,
  relative_humidity_2m: 55,
  apparent_temperature: 20,
  weather_code: 0,
  wind_speed_10m: 12,
};

const mockCity: GeoResult = {
  id: 1,
  name: 'Paris',
  latitude: 48.85,
  longitude: 2.35,
  country: 'France',
  admin1: 'Île-de-France',
};

describe('CurrentWeather', () => {
  it('renders city name', () => {
    render(<CurrentWeather current={mockCurrent} city={mockCity} />);
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('renders temperature', () => {
    render(<CurrentWeather current={mockCurrent} city={mockCity} />);
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('renders weather label', () => {
    render(<CurrentWeather current={mockCurrent} city={mockCity} />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('renders feels like', () => {
    render(<CurrentWeather current={mockCurrent} city={mockCity} />);
    expect(screen.getByText('20°')).toBeInTheDocument();
  });

  it('renders humidity', () => {
    render(<CurrentWeather current={mockCurrent} city={mockCity} />);
    expect(screen.getByText('55%')).toBeInTheDocument();
  });

  it('renders wind speed', () => {
    render(<CurrentWeather current={mockCurrent} city={mockCity} />);
    expect(screen.getByText('12 km/h')).toBeInTheDocument();
  });

  it('renders country when no admin1', () => {
    const city = { ...mockCity, admin1: undefined };
    render(<CurrentWeather current={mockCurrent} city={city} />);
    expect(screen.getByText('France')).toBeInTheDocument();
  });
});
