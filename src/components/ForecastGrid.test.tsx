import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForecastGrid from './ForecastGrid';
import type { DailyForecast } from '../types/weather';

const mockDaily: DailyForecast = {
  time: ['2026-04-26', '2026-04-27', '2026-04-28'],
  weather_code: [0, 1, 61],
  temperature_2m_max: [22, 20, 18],
  temperature_2m_min: [12, 10, 8],
};

describe('ForecastGrid', () => {
  it('renders section heading', () => {
    render(<ForecastGrid daily={mockDaily} />);
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
  });

  it('renders "Today" for first day', () => {
    render(<ForecastGrid daily={mockDaily} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders weather emojis', () => {
    render(<ForecastGrid daily={mockDaily} />);
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('renders min and max temperatures', () => {
    render(<ForecastGrid daily={mockDaily} />);
    expect(screen.getByText('12°')).toBeInTheDocument();
    expect(screen.getByText('22°')).toBeInTheDocument();
  });
});
