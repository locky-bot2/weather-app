import { useState, useEffect, useRef } from 'react';
import { searchCities } from '../utils/api';
import type { GeoResult } from '../types/weather';

interface Props {
  onSelect: (city: GeoResult) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setShowDropdown(cities.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const handleSelect = (city: GeoResult) => {
    setQuery(`${city.name}, ${city.country}`);
    setShowDropdown(false);
    onSelect(city);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Search any city..."
          className="w-full px-5 py-3.5 pl-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 font-light focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
        )}
      </div>
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-white/15 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
          {results.map((city) => (
            <button
              key={city.id}
              onMouseDown={() => handleSelect(city)}
              className="w-full px-5 py-3 text-left text-white/90 hover:bg-white/10 transition-colors font-light flex items-center gap-3"
            >
              <span className="text-white/40">📍</span>
              <span>{city.name}</span>
              <span className="text-white/40 text-sm ml-auto">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
