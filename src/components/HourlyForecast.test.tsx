import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HourlyForecast from './HourlyForecast';
import type { HourlyData } from '../types/weather';

const mockHourly: HourlyData = {
  time: [
    '2026-04-26T08:00',
    '2026-04-26T09:00',
    '2026-04-26T10:00',
    '2026-04-26T11:00',
  ],
  temperature_2m: [15, 16, 18, 20],
  apparent_temperature: [13, 14, 16, 18],
  precipitation_probability: [10, 0, 5, 40],
  weather_code: [0, 1, 2, 61],
  wind_speed_10m: [10, 12, 8, 15],
  relative_humidity_2m: [60, 55, 50, 70],
};

describe('HourlyForecast', () => {
  it('renders the section heading', () => {
    render(<HourlyForecast hourly={mockHourly} />);
    expect(screen.getByText('24-Hour Forecast')).toBeInTheDocument();
  });

  it('renders hour labels', () => {
    render(<HourlyForecast hourly={mockHourly} />);
    expect(screen.getByText('Now')).toBeInTheDocument();
  });

  it('renders temperature values', () => {
    render(<HourlyForecast hourly={mockHourly} />);
    expect(screen.getByText('15°')).toBeInTheDocument();
    expect(screen.getByText('20°')).toBeInTheDocument();
  });

  it('renders precipitation for non-zero values', () => {
    const { container } = render(<HourlyForecast hourly={mockHourly} />);
    // Check that precipitation probability text appears somewhere
    expect(container.textContent).toContain('40%');
  });

  it('renders weather emojis from weather codes', () => {
    render(<HourlyForecast hourly={mockHourly} />);
    // weather_code 0 = ☀️, 61 = 🌧️
    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(screen.getByText('🌧️')).toBeInTheDocument();
  });

  it('renders sparkline SVG', () => {
    const { container } = render(<HourlyForecast hourly={mockHourly} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders wind speed values', () => {
    render(<HourlyForecast hourly={mockHourly} />);
    const windElements = screen.getAllByText(/💨/);
    expect(windElements.length).toBe(4); // 4 hours
  });
});
