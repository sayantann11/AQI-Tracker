'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StationMeasurement, CitySummary, AQIApiResponse } from '@/types/aqi';
import { findNearestStation } from '../utils/geo';
import { CPCBProvider } from '../providers/cpcb';
import { CPCB_SAMPLE_RECORDS } from '../fixtures/cpcb-sample';
import { DELHI_NCR_STATIONS } from '../fixtures/delhi-stations';

const defaultProvider = new CPCBProvider();
const initialStations = defaultProvider.normalizeRecords(CPCB_SAMPLE_RECORDS);
const initialData: AQIApiResponse = {
  success: true,
  timestamp: new Date().toISOString(),
  source: 'Official CPCB CAAQMS Network',
  cached: false,
  stations: initialStations,
  cities: [],
  attribution: defaultProvider.attribution,
};

export function useAQIData() {
  const [data, setData] = useState<AQIApiResponse | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedStationId, setSelectedStationId] = useState<string>('delhi-anand-vihar');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [devModeEnabled, setDevModeEnabled] = useState(false);

  // Sync URL search parameters on mount (?station=... or ?q=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const stationParam = params.get('station');
        if (stationParam) {
          setSelectedStationId(stationParam);
        }
        const qParam = params.get('q');
        if (qParam) {
          setSearchQuery(qParam);
        }
      } catch {}
    }
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('airscope_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = useCallback((stationId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId];
      try {
        localStorage.setItem('airscope_favorites', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const fetchData = useCallback(async (useDevFixtures = false) => {
    setIsLoading(true);
    setError(null);

    const proxyUrl = process.env.NEXT_PUBLIC_API_PROXY_URL;
    const apiUrl = proxyUrl ? `${proxyUrl}` : `/api/aqi${useDevFixtures ? '?dev=true' : ''}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to retrieve air quality data.`);
      }
      const json: AQIApiResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.warn('Network fetch failed or unconfigured, evaluating offline fallback:', err);
      // In offline developer mode or when explicit dev mode is turned on:
      if (useDevFixtures || process.env.NODE_ENV === 'development') {
        const cpcb = new CPCBProvider();
        const sampleStations = cpcb.normalizeRecords(CPCB_SAMPLE_RECORDS);
        setData({
          success: true,
          timestamp: new Date().toISOString(),
          source: 'Developer Test Fixtures (Offline Mode)',
          cached: false,
          stations: sampleStations,
          cities: [],
          attribution: cpcb.attribution,
        });
      } else {
        setError(err.message || 'Service temporarily unavailable');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(devModeEnabled);
  }, [fetchData, devModeEnabled]);

  // Geolocation handling
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (geoErr) => {
        setIsLocating(false);
        console.warn('User denied or location unavailable:', geoErr.message);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  // Filtered stations based on city and search query
  const filteredStations = useMemo(() => {
    if (!data?.stations) return [];
    return data.stations.filter((station) => {
      const matchesCity = selectedCity === 'All' || station.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesQuery;
    });
  }, [data?.stations, selectedCity, searchQuery]);

  // Selected station measurement object
  const currentStation = useMemo(() => {
    if (!data?.stations?.length) return null;
    return (
      data.stations.find((s) => s.id === selectedStationId) ||
      data.stations.find((s) => s.aqi !== null) ||
      data.stations[0]
    );
  }, [data?.stations, selectedStationId]);

  // Nearest station calculation
  const nearestStation = useMemo(() => {
    if (!userLocation || !data?.stations?.length) return null;
    return findNearestStation(userLocation.lat, userLocation.lng, data.stations);
  }, [userLocation, data?.stations]);

  return {
    data,
    stations: data?.stations || [],
    filteredStations,
    currentStation,
    nearestStation,
    cities: data?.cities || [],
    selectedCity,
    setSelectedCity,
    selectedStationId,
    setSelectedStationId,
    searchQuery,
    setSearchQuery,
    favorites,
    toggleFavorite,
    userLocation,
    requestLocation,
    isLocating,
    isLoading,
    error,
    devModeEnabled,
    setDevModeEnabled,
    refetch: () => fetchData(devModeEnabled),
  };
}
