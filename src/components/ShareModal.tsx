'use client';

import React, { useState } from 'react';
import { StationMeasurement } from '@/types/aqi';
import { X, Copy, Check, MessageSquare, Share2 } from 'lucide-react';

interface ShareModalProps {
  station: StationMeasurement;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ station, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const aqiText = station.aqi !== null ? station.aqi.toString() : 'Offline';
  const categoryLabel = station.category.label;
  const timeStr = new Date(station.lastUpdated).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  const shareText = `Current Air Quality in ${station.name}, ${station.city}:
AQI: ${aqiText} (${categoryLabel})
Primary Pollutant: ${station.prominentPollutant?.toUpperCase() || 'PM2.5'}
Updated: ${timeStr} IST via AirScope India
Know the air around you: ${typeof window !== 'undefined' ? window.location.href : 'https://airscope-india.onrender.com'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e141f] border border-white/10 p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Share Locality AQI</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Share Card Preview */}
        <div
          className="p-6 rounded-2xl border space-y-4 relative overflow-hidden shadow-inner"
          style={{
            backgroundColor: station.category.bgColor,
            borderColor: station.category.borderColor,
          }}
        >
          {/* Top Brand watermark */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-white uppercase tracking-wider">AirScope India</span>
            <span className="text-gray-300">CPCB NAQI Feed</span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-gray-300 font-medium">
              {station.city}
            </span>
            <h4 className="text-xl font-extrabold text-white">{station.name}</h4>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black font-mono text-white">{aqiText}</span>
                <span className="text-xs text-gray-300 font-mono">/ 500</span>
              </div>
              <div
                className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: station.category.bgColor,
                  color: station.category.textColor,
                  borderColor: station.category.borderColor,
                }}
              >
                {categoryLabel}
              </div>
            </div>

            <div className="text-right text-[11px] text-gray-300 font-mono space-y-1">
              <div>PM2.5: {station.pollutants.pm25.value !== null ? `${station.pollutants.pm25.value} µg/m³` : '—'}</div>
              <div>PM10: {station.pollutants.pm10.value !== null ? `${station.pollutants.pm10.value} µg/m³` : '—'}</div>
              <div className="text-gray-400">{timeStr} IST</div>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleX}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-gray-900 border border-white/20 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Post on X</span>
          </button>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied share text!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-400" />
              <span>Copy summary text & link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
