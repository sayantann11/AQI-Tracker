'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StationMeasurement } from '@/types/aqi';
import { Navigation2, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';

interface InteractiveMapProps {
  stations: StationMeasurement[];
  selectedStationId?: string;
  onSelectStation: (stationId: string) => void;
  selectedCity: string;
}

const DELHI_NCR_CENTER: [number, number] = [77.2167, 28.6139]; // [lng, lat]
const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  selectedCity,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const [mapError, setMapError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(selectedCity);

  useEffect(() => {
    setActiveFilter(selectedCity);
  }, [selectedCity]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: CARTO_DARK_STYLE,
        center: DELHI_NCR_CENTER,
        zoom: 9.8,
        pitch: 35,
        bearing: -10,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>, © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>, Data © CPCB',
        }),
        'bottom-right'
      );

      mapRef.current = map;

      map.on('error', (e) => {
        console.warn('MapLibre error notice:', e);
      });
    } catch (err: any) {
      console.error('Failed to initialize MapLibre GL:', err);
      setMapError('Interactive WebGL map could not load on this device.');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    stations.forEach((station) => {
      // Filter by city if selected
      if (activeFilter !== 'All' && station.city.toLowerCase() !== activeFilter.toLowerCase()) {
        return;
      }

      const el = document.createElement('div');
      const isSelected = station.id === selectedStationId;
      const color = station.category.color || '#64748b';
      const aqiText = station.aqi !== null ? station.aqi.toString() : '—';

      el.className = `station-marker cursor-pointer transition-transform duration-200 hover:scale-125 ${
        isSelected ? 'scale-125 z-30' : 'z-10'
      }`;
      el.innerHTML = `
        <div style="background-color: ${color}; box-shadow: 0 0 12px ${color}80;"
             class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/90 text-white font-mono text-xs font-bold shadow-lg">
          ${aqiText}
        </div>
      `;

      // Popup
      const popupHtml = `
        <div class="p-3 bg-[#111722] text-white rounded-lg border border-white/10 text-xs space-y-1.5 min-w-[200px]">
          <div class="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <span class="font-bold text-sm text-white/90">${station.name}</span>
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">${station.city}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-400">NAQI Reading:</span>
            <span class="font-bold font-mono px-2 py-0.5 rounded text-xs" style="background-color: ${station.category.bgColor}; color: ${station.category.textColor}; border: 1px solid ${station.category.borderColor};">
              ${station.aqi !== null ? station.aqi : 'Offline'} (${station.category.label})
            </span>
          </div>
          <div class="grid grid-cols-2 gap-1 text-[11px] pt-1">
            <div>PM2.5: <span class="font-mono text-gray-200">${station.pollutants.pm25.value !== null ? `${station.pollutants.pm25.value} µg/m³` : '—'}</span></div>
            <div>PM10: <span class="font-mono text-gray-200">${station.pollutants.pm10.value !== null ? `${station.pollutants.pm10.value} µg/m³` : '—'}</span></div>
          </div>
          <div class="text-[10px] text-gray-400 pt-1 border-t border-white/5 flex items-center justify-between">
            <span>${station.source}</span>
            <span>${station.isStale ? '⚠️ Delayed' : '● Live'}</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: false,
        className: 'airscope-custom-popup',
      }).setHTML(popupHtml);

      el.addEventListener('click', () => {
        onSelectStation(station.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current[station.id] = marker;
    });
  }, [stations, selectedStationId, activeFilter, onSelectStation]);

  // Recenter map on selected station
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStationId) return;

    const station = stations.find((s) => s.id === selectedStationId);
    if (station) {
      map.flyTo({
        center: [station.longitude, station.latitude],
        zoom: 11.5,
        speed: 1.2,
      });
      // Open popup
      const marker = markersRef.current[selectedStationId];
      if (marker && !marker.getPopup().isOpen()) {
        marker.togglePopup();
      }
    }
  }, [selectedStationId, stations]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleReset = () => {
    mapRef.current?.flyTo({
      center: DELHI_NCR_CENTER,
      zoom: 9.8,
      pitch: 35,
      bearing: -10,
    });
  };

  const citiesList = ['All', 'Delhi', 'Noida', 'Greater Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'];

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-[#0d1219] shadow-2xl">
      {mapError ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
          <p className="text-white font-medium">{mapError}</p>
          <p className="text-xs text-gray-400 max-w-md mt-1">
            Station readings remain fully accessible in the table and cards below.
          </p>
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-full" />
      )}

      {/* Floating Map Header / City Filters */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-xl bg-[#090d12]/90 backdrop-blur-md border border-white/10 shadow-lg scrollbar-none max-w-full">
          {citiesList.map((c) => (
            <button
              key={c}
              onClick={() => setActiveFilter(c)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeFilter === c
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Map Control Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-[#090d12]/90 backdrop-blur-md border border-white/10 shadow-lg">
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Recenter Delhi NCR"
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 p-2 rounded-xl bg-[#090d12]/90 backdrop-blur-md border border-white/10 text-[11px] shadow-lg">
        <span className="text-gray-400 font-semibold px-1">CPCB NAQI:</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Good (0-50)
        </div>
        <div className="flex items-center gap-1 text-lime-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" /> Satisfactory (51-100)
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> Moderate (101-200)
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> Poor (201-300)
        </div>
        <div className="flex items-center gap-1 text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Very Poor (301-400)
        </div>
        <div className="flex items-center gap-1 text-rose-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b]" /> Severe (401+)
        </div>
      </div>
    </div>
  );
};
