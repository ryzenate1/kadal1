'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

export interface GeoResult {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
}

interface LocationSearchInputProps {
  placeholder?: string;
  onSelect: (result: GeoResult) => void;
  className?: string;
  autoFocus?: boolean;
}

// Photon — Komoot's open geocoder, powered by OSM, no API key ever needed
// Excellent coverage of Tamil Nadu, Chennai, and all Indian cities
async function photonSearch(query: string): Promise<GeoResult[]> {
  try {
    const url =
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en` +
      `&bbox=76.0,8.0,80.9,13.5`; // Bias to Tamil Nadu bounding box
    const res = await fetch(url);
    if (!res.ok) throw new Error('Photon error');
    const data = await res.json();

    return (data.features || []).map((f: any) => {
      const p = f.properties;
      const parts: string[] = [];
      if (p.name) parts.push(p.name);
      if (p.street) parts.push(p.street);
      if (p.district || p.suburb) parts.push(p.district || p.suburb);
      if (p.city || p.town || p.village) parts.push(p.city || p.town || p.village);
      if (p.state) parts.push(p.state);
      if (p.country) parts.push(p.country);

      return {
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        address: parts.join(', ') || `${f.geometry.coordinates[1].toFixed(5)}, ${f.geometry.coordinates[0].toFixed(5)}`,
        city: p.city || p.town || p.village || '',
        state: p.state || '',
        country: p.country || 'India',
      };
    });
  } catch {
    return [];
  }
}

export function LocationSearchInput({
  placeholder = 'Search area, street, landmark...',
  onSelect,
  className = '',
  autoFocus = false,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 3) {
        setResults([]);
        setOpen(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        const found = await photonSearch(value.trim());
        setResults(found);
        setOpen(found.length > 0);
        setLoading(false);
      }, 350);
    },
    []
  );

  const handleSelect = (result: GeoResult) => {
    setQuery(result.address.split(',').slice(0, 2).join(', '));
    setResults([]);
    setOpen(false);
    onSelect(result);
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-200"
          autoComplete="off"
          autoFocus={autoFocus}
        />
        {loading && (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-gray-400" />
        )}
        {!loading && query && (
          <button onClick={clear} className="absolute right-3 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {r.address.split(',')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {r.address.split(',').slice(1, 3).join(',').trim()}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationSearchInput;
