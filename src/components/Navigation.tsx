'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Wind, Search, Navigation2, Menu, X, BookOpen, RefreshCw } from 'lucide-react';

interface NavigationProps {
  onLocateMe?: () => void;
  isLocating?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  onLocateMe,
  isLocating,
  onRefresh,
  isRefreshing,
  searchQuery = '',
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090d12]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400/60 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Wind className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  AirScope
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 font-semibold tracking-wider">
                  India
                </span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wide hidden sm:block">
                Real-Time Air Quality Intelligence
              </p>
            </div>
          </Link>

          {/* Search Input (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Delhi, Noida, Dwarka, Anand Vihar..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full bg-[#111722] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-gray-300">
            <Link href="/#live-aqi" className="hover:text-white transition-colors">
              Live AQI
            </Link>
            <Link href="/#interactive-map" className="hover:text-white transition-colors">
              NCR Map
            </Link>
            <Link href="/#comparison" className="hover:text-white transition-colors">
              Compare Stations
            </Link>
            <Link href="/learn" className="hover:text-white text-emerald-400 flex items-center gap-1.5 transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learn AQI</span>
            </Link>
            <Link href="/#health-guide" className="hover:text-white transition-colors">
              Health Guide
            </Link>
          </nav>

          {/* Actions & Geolocation */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Refresh latest CPCB readings"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}

            {onLocateMe && (
              <button
                onClick={onLocateMe}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Detect nearest monitoring station using GPS"
              >
                <Navigation2 className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Live GPS'}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#090d12] px-4 pt-3 pb-6 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search station or locality..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-[#111722] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-300 pt-2">
            <Link
              href="/#live-aqi"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-center"
            >
              Live AQI
            </Link>
            <Link
              href="/#interactive-map"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-center"
            >
              Delhi NCR Map
            </Link>
            <Link
              href="/#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-center"
            >
              Compare Stations
            </Link>
            <Link
              href="/learn"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-center"
            >
              Learn AQI
            </Link>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>Standard: CPCB NAQI (India)</span>
            <span className="text-emerald-400 font-mono">Real-time CPCB Feed</span>
          </div>
        </div>
      )}
    </header>
  );
};
