'use client';

import React from 'react';
import { StationMeasurement, CitySummary } from '@/types/aqi';
import { Flame, Trees, Building2, AlertTriangle, Info, TrendingUp } from 'lucide-react';

interface PollutionInsightsProps {
  stations: StationMeasurement[];
  cities: CitySummary[];
  onSelectStation: (id: string) => void;
}

export const PollutionInsights: React.FC<PollutionInsightsProps> = ({
  stations,
  cities,
  onSelectStation,
}) => {
  const activeStations = stations.filter((s) => s.aqi !== null && s.aqi > 0 && !s.isEstimate);

  if (activeStations.length === 0) return null;

  // Worst and Best Stations
  const sorted = [...activeStations].sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0));
  const worstStation = sorted[0];
  const bestStation = sorted[sorted.length - 1];

  return (
    <section id="insights" className="py-12 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
            Regional Telemetry
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Delhi NCR Pollution Insights
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            Real-time extremes and regional summary across the continuous ambient air quality network.
          </p>
        </div>

        {/* Top Cards: Most Polluted vs Least Polluted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Most Polluted */}
          {worstStation && (
            <div
              onClick={() => onSelectStation(worstStation.id)}
              className="p-6 rounded-2xl bg-[#140e14] border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer shadow-lg space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono uppercase text-rose-400 font-bold tracking-wider">
                    Highest Monitored AQI
                  </span>
                </div>
                <span className="text-[11px] font-mono text-gray-400">{worstStation.city}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                    {worstStation.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Primary: {worstStation.prominentPollutant?.toUpperCase() || 'PM2.5'} (
                    {worstStation.pollutants.pm25.value !== null
                      ? `${worstStation.pollutants.pm25.value} µg/m³`
                      : '—'}
                    )
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold font-mono text-rose-400">
                    {worstStation.aqi}
                  </span>
                  <div className="text-[10px] font-mono uppercase font-bold text-rose-300">
                    {worstStation.category.label}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Least Polluted */}
          {bestStation && (
            <div
              onClick={() => onSelectStation(bestStation.id)}
              className="p-6 rounded-2xl bg-[#0c1614] border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer shadow-lg space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Trees className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                    Lowest Monitored AQI
                  </span>
                </div>
                <span className="text-[11px] font-mono text-gray-400">{bestStation.city}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {bestStation.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Primary: {bestStation.prominentPollutant?.toUpperCase() || 'PM2.5'} (
                    {bestStation.pollutants.pm25.value !== null
                      ? `${bestStation.pollutants.pm25.value} µg/m³`
                      : '—'}
                    )
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold font-mono text-emerald-400">
                    {bestStation.aqi}
                  </span>
                  <div className="text-[10px] font-mono uppercase font-bold text-emerald-300">
                    {bestStation.category.label}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* City-Wide Averages Grid */}
        <div className="pt-2 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>NCR Regional Averages</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cities.map((city) => (
              <div
                key={city.city}
                className="p-3.5 rounded-xl bg-[#0e141f] border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs truncate">{city.city}</span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {city.activeStationCount} stn
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono" style={{ color: city.dominantCategory.textColor }}>
                    {city.avgAqi !== null ? city.avgAqi : '—'}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 uppercase">
                    {city.dominantCategory.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scientific Integrity Note */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-gray-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Scientific Integrity Note:</strong> Regional averages are calculated strictly
            from active continuous monitoring stations within municipal boundaries. Do not infer time trends from
            individual hourly observations. Highest/lowest values and averages use measured station data only. Where a
            station is offline we may show a clearly marked atmospheric-model estimate (≈), which is never included in these summaries.
          </p>
        </div>
      </div>
    </section>
  );
};
