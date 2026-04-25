export interface Venue {
  id: number;
  name: string;
  category: string;
  categoryEmoji: string;
  distance: number; // meters (haversine from user lat/lon)
  address?: string;
  lat: number;
  lon: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  cuisine?: string;
  description?: string;
  neighborhood?: string;
}

export interface VenueSuggestionState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
}
