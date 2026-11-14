'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { StationMeasurement } from '@/types/aqi';
import {
  MapPin,
  Clock,
  Share2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const ThreeAQISphere = dynamic(
  () => import('./ThreeAQISphere').then((m) => m.ThreeAQISphere),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center pointer-events-none select-none">
        <div className="w-32 h-32 rounded-full border border-white/10 animate-pulse bg-white/5" />
      </div>
    ),
  }
);

interface HeroSectionProps {
  currentStation: StationMeasurement | null;
  stations: StationMeasurement[];
  onSelectStation: (id: string) => void;
  onOpenShare: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function formatRelativeTime(isoDateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    return 'earlier today';
  } catch {
    return 'recently';
  }
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentStation,
  stations,
  onSelectStation,
  onOpenShare,
  onRefresh,
  isRefreshing,
}) => {
  if (!currentStation) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p>Loading air quality data...</p>
      </div>
    );
  }

  const category = currentStation.category;
  const aqiValue = currentStation.aqi;
  const isStale = currentStation.isStale;
  const freshness = currentStation.freshnessStatus || (isStale ? 'stale' : 'fresh');

  // Format timestamp in IST
  const formattedTime = new Date(currentStation.lastUpdated).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  const getFreshnessBadge = () => {
    if (currentStation.isEstimate || /model/i.test(currentStation.source)) {
      return {
        label: /nearby/i.test(currentStation.source) ? 'Estimated from nearby stations' : 'Atmospheric Model Estimate',
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        dot: 'bg-cyan-400',
      };
    }
    if (currentStation.distanceKm) {
      return {
        label: `Nearest Station (${currentStation.distanceKm} km away)`,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    }
    if (currentStation.dataQualityStatus === 'sensor_offline' || aqiValue === null) {
      return {
        label: 'Temporarily Unavailable',
        color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30',
        dot: 'bg-zinc-500',
      };
    }
    switch (freshness) {
      case 'fresh':
        return {
          label: 'Live Station Reading',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'delayed':
        return {
          label: 'Delayed Observation',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'stale':
        return {
          label: 'Stale Observation',
          color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
          dot: 'bg-orange-400',
        };
      case 'unavailable':
      default:
        return {
          label: 'Temporarily Unavailable',
          color: 'text-red-400 bg-red-500/10 border-red-500/30',
          dot: 'bg-red-400',
        };
    }
  };

  const badge = getFreshnessBadge();

  return (
    <section className="relative overflow-hidden pt-8 pb-14 border-b border-white/10">
      {/* Background ambient radial glow matching category color */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-25 transition-colors duration-700"
        style={{ backgroundColor: category.color }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Headline & Key Metrics */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: category.color }} />
              <span className="font-semibold text-white">CPCB National AQI</span>
              <span className="text-gray-500">•</span>
              <span>Hyperlocal Monitoring</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Delhi NCR AQI today <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  live, by station.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-xl font-normal leading-relaxed">
                Live air quality for Delhi, Noida, Gurugram, Faridabad and Ghaziabad from official CPCB, DPCC, UPPCB and HSPCB
                stations, with health guidance for every AQI band.
              </p>
            </div>

            {/* Quick Station Selector Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Selected Monitoring Station:</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={currentStation.id}
                  onChange={(e) => onSelectStation(e.target.value)}
                  className="bg-[#111722] border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-emerald-500/60 transition-all max-w-xs"
                >
                  {Object.entries(
                    stations.reduce<Record<string, typeof stations>>((acc, st) => {
                      (acc[st.city] = acc[st.city] || []).push(st);
                      return acc;
                    }, {})
                  )
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([city, list]) => (
                      <optgroup key={city} label={city}>
                        {[...list]
                          .sort((x, y) => x.name.localeCompare(y.name))
                          .map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name}{' '}
                              {st.aqi !== null
                                ? `(AQI ${st.aqi}${st.isEstimate ? ', est.' : st.freshnessStatus === 'stale' ? ', old data' : ''})`
                                : '(Offline)'}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                </select>

                <button
                  onClick={onOpenShare}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all"
                  title="Share locality AQI card"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Share Card</span>
                </button>
              </div>
            </div>

            {currentStation.liveEstimate && (
              <p className="text-[11px] text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 max-w-xl">
                This station last reported {Math.max(1, Math.round((Date.now() - new Date(currentStation.lastUpdated).getTime()) / 3600000))} hours ago.
                Estimated right now from nearby live stations: <strong>≈{currentStation.liveEstimate.aqi} ({currentStation.liveEstimate.label})</strong>.
              </p>
            )}

            {currentStation.isEstimate && (
              <p className="text-[11px] text-cyan-300/90 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-3 py-2 max-w-xl">
                {currentStation.estimateNote || 'This value is an atmospheric model estimate, not a sensor reading.'}
              </p>
            )}

            {/* Health Statement Preview */}
            <div
              className="p-4 rounded-2xl border transition-all duration-500 max-w-xl"
              style={{
                backgroundColor: category.bgColor,
                borderColor: category.borderColor,
              }}
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: category.color }} />
                <div className="space-y-1 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: category.textColor }}>
                    Health Implication ({category.label})
                  </span>
                  <p className="text-gray-200 leading-relaxed">{category.actionAdvice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visualization + Prominent Reading Card */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            {/* 3D Particle Sphere */}
            <ThreeAQISphere aqi={aqiValue} color={category.color} />

            {/* Floating Glassmorphic AQI Badge Card */}
            <div className="w-full max-w-sm -mt-16 sm:-mt-20 p-5 rounded-2xl bg-[#0e141f]/90 backdrop-blur-xl border border-white/10 shadow-2xl space-y-3 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 font-medium">Indian National AQI</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold font-mono tracking-tight text-white">
                      {aqiValue !== null ? aqiValue : '—'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">/ 500</span>
                  </div>
                </div>

                <div
                  className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-mono border"
                  style={{
                    backgroundColor: category.bgColor,
                    color: category.textColor,
                    borderColor: category.borderColor,
                  }}
                >
                  {category.label}
                </div>
              </div>

              {/* Station Info Row */}
              <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Station:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {currentStation.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Prominent Pollutant:</span>
                  <span className="font-mono text-emerald-400 font-semibold uppercase">
                    {currentStation.prominentPollutant ? currentStation.prominentPollutant.toUpperCase() : 'PM2.5'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Observation Time:</span>
                  <span className="font-mono text-gray-300 text-[11px]">
                    {formatRelativeTime(currentStation.lastUpdated)} ({formattedTime} IST)
                  </span>
                </div>

                {isStale && (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] leading-snug flex items-start gap-1.5 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>Observation delayed &gt;2 hrs by monitoring board. Awaiting next transmission cycle.</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span className="truncate max-w-[150px]">
                    {currentStation.city}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${badge.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
