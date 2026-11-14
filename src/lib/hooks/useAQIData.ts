'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { StationMeasurement, AQIApiResponse } from '@/types/aqi';
import { findNearestStation, resolveLocalityOrStation } from '../utils/geo';
import { reverseGeocodeIndianCoordinates, ReverseGeocodedResult } from '../utils/geocoding';

export interface UserLocationState extends Partial<ReverseGeocodedResult> {
  lat: number;
  lng: number;
}

export interface GeolocationErrorState {
  type: 'denied' | 'unavailable' | 'timeout';
  message: string;
}

const DEFAULT_STATION = 'delhi-anand-vihar';
const REFRESH_MS = 10 * 60 * 1000;

const isReal = (s: StationMeasurement) => s.aqi !== null && !s.isEstimate;

export function useAQIData() {
  // Start empty on both server and client so hydration always matches; real data arrives via fetch.
  const [data, setData] = useState<AQIApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedStationId, setSelectedStationId] = useState<string>(DEFAULT_STATION);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocationState | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<GeolocationErrorState | null>(null);
  const [hasPromptedLocation, setHasPromptedLocation] = useState(true);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  // Stations created for searched places / GPS (model estimates). Kept separate and immutable.
  const [extraStations, setExtraStations] = useState<StationMeasurement[]>([]);

  const geoRequestIdRef = useRef(0);
  const dataRef = useRef<AQIApiResponse | null>(null);
  dataRef.current = data;

  const writeUrl = useCallback((params: Record<string, string | null>) => {
    try {
      const url = new URL(window.location.href);
      for (const [k, v] of Object.entries(params)) {
        if (v === null) url.searchParams.delete(k);
        else url.searchParams.set(k, v);
      }
      window.history.pushState({}, '', url.toString());
    } catch {}
  }, []);

  const updateStationId = useCallback(
    (id: string) => {
      setSelectedStationId(id);
      setLocationNotice(null);
      writeUrl({ station: id, loc: null });
    },
    [writeUrl]
  );

  const fetchData = useCallback(async (bypassCache = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(bypassCache ? '/api/aqi?fresh=true' : '/api/aqi', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AQIApiResponse = await res.json();
      setData(json);
      setError(json.success ? null : json.error || 'UPSTREAM_UNAVAILABLE');
    } catch (err: any) {
      // Never swap in fake data. Keep whatever real data we already have and tell the user.
      setError(err?.message || 'NETWORK_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Resolve any coordinates to a real station (<= 8 km) or a labelled model estimate via the server. */
  const selectLocation = useCallback(
    async (lat: number, lng: number, name: string, city: string) => {
      setLocationNotice(null);
      try {
        const res = await fetch(
          `/api/location?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}&name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}`
        );
        if (res.status === 422) {
          setLocationNotice('This tracker covers India. Please search for a place in India.');
          return;
        }
        const json = await res.json();
        if (!json?.success || !json.primary) throw new Error('no data');
        const primary: StationMeasurement = json.primary;

        if (json.isEstimate) {
          setExtraStations((prev) => [primary, ...prev.filter((s) => s.id !== primary.id)].slice(0, 5));
          setSelectedStationId(primary.id);
          writeUrl({ station: null, loc: `${lat.toFixed(4)},${lng.toFixed(4)},${name}` });
          setLocationNotice(`No official monitor right at ${name}. ${primary.estimateNote || 'Showing an estimate for this spot.'}`);
        } else {
          // keep the resolved station selectable even if this browser's copy of the list has a different id/snapshot
          if (!dataRef.current?.stations.some((s) => s.id === primary.id)) {
            setExtraStations((prev) => [primary, ...prev.filter((s) => s.id !== primary.id)].slice(0, 5));
          }
          setSelectedStationId(primary.id);
          writeUrl({ station: primary.id, loc: null });
          setLocationNotice(
            `Showing ${primary.name}, the nearest official station to ${name}${primary.distanceKm ? ` (${primary.distanceKm} km away)` : ''}.`
          );
        }
      } catch {
        setLocationNotice('Could not get air quality for that place right now. Please try another location.');
      }
    },
    [writeUrl]
  );

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.geolocation) {
      setGeoError({ type: 'unavailable', message: 'Geolocation is not supported by your browser. Please search for your locality manually.' });
      return;
    }
    setIsLocating(true);
    setGeoError(null);
    geoRequestIdRef.current += 1;
    const reqId = geoRequestIdRef.current;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (geoRequestIdRef.current !== reqId) return;
        setHasPromptedLocation(true);
        try { localStorage.setItem('airscope_geo_allowed', 'true'); } catch {}
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let info: Partial<ReverseGeocodedResult> = {};
        try { info = await reverseGeocodeIndianCoordinates(lat, lng); } catch {}
        if (geoRequestIdRef.current !== reqId) return;
        setUserLocation({ lat, lng, ...info });
        await selectLocation(lat, lng, info.locality || 'Your location', info.city || 'Delhi NCR');
        if (geoRequestIdRef.current === reqId) setIsLocating(false);
      },
      (geoErr) => {
        if (geoRequestIdRef.current !== reqId) return;
        setIsLocating(false);
        setHasPromptedLocation(true);
        let type: GeolocationErrorState['type'] = 'unavailable';
        let message = 'Location detection unavailable. Please search manually.';
        if (geoErr.code === 1) {
          type = 'denied';
          message = 'Location permission was denied. You can search for your locality or station in the search bar above.';
          try { localStorage.setItem('airscope_geo_allowed', 'denied'); } catch {}
        } else if (geoErr.code === 2) {
          message = 'Your position could not be determined. Please search for your locality.';
        } else if (geoErr.code === 3) {
          type = 'timeout';
          message = 'Location request timed out. Please try again or search manually.';
        }
        setGeoError({ type, message });
      },
      { timeout: 12000, enableHighAccuracy: false, maximumAge: 5 * 60 * 1000 }
    );
  }, [selectLocation]);

  // One-time client init: URL params, stored preferences, favourites
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const stationParam = params.get('station');
      const locParam = params.get('loc');
      if (stationParam) setSelectedStationId(stationParam);
      const q = params.get('q');
      if (q) setSearchQuery(q);

      const stored = localStorage.getItem('airscope_geo_allowed');
      if (!stored) setHasPromptedLocation(false);
      else if (stored === 'true' && !stationParam && !locParam) requestLocation();

      if (locParam) {
        const [la, ln, ...rest] = locParam.split(',');
        const lat = Number(la);
        const lng = Number(ln);
        if (Number.isFinite(lat) && Number.isFinite(lng)) selectLocation(lat, lng, rest.join(',') || 'Your location', 'Delhi NCR');
      }
      const saved = localStorage.getItem('airscope_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}

    const onPop = () => {
      const p = new URLSearchParams(window.location.search).get('station');
      if (p) setSelectedStationId(p);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData(false);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchData(false);
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [fetchData]);

  const toggleFavorite = useCallback((stationId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId];
      try { localStorage.setItem('airscope_favorites', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const stations = useMemo(() => [...extraStations, ...(data?.stations || [])], [extraStations, data?.stations]);

  const searchResolution = useMemo(() => {
    const cityFiltered = stations.filter((s) => selectedCity === 'All' || s.city.toLowerCase() === selectedCity.toLowerCase());
    return resolveLocalityOrStation(searchQuery, cityFiltered);
  }, [stations, selectedCity, searchQuery]);

  const currentStation = useMemo(() => {
    if (!stations.length) return null;
    return (
      stations.find((s) => s.id === selectedStationId) ||
      stations.find(isReal) ||
      stations[0]
    );
  }, [stations, selectedStationId]);

  const nearestStation = useMemo(() => {
    if (!userLocation) return null;
    const real = stations.filter(isReal);
    return real.length ? findNearestStation(userLocation.lat, userLocation.lng, real) : null;
  }, [userLocation, stations]);

  return {
    data,
    stations,
    filteredStations: searchResolution.matchedStations,
    unmonitoredLocalityMatch: searchResolution.unmonitoredMatch,
    currentStation,
    nearestStation,
    cities: data?.cities || [],
    selectedCity,
    setSelectedCity,
    selectedStationId,
    setSelectedStationId: updateStationId,
    searchQuery,
    setSearchQuery,
    favorites,
    toggleFavorite,
    userLocation,
    requestLocation,
    selectLocation,
    locationNotice,
    clearLocationNotice: () => setLocationNotice(null),
    isLocating,
    geoError,
    clearGeoError: () => setGeoError(null),
    hasPromptedLocation,
    dismissLocationPrompt: () => {
      setHasPromptedLocation(true);
      try { localStorage.setItem('airscope_geo_allowed', 'dismissed'); } catch {}
    },
    isLoading,
    error,
    refetch: (bypassCache = false) => fetchData(bypassCache),
  };
}
