'use client';

import React, { useState, useMemo } from 'react';
import { StationMeasurement } from '@/types/aqi';
import { Search, ArrowUpDown, Star, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface LocationComparisonTableProps {
  stations: StationMeasurement[];
  selectedStationId?: string;
  onSelectStation: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

type SortField = 'aqi' | 'name' | 'city' | 'pm25';
type SortOrder = 'asc' | 'desc';

export const LocationComparisonTable: React.FC<LocationComparisonTableProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  favorites,
  onToggleFavorite,
}) => {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('aqi');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const cities = ['All', 'Delhi', 'Noida', 'Greater Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const processedStations = useMemo(() => {
    return stations
      .filter((station) => {
        const matchesCity = cityFilter === 'All' || station.city.toLowerCase() === cityFilter.toLowerCase();
        const matchesSearch =
          !search ||
          station.name.toLowerCase().includes(search.toLowerCase()) ||
          station.city.toLowerCase().includes(search.toLowerCase());
        const matchesFav = !showFavoritesOnly || favorites.includes(station.id);
        return matchesCity && matchesSearch && matchesFav;
      })
      .sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        if (sortField === 'pm25') {
          valA = a.pollutants.pm25.value ?? -1;
          valB = b.pollutants.pm25.value ?? -1;
        } else if (sortField === 'aqi') {
          valA = a.aqi ?? -1;
          valB = b.aqi ?? -1;
        } else if (sortField === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortField === 'city') {
          valA = a.city.toLowerCase();
          valB = b.city.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [stations, cityFilter, search, showFavoritesOnly, favorites, sortField, sortOrder]);

  return (
    <section id="comparison" className="py-12 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
              Hyperlocal Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Delhi NCR Monitoring Stations
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Compare actual continuous ambient air quality stations. Real-time CPCB telemetry sorted
              by pollution severity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                showFavoritesOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorites ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* City filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  cityFilter === city
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search station or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111722] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e141f] shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#111722]/80 text-gray-400 uppercase font-mono text-[11px]">
                <th className="py-3.5 pl-4 pr-2 w-10"></th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Station Location</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('city')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>City</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aqi')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>National AQI</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Category</th>
                <th
                  onClick={() => handleSort('pm25')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PM2.5</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">PM10</th>
                <th className="py-3.5 px-4 text-center">Data Freshness</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedStations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 font-mono">
                    No matching monitoring stations found.
                  </td>
                </tr>
              ) : (
                processedStations.map((station) => {
                  const isSelected = station.id === selectedStationId;
                  const isFav = favorites.includes(station.id);
                  const cat = station.category;

                  return (
                    <tr
                      key={station.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isSelected ? 'bg-emerald-500/[0.07]' : ''
                      }`}
                    >
                      {/* Favorite Button */}
                      <td className="py-3.5 pl-4 pr-2">
                        <button
                          onClick={() => onToggleFavorite(station.id)}
                          className="text-gray-500 hover:text-amber-400 transition-colors"
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Station Name */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{station.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              Selected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 text-gray-300 font-medium">{station.city}</td>

                      {/* Numerical AQI */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                        {station.aqi !== null ? (
                          <span style={{ color: cat.textColor }}>{station.aqi}</span>
                        ) : (
                          <span className="text-gray-500">Offline</span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border inline-block"
                          style={{
                            backgroundColor: cat.bgColor,
                            color: cat.textColor,
                            borderColor: cat.borderColor,
                          }}
                        >
                          {cat.label}
                        </span>
                      </td>

                      {/* PM2.5 */}
                      <td className="py-3.5 px-4 text-right font-mono text-gray-300">
                        {station.pollutants.pm25.value !== null
                          ? `${station.pollutants.pm25.value} µg/m³`
                          : '—'}
                      </td>

                      {/* PM10 */}
                      <td className="py-3.5 px-4 text-right font-mono text-gray-300">
                        {station.pollutants.pm10.value !== null
                          ? `${station.pollutants.pm10.value} µg/m³`
                          : '—'}
                      </td>

                      {/* Freshness Status */}
                      <td className="py-3.5 px-4 text-center text-[11px]">
                        {station.isStale ? (
                          <span className="text-amber-400 flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Delayed
                          </span>
                        ) : station.dataQualityStatus === 'sensor_offline' ? (
                          <span className="text-gray-500">Offline</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Live
                          </span>
                        )}
                      </td>

                      {/* Select Station Action */}
                      <td className="py-3.5 pr-4 pl-2 text-right">
                        <button
                          onClick={() => onSelectStation(station.id)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-gray-300 hover:text-emerald-300 font-medium transition-all"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
