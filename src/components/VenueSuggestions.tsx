import { useVenues } from '../hooks/useVenues';
import { getVenueCategories, getVenueTypeLabel, isOpenNow } from '../utils/venueCategories';
import type { Venue } from '../types/venue';

interface Props {
  lat: number;
  lon: number;
  weatherCode: number;
}

function VenueCard({ venue }: { venue: Venue }) {
  const distKm = (venue.distance / 1000).toFixed(1);
  const mapsQuery = encodeURIComponent(
    [venue.name, venue.address].filter(Boolean).join(' ')
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const openStatus = venue.openingHours ? isOpenNow(venue.openingHours) : null;

  return (
    <div
      className="glass-card p-4 flex flex-col gap-1.5 hover:bg-white/[0.14] hover:border-white/[0.2] transition-all duration-300 group cursor-pointer"
      onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
    >
      {/* Header: Emoji + Name + Open indicator */}
      <div className="flex items-start gap-2.5">
        <span className="text-2xl leading-none mt-0.5 shrink-0" aria-hidden="true">
          {venue.categoryEmoji}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-white/90 font-medium text-sm leading-tight group-hover:text-white transition-colors truncate">
            {venue.name}
          </h3>
          <p className="text-white/50 text-xs mt-0.5">
            {venue.cuisine
              ? getVenueTypeLabel(
                  venue.category === 'Place' ? 'amenity' : 'amenity',
                  venue.category === 'Place' ? 'place' : 'restaurant',
                  venue.cuisine
                )
              : venue.category}
            <span className="text-white/30 mx-1.5">·</span>
            {distKm} km
          </p>
        </div>
        {openStatus !== null && (
          <span
            className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${
              openStatus
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {openStatus ? 'Open' : 'Closed'}
          </span>
        )}
      </div>

      {/* Address + Neighborhood */}
      {(venue.address || venue.neighborhood) && (
        <p className="text-white/35 text-[11px] pl-[2.25rem] truncate">
          {venue.address}
          {venue.neighborhood && venue.address && (
            <span className="text-white/25"> · {venue.neighborhood}</span>
          )}
          {!venue.address && venue.neighborhood}
        </p>
      )}

      {/* Description */}
      {venue.description && (
        <p className="text-white/30 text-[11px] pl-[2.25rem] line-clamp-2 italic">
          {venue.description}
        </p>
      )}

      {/* Contact row */}
      {(venue.phone || venue.website) && (
        <div className="flex items-center gap-3 pl-[2.25rem] mt-0.5">
          {venue.phone && (
            <a
              href={`tel:${venue.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-white/40 hover:text-white/70 text-[11px] transition-colors no-underline flex items-center gap-1"
              aria-label={`Call ${venue.phone}`}
            >
              📞 {venue.phone}
            </a>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-white/40 hover:text-white/70 text-[11px] transition-colors no-underline flex items-center gap-1"
              aria-label="Visit website"
            >
              🌐 Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start gap-2.5">
        <div className="h-7 w-7 bg-white/10 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/[0.06] rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-white/[0.06] rounded w-2/3 pl-[2.25rem]" />
    </div>
  );
}

export default function VenueSuggestions({ lat, lon, weatherCode }: Props) {
  const { venues, loading, error } = useVenues(lat, lon, weatherCode);

  // Hide section on error with no results, or no results and not loading
  if (error && venues.length === 0 && !loading) return null;
  if (!loading && venues.length === 0) return null;

  const { emoji, label } = getVenueCategories(weatherCode);

  return (
    <div className="mt-6 animate-slideUp">
      <h2 className="text-white/60 text-sm font-light tracking-wide mb-4">
        {emoji} Places to visit on a {label} day
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        {!loading && venues.map((v) => <VenueCard key={v.id} venue={v} />)}
      </div>
    </div>
  );
}
