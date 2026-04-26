import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ForecastToggle from './ForecastToggle';

describe('ForecastToggle', () => {
  it('renders both options', () => {
    render(<ForecastToggle mode="daily" onChange={() => {}} />);
    expect(screen.getByText('5-Day')).toBeInTheDocument();
    expect(screen.getByText('Hourly')).toBeInTheDocument();
  });

  it('highlights active mode', () => {
    render(<ForecastToggle mode="daily" onChange={() => {}} />);
    const dailyBtn = screen.getByText('5-Day');
    expect(dailyBtn).toHaveAttribute('aria-pressed', 'true');
    const hourlyBtn = screen.getByText('Hourly');
    expect(hourlyBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<ForecastToggle mode="daily" onChange={handleChange} />);
    fireEvent.click(screen.getByText('Hourly'));
    expect(handleChange).toHaveBeenCalledWith('hourly');
  });

  it('switches highlight when mode is hourly', () => {
    render(<ForecastToggle mode="hourly" onChange={() => {}} />);
    expect(screen.getByText('Hourly')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('5-Day')).toHaveAttribute('aria-pressed', 'false');
  });
});
