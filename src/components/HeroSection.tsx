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
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentStation,
  stations,
  onSelectStation,
  onOpenShare,
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

  // Format timestamp in IST
  const formattedTime = new Date(currentStation.lastUpdated).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

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
                Understand the air <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  around you.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-xl font-normal leading-relaxed">
                Real-time air quality intelligence for Delhi NCR and beyond. Hyperlocal sensor streams,
                official CPCB health guidance, and interactive 3D environmental telemetry.
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
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.city} — {st.name} {st.aqi !== null ? `(AQI: ${st.aqi})` : '(Offline)'}
                    </option>
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

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    {formattedTime} IST
                  </span>
                  <span className={isStale ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
                    {isStale ? '⚠️ Delayed (>2 hrs)' : '● Real-time CPCB'}
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
