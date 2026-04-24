import { useVenues } from '../hooks/useVenues';
import { getVenueCategories } from '../utils/venueCategories';
import type { Venue } from '../types/venue';

interface Props {
  lat: number;
  lon: number;
  weatherCode: number;
}

function VenueCard({ venue }: { venue: Venue }) {
  const primary = venue.categories[0];
  const categoryLabel = primary?.name ?? 'Place';
  const distKm = (venue.distance / 1000).toFixed(1);
  const mapsUrl = venue.geocodes?.main
    ? `https://www.google.com/maps/search/?api=1&query=${venue.geocodes.main.latitude},${venue.geocodes.main.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + (venue.location.formatted_address ?? ''))}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card p-4 flex flex-col gap-2 hover:bg-white/[0.14] hover:border-white/[0.2] transition-all duration-300 group cursor-pointer no-underline"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white/90 font-medium text-sm leading-tight group-hover:text-white transition-colors">
          {venue.name}
        </h3>
        {venue.rating != null && (
          <span className="shrink-0 bg-white/[0.15] text-white/80 text-[10px] font-semibold px-1.5 py-0.5 rounded-lg">
            {venue.rating.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-white/40 text-xs">{categoryLabel}</p>
      <div className="mt-auto flex items-center gap-3 text-white/30 text-[11px]">
        <span>{distKm} km</span>
        {venue.location.formatted_address && (
          <span className="truncate">{venue.location.formatted_address}</span>
        )}
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-4 flex flex-col gap-3 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/[0.06] rounded w-1/2" />
      <div className="h-3 bg-white/[0.06] rounded w-2/3 mt-auto" />
    </div>
  );
}

export default function VenueSuggestions({ lat, lon, weatherCode }: Props) {
  const { venues, loading, error } = useVenues(lat, lon, weatherCode);

  // Hide section if no API key, error, or no results and not loading
  if (error && venues.length === 0 && !loading) return null;
  if (!loading && venues.length === 0) return null;

  const { emoji, label } = getVenueCategories(weatherCode);

  return (
    <div className="mt-6 animate-slideUp">
      <h2 className="text-white/60 text-sm font-light tracking-wide mb-4">
        {emoji} Places to visit on a {label} day
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {!loading && venues.map((v) => <VenueCard key={v.fsq_id} venue={v} />)}
      </div>
    </div>
  );
}
