'use client';

import React from 'react';
import Link from 'next/link';
import { Wind, ExternalLink, BookOpen, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#070a0e] border-t border-white/10 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Wind className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">AirScope India</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              AirScope India is an open, high-precision air quality intelligence platform. Real-time
              continuous CAAQMS streams for Delhi NCR powered by CPCB and DPCC telemetry.
            </p>
            <p className="text-[11px] text-gray-400 italic">"Know the air around you."</p>
          </div>

          {/* Quick Locality Links: Delhi */}
          <div className="space-y-2.5">
            <span className="font-bold text-white uppercase font-mono text-[11px] tracking-wider">
              Delhi Localities
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/delhi/anand-vihar" className="hover:text-emerald-400 transition-colors">
                  Anand Vihar AQI
                </Link>
              </li>
              <li>
                <Link href="/delhi/dwarka" className="hover:text-emerald-400 transition-colors">
                  Dwarka Sector 8 AQI
                </Link>
              </li>
              <li>
                <Link href="/delhi/rohini" className="hover:text-emerald-400 transition-colors">
                  Rohini Sector 16 AQI
                </Link>
              </li>
              <li>
                <Link href="/delhi/ito" className="hover:text-emerald-400 transition-colors">
                  ITO AQI
                </Link>
              </li>
              <li>
                <Link href="/delhi/punjabi-bagh" className="hover:text-emerald-400 transition-colors">
                  Punjabi Bagh AQI
                </Link>
              </li>
              <li>
                <Link href="/delhi" className="text-emerald-400 hover:underline transition-colors font-medium">
                  All 18 Delhi CAAQMS Stations →
                </Link>
              </li>
            </ul>
          </div>

          {/* NCR Satellite Cities */}
          <div className="space-y-2.5">
            <span className="font-bold text-white uppercase font-mono text-[11px] tracking-wider">
              NCR Satellite Cities
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/noida" className="hover:text-emerald-400 transition-colors">
                  Noida AQI Live
                </Link>
              </li>
              <li>
                <Link href="/noida/noida-sector-62" className="hover:text-emerald-400 transition-colors">
                  Noida Sector 62 AQI
                </Link>
              </li>
              <li>
                <Link href="/gurugram" className="hover:text-emerald-400 transition-colors">
                  Gurugram AQI Live
                </Link>
              </li>
              <li>
                <Link href="/ghaziabad" className="hover:text-emerald-400 transition-colors">
                  Ghaziabad AQI Live
                </Link>
              </li>
              <li>
                <Link href="/faridabad" className="hover:text-emerald-400 transition-colors">
                  Faridabad AQI Live
                </Link>
              </li>
            </ul>
          </div>

          {/* Knowledge Centre */}
          <div className="space-y-2.5">
            <span className="font-bold text-white uppercase font-mono text-[11px] tracking-wider">
              Knowledge Centre
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/learn/what-is-aqi" className="hover:text-emerald-400 transition-colors">
                  What is AQI?
                </Link>
              </li>
              <li>
                <Link href="/learn/pm25-vs-pm10" className="hover:text-emerald-400 transition-colors">
                  PM2.5 vs PM10 Guide
                </Link>
              </li>
              <li>
                <Link href="/learn/indian-aqi-categories" className="hover:text-emerald-400 transition-colors">
                  India AQI Categories
                </Link>
              </li>
              <li>
                <Link href="/learn/how-aqi-is-calculated" className="hover:text-emerald-400 transition-colors">
                  How AQI is Calculated
                </Link>
              </li>
              <li>
                <Link href="/learn/air-pollution-health-effects" className="hover:text-emerald-400 transition-colors">
                  Health Effects & Masks
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-emerald-400 hover:underline transition-colors font-medium">
                  View All Guides →
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div className="space-y-2.5">
            <span className="font-bold text-white uppercase font-mono text-[11px] tracking-wider">
              Data Governance
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="https://data.gov.in/catalog/real-time-air-quality-index"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>CPCB Open Data</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://data.gov.in/government-open-data-license-india"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>GODL India License</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://cpcb.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>CPCB Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </li>
              <li>
                <Link href="/#affiliates" className="hover:text-white transition-colors">
                  Affiliate Disclosure
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory GODL Attribution & Legal Disclaimer */}
        <div className="border-t border-white/10 pt-6 space-y-2 text-[11px] text-gray-400 leading-relaxed">
          <p>
            <strong className="text-gray-300">Mandatory Data Attribution:</strong> Real-time air quality readings are
            sourced from the Continuous Ambient Air Quality Monitoring Station (CAAQMS) network published by the Central
            Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change (MoEFCC), Government of
            India, and participating State Pollution Control Boards (DPCC, UPPCB, HSPCB) via the Open Government Data (OGD)
            Platform India (data.gov.in) under the{' '}
            <a
              href="https://data.gov.in/government-open-data-license-india"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 underline underline-offset-2"
            >
              Government Open Data License – India (GODL)
            </a>
            .
          </p>
          <p>
            <strong className="text-gray-300">No Implied Endorsement:</strong> In compliance with GODL licensing conditions,
            the Government of India, CPCB, and contributing departments do not endorse AirScope India, this website, or any
            commercial products featured herein. AirScope India does not calculate fabricated interpolated readings between
            stations.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div>
            © {new Date().getFullYear()} AirScope India. Continuous CPCB NAQI Tracking for Delhi NCR.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/learn" className="hover:text-white">Knowledge Centre</Link>
            <span>•</span>
            <Link href="/delhi" className="hover:text-white">Delhi Stations</Link>
            <span>•</span>
            <Link href="/noida" className="hover:text-white">Noida Stations</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
