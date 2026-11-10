'use client';

import React from 'react';
import { ShieldCheck, Wind, Sparkles, ExternalLink, Filter } from 'lucide-react';

interface CleanAirProduct {
  id: string;
  category: 'Air Purifier' | 'N95 Respirator' | 'Indoor AQI Monitor' | 'Replacement HEPA';
  title: string;
  brand: string;
  description: string;
  keySpecs: string[];
  approxPriceINR: string;
  affiliateUrl: string;
  bestFor: string;
}

const CLEAN_AIR_PRODUCTS: CleanAirProduct[] = [
  {
    id: 'philips-ac1215',
    category: 'Air Purifier',
    title: 'Series 1000i Smart Air Purifier',
    brand: 'Philips',
    description: 'CADR 300 m³/h with NanoProtect True HEPA filter capturing 99.97% particles down to 0.003 microns.',
    keySpecs: ['CADR: 300 m³/h', 'True HEPA H13', 'Real-time numerical PM2.5 display', 'Coverage up to 380 sq.ft'],
    approxPriceINR: '₹9,999',
    affiliateUrl: 'https://www.amazon.in/dp/B075R74347?tag=airscope-21',
    bestFor: 'Bedrooms and medium home offices during Delhi smog peak',
  },
  {
    id: 'coway-airmega-150',
    category: 'Air Purifier',
    title: 'Airmega 150 Professional Air Purifier',
    brand: 'Coway',
    description: 'Long-life Green Anti-virus True HEPA filter with patented cartridge design for easy pre-filter washing.',
    keySpecs: ['CADR: 303 m³/h', 'Green True HEPA filter (8500 hrs)', 'Smart Air Quality Indicator', 'Ultra-quiet 22dB'],
    approxPriceINR: '₹12,990',
    affiliateUrl: 'https://www.amazon.in/dp/B08GLW6ZJ7?tag=airscope-21',
    bestFor: 'Durability, long filter lifespan, and low noise sleep mode',
  },
  {
    id: '3m-9010-n95',
    category: 'N95 Respirator',
    title: '9010 Particulate N95 Face Mask (Pack of 10)',
    brand: '3M',
    description: 'NIOSH-certified N95 filtration media designed for high filtering efficiency against non-oil aerosols and PM2.5.',
    keySpecs: ['NIOSH N95 Certified', 'Electrostatically charged microfibers', 'Foldable vertical flat-fold design', 'Adjustable nose clip'],
    approxPriceINR: '₹450',
    affiliateUrl: 'https://www.amazon.in/dp/B08CRV7P3Z?tag=airscope-21',
    bestFor: 'Daily outdoor commutes and public transit in Delhi NCR',
  },
  {
    id: 'airveda-pm25-monitor',
    category: 'Indoor AQI Monitor',
    title: 'Airveda PM2.5 & PM10 Portable Air Monitor',
    brand: 'Airveda',
    description: 'High-precision laser sensor made in India with mobile app connectivity for real-time indoor air tracking.',
    keySpecs: ['Laser scattering PM2.5 & PM10 sensor', 'Calibrated against CPCB beta-attenuation monitors', 'Built-in rechargeable battery', 'Wi-Fi app sync'],
    approxPriceINR: '₹6,499',
    affiliateUrl: 'https://www.amazon.in/dp/B07CHW413M?tag=airscope-21',
    bestFor: 'Verifying that home and office air purifiers are actually working',
  },
];

export const AffiliateShowcase: React.FC = () => {
  return (
    <section id="affiliates" className="py-12 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
            Verified Clean Air Protection
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Independent Clean Air Equipment Guide
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            Tested, certified HEPA purifiers, genuine N95 respirators, and laser particulate monitors
            suited for the extreme seasonal pollution in Delhi NCR.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CLEAN_AIR_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-lg space-y-4 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {prod.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{prod.approxPriceINR}</span>
                </div>

                <div>
                  <span className="text-[11px] text-gray-400 font-medium">{prod.brand}</span>
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {prod.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">{prod.description}</p>

                {/* Specs list */}
                <ul className="space-y-1 text-[11px] text-gray-300 border-t border-white/5 pt-2">
                  {prod.keySpecs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-[10px] text-gray-400">
                  <strong className="text-gray-300">Best for:</strong> {prod.bestFor}
                </div>

                <a
                  href={prod.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-xs text-white font-medium transition-all"
                >
                  <span>Check Price & Details</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-400 leading-relaxed">
          <strong className="text-white">Affiliate Disclosure:</strong> AirScope India participates in select affiliate
          programs including the Amazon Associates Programme. If you choose to purchase clean air equipment through our
          verified links, we may receive a small referral commission at no additional cost to you. Equipment selections
          are evaluated strictly on particulate filtration efficiency (HEPA H13/H14 standards) and verified CADR performance.
        </div>
      </div>
    </section>
  );
};
