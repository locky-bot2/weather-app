import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VenueSuggestions from '../components/VenueSuggestions';

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
          fsq_id: '1',
          name: 'Central Park',
          categories: [{ id: 16032, name: 'Park' }],
          distance: 500,
          location: { formatted_address: 'New York, NY' },
          rating: 9.2,
        },
        {
          fsq_id: '2',
          name: 'Museum of Art',
          categories: [{ id: 10027, name: 'Museum' }],
          distance: 1200,
          location: { formatted_address: '5th Ave, NY' },
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText('Central Park')).toBeInTheDocument();
    expect(screen.getByText('Museum of Art')).toBeInTheDocument();
    expect(screen.getByText('9.2')).toBeInTheDocument();
  });

  it('shows weather-appropriate title', () => {
    mockedUseVenues.mockReturnValue({ venues: [], loading: true, error: null });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={61} />);
    expect(screen.getByText(/rainy day/i)).toBeInTheDocument();
  });
});
