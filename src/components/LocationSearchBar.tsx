'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation2, X } from 'lucide-react';
import { geocodeIndianLocation, GeocodedLocation } from '@/lib/utils/geocoding';

interface LocationSearchBarProps {
  onLocationSelected: (location: {
    name: string;
    city: string;
    latitude: number;
    longitude: number;
  }) => void;
  onLocateMe?: () => void;
  isLocating?: boolean;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  onLocationSelected,
  onLocateMe,
  isLocating,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await geocodeIndianLocation(query);
        setResults(matches);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: GeocodedLocation) => {
    setQuery(item.name);
    setIsOpen(false);
    onLocationSelected({
      name: item.name,
      city: item.city,
      latitude: item.latitude,
      longitude: item.longitude,
    });
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search any Indian locality (Saket, Hauz Khas, Kolkata, Cyber City...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full bg-[#111722] border border-white/15 rounded-2xl pl-10 pr-24 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all shadow-lg"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isLoading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}

          {onLocateMe && (
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-50"
              title="Use current GPS location"
            >
              <Navigation2 className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'GPS'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e141f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 max-h-72 overflow-y-auto">
          {results.map((item, idx) => (
            <button
              key={`${item.latitude}-${item.longitude}-${idx}`}
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-start gap-3 group"
            >
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs sm:text-sm text-white truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">
                    {item.city}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {item.displayName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e141f] border border-white/10 rounded-2xl shadow-2xl p-4 text-center text-xs text-gray-400 z-50">
          No matches found for &quot;{query}&quot;. Try typing a landmark, sector, or city name.
        </div>
      )}
    </div>
  );
};
