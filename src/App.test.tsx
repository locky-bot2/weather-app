import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the weather API
vi.mock('./utils/api', () => ({
  searchCities: vi.fn().mockResolvedValue([]),
  fetchWeather: vi.fn().mockResolvedValue({
    current: {
      temperature_2m: 20,
      relative_humidity_2m: 50,
      apparent_temperature: 18,
      weather_code: 0,
      wind_speed_10m: 10,
    },
    daily: {
      time: ['2026-04-26', '2026-04-27'],
      weather_code: [0, 1],
      temperature_2m_max: [22, 23],
      temperature_2m_min: [12, 13],
    },
    hourly: {
      time: ['2026-04-26T08:00', '2026-04-26T09:00'],
      temperature_2m: [20, 21],
      apparent_temperature: [18, 19],
      precipitation_probability: [0, 10],
      weather_code: [0, 1],
      wind_speed_10m: [10, 12],
      relative_humidity_2m: [50, 55],
    },
  }),
}));

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText('Atmosphère')).toBeInTheDocument();
  });

  it('shows search prompt when no weather loaded', () => {
    render(<App />);
    expect(screen.getByText('Search for a city to begin')).toBeInTheDocument();
  });
});
