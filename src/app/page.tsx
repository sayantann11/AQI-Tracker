'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAQIData } from '@/lib/hooks/useAQIData';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { PollutantCards } from '@/components/PollutantCards';
import { PollutionInsights } from '@/components/PollutionInsights';
import { LocationComparisonTable } from '@/components/LocationComparisonTable';
import { HealthAdvisory } from '@/components/HealthAdvisory';
import { AffiliateShowcase } from '@/components/AffiliateShowcase';
import { AdSlot } from '@/components/AdSlot';
import { ShareModal } from '@/components/ShareModal';
import { Footer } from '@/components/Footer';
import { AlertCircle, Sparkles, Key, RefreshCw, CheckCircle2 } from 'lucide-react';

const InteractiveMap = dynamic(
  () => import('@/components/InteractiveMap').then((m) => m.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-[#0d1219] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading interactive 3D pollution map...</p>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const {
    data,
    stations,
    filteredStations,
    unmonitoredLocalityMatch,
    currentStation,
    nearestStation,
    cities,
    selectedCity,
    setSelectedCity,
    selectedStationId,
    setSelectedStationId,
    searchQuery,
    setSearchQuery,
    favorites,
    toggleFavorite,
    requestLocation,
    isLocating,
    isLoading,
    error,
    devModeEnabled,
    setDevModeEnabled,
    refetch,
  } = useAQIData();

  const [shareModalOpen, setShareModalOpen] = useState(false);

  // When user clicks nearest station found by geolocation
  const handleNearestFound = () => {
    if (nearestStation) {
      setSelectedStationId(nearestStation.station.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d12]">
      {/* Navigation */}
      <Navigation
        onLocateMe={requestLocation}
        isLocating={isLocating}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        devModeEnabled={devModeEnabled}
        onToggleDevMode={() => setDevModeEnabled(!devModeEnabled)}
      />

      {/* Geolocation Notification Pill */}
      {nearestStation && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-4 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
          <span>
            📍 Nearest station detected:{' '}
            <strong className="text-white">{nearestStation.station.name}</strong> (
            {nearestStation.distanceKm} km away)
          </span>
          <button
            onClick={handleNearestFound}
            className="underline font-bold text-white hover:text-emerald-200 transition-colors"
          >
            Switch to this station
          </button>
        </div>
      )}

      {/* API Key Configuration / Offline Status Notice */}
      {data?.error === 'NO_API_KEY_CONFIGURED' && !devModeEnabled && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 py-3 px-4 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Live API Credentials Pending:</strong> No <code className="bg-black/30 px-1 py-0.5 rounded font-mono">DATA_GOV_IN_API_KEY</code> is set in environment.
                You can register a free key at <strong>data.gov.in</strong> or enable Developer Test Mode to preview realistic station feeds.
              </span>
            </div>
            <button
              onClick={() => setDevModeEnabled(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-semibold border border-amber-500/40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Enable Test Fixtures Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Locality Search Resolution Banner (e.g. Saket, Hauz Khas) */}
      {unmonitoredLocalityMatch && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 py-3 px-4 text-xs text-cyan-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-white uppercase tracking-wider">
                📍 {unmonitoredLocalityMatch.locality.name} ({unmonitoredLocalityMatch.locality.city}):
              </span>{' '}
              <span>
                No direct CAAQMS sensor exists at this exact point. Showing verified nearby official stations:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {unmonitoredLocalityMatch.nearestStations.map(({ station, distanceKm }) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    selectedStationId === station.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  }`}
                >
                  {station.name} ({distanceKm} km)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        {currentStation && (
          <HeroSection
            currentStation={currentStation}
            stations={stations}
            onSelectStation={(id) => setSelectedStationId(id)}
            onOpenShare={() => setShareModalOpen(true)}
          />
        )}

        {/* Sponsor Ad Placement (Leaderboard) */}
        <AdSlot slotId="hero-leaderboard-top" format="leaderboard" />

        {/* Monitored Pollutant Cards */}
        {currentStation && <PollutantCards station={currentStation} />}

        {/* Interactive 3D Delhi NCR Map */}
        <section id="interactive-map" className="py-12 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                  Interactive 3D Geospatial Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Delhi NCR Pollution Map
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  Explore verified CAAQMS monitoring stations across Delhi, Noida, Greater Noida,
                  Gurugram, Faridabad, and Ghaziabad.
                </p>
              </div>

              <div className="text-[11px] font-mono text-gray-400">
                <span>{stations.length} Monitored Points</span>
              </div>
            </div>

            <InteractiveMap
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={(id) => setSelectedStationId(id)}
              selectedCity={selectedCity}
            />
          </div>
        </section>

        {/* Regional Pollution Insights */}
        <PollutionInsights
          stations={stations}
          cities={cities}
          onSelectStation={(id) => setSelectedStationId(id)}
        />

        {/* Location Comparison Table */}
        <LocationComparisonTable
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={(id) => setSelectedStationId(id)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />

        {/* Health Advisory Section */}
        {currentStation && <HealthAdvisory category={currentStation.category} />}

        {/* Curated Clean Air Affiliate Guide */}
        <AffiliateShowcase />

        {/* SEO Educational & Locality Navigation Section */}
        <section className="py-12 border-t border-white/10 bg-[#070a0e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                AirScope Knowledge & Regional Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Delhi AQI Today: Real-Time Air Quality Across Delhi NCR
              </h2>
              <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
                AirScope India tracks continuous air quality telemetry from official CAAQMS monitoring
                stations operated by the Central Pollution Control Board (CPCB), Delhi Pollution Control
                Committee (DPCC), Uttar Pradesh PCB, and Haryana SPCB. Access hyperlocal live AQI, PM2.5,
                and PM10 readings for your neighborhood.
              </p>
            </div>

            {/* Quick Locality Jump Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-gray-400">
                Explore Hyperlocal Monitoring Stations
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                <a href="/delhi/anand-vihar" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Anand Vihar AQI →
                </a>
                <a href="/delhi/dwarka" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Dwarka Sector 8 AQI →
                </a>
                <a href="/delhi/rohini" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Rohini Sector 16 AQI →
                </a>
                <a href="/delhi/ito" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  ITO Delhi AQI →
                </a>
                <a href="/delhi/punjabi-bagh" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Punjabi Bagh AQI →
                </a>
                <a href="/delhi/rk-puram" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  R.K. Puram AQI →
                </a>
                <a href="/noida" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Noida AQI Live →
                </a>
                <a href="/noida/noida-sector-62" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Sector 62 Noida AQI →
                </a>
                <a href="/gurugram" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Gurugram AQI Live →
                </a>
                <a href="/ghaziabad" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Ghaziabad AQI Live →
                </a>
                <a href="/faridabad" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
                  Faridabad AQI Live →
                </a>
                <a href="/delhi" className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold transition-colors">
                  All 18 Delhi CAAQMS Stations →
                </a>
              </div>
            </div>

            {/* Knowledge Centre Mini Feature */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
              <a
                href="/learn/what-is-aqi"
                className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-2 group"
              >
                <span className="text-[10px] font-mono uppercase text-emerald-400">Knowledge Guide</span>
                <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  What is Indian AQI & How is it Calculated?
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Understand the CPCB formula, the eight criteria pollutants, and the maximum sub-index rule.
                </p>
              </a>

              <a
                href="/learn/pm25-vs-pm10"
                className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-2 group"
              >
                <span className="text-[10px] font-mono uppercase text-cyan-400">Particle Science</span>
                <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                  PM2.5 vs PM10: Why Fine Particles Matter
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Learn microscopic differences, why PM2.5 penetrates into the bloodstream, and which masks work.
                </p>
              </a>

              <a
                href="/learn/delhi-pollution-guide"
                className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-2 group"
              >
                <span className="text-[10px] font-mono uppercase text-amber-400">Regional Analysis</span>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                  Why Delhi Winter Smog Gets So Severe
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Atmospheric temperature inversions, wind stagnation, and seasonal stubble burning explained.
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* Bottom In-feed Ad Placement */}
        <AdSlot slotId="footer-infeed" format="in-feed" />
      </main>

      {/* Share Modal */}
      {currentStation && (
        <ShareModal
          station={currentStation}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
