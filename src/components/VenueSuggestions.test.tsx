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
    expect(screen.getByText(/1\.5 km/)).toBeInTheDocument();
  });

  it('renders phone number when available', () => {
    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Pizza Place',
          category: 'Restaurant',
          categoryEmoji: '🍽️',
          distance: 800,
          lat: 40.71,
          lon: -73.99,
          phone: '02-2881-2661',
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText(/02-2881-2661/)).toBeInTheDocument();
  });

  it('renders website link when available', () => {
    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Cool Museum',
          category: 'Museum',
          categoryEmoji: '🏛️',
          distance: 500,
          lat: 40.71,
          lon: -73.99,
          website: 'https://example.com',
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByLabelText('Visit website')).toBeInTheDocument();
  });

  it('renders open status when opening hours available', () => {
    // Mock Date to a known time
    const mockDate = new Date('2024-01-15T12:00:00'); // Monday noon
    vi.setSystemTime(mockDate);

    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Open Café',
          category: 'Café',
          categoryEmoji: '☕',
          distance: 300,
          lat: 40.71,
          lon: -73.99,
          openingHours: 'Mo-Fr 09:00-18:00',
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText('Open')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('renders closed status when outside opening hours', () => {
    const mockDate = new Date('2024-01-15T20:00:00'); // Monday 8pm
    vi.setSystemTime(mockDate);

    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Closed Café',
          category: 'Café',
          categoryEmoji: '☕',
          distance: 300,
          lat: 40.71,
          lon: -73.99,
          openingHours: 'Mo-Fr 09:00-18:00',
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText('Closed')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('renders neighborhood when available', () => {
    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Local Spot',
          category: 'Café',
          categoryEmoji: '☕',
          distance: 300,
          lat: 40.71,
          lon: -73.99,
          address: 'Main St',
          neighborhood: 'Downtown',
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText(/Downtown/)).toBeInTheDocument();
  });

  it('renders description when available', () => {
    mockedUseVenues.mockReturnValue({
      venues: [
        {
          id: 1,
          name: 'Fancy Place',
          category: 'Museum',
          categoryEmoji: '🏛️',
          distance: 300,
          lat: 40.71,
          lon: -73.99,
          description: 'A wonderful museum of modern art',
        },
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    expect(screen.getByText(/wonderful museum/)).toBeInTheDocument();
  });

  it('uses place name in Google Maps link', () => {
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
      ],
      loading: false,
      error: null,
    });
    render(<VenueSuggestions lat={40.7} lon={-74} weatherCode={0} />);
    const card = screen.getByText('Central Park').closest('[class*="glass-card"]');
    expect(card).toBeTruthy();
    expect(card?.getAttribute('class')).toContain('glass-card');
  });
});
