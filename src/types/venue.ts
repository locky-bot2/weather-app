export interface VenueCategory {
  id: number;
  name: string;
  icon?: {
    prefix: string;
    suffix: string;
  };
}

export interface Venue {
  fsq_id: string;
  name: string;
  categories: VenueCategory[];
  distance: number; // meters
  location: {
    formatted_address: string;
  };
  rating?: number;
  geocodes?: {
    main?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface VenueSuggestionState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
}
