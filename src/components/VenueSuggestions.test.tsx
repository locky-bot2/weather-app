import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VenueSuggestions from './VenueSuggestions';

// Mock the useVenues hook
vi.mock('../hooks/useVenues', () => ({
  useVenues: vi.fn(),
}));

import { useVenues } from '../hooks/useVenues';
const mockedUseVenues = vi.mocked(useVenues);

describe('VenueSuggestions', () => {
  it('renders nothing when no venues and not loading', () => {
    mockedUseVenues.mockReturnValue({ venues: [], loading: false, error: null });
    const { container } = render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing on error with no venues', () => {
    mockedUseVenues.mockReturnValue({ venues: [], loading: false, error: 'API fail' });
    const { container } = render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders skeleton cards while loading', () => {
    mockedUseVenues.mockReturnValue({ venues: [], loading: true, error: null });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText(/Places to visit/i)).toBeInTheDocument();
  });

  it('renders venue cards when data is available', () => {
    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Central Park',
          category: 'Park',
          categoryEmoji: '🌳',
          distance: 500,
          address: '5th Ave',
          lat: 40.785,
          lon: -73.968,
        },
        {
          id: 2,
          name: 'Museum of Art',
          category: 'Museum',
          categoryEmoji: '🏛️',
          distance: 1200,
          lat: 40.78,
          lon: -73.96,
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText('Central Park')).toBeInTheDocument();
    expect(screen.getByText('Museum of Art')).toBeInTheDocument();
  });

  it('shows weather-appropriate title', () => {
    mockedUseVenues.mockReturnValue({ venues: [], loading: true, error: null });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={61} />);
    expect(screen.getByText(/rainy day/i)).toBeInTheDocument();
  });

  it('renders distance in km', () => {
    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Test Place',
          category: 'Café',
          categoryEmoji: '☕',
          distance: 1500,
          lat: 40.71,
          lon: -73.99,
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText('1.5 km')).toBeInTheDocument();
  });
});
