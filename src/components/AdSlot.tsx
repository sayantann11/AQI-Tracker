'use client';

import React from 'react';

interface AdSlotProps {
  slotId: string;
  format?: 'leaderboard' | 'rectangle' | 'in-feed';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  format = 'leaderboard',
  className = '',
}) => {
  const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  // Reserved min-height dimensions to prevent Cumulative Layout Shift (CLS)
  const formatDimensions = {
    leaderboard: 'min-h-[90px] max-w-4xl',
    rectangle: 'min-h-[250px] max-w-sm',
    'in-feed': 'min-h-[120px] max-w-2xl',
  };

  // If ads are disabled in env, return null in production, or a clean placeholder in dev
  if (!adsEnabled) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          className={`w-full mx-auto my-6 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center font-mono text-xs text-gray-400 ${formatDimensions[format]} ${className}`}
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
              [Sponsor Placement Reserved: {slotId}]
            </span>
            <p className="text-[11px] text-gray-400">
              Zero CLS reserved slot. Ads disabled by default (NEXT_PUBLIC_ENABLE_ADS=false).
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`w-full mx-auto my-6 flex items-center justify-center rounded-xl bg-[#090d12] overflow-hidden ${formatDimensions[format]} ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
