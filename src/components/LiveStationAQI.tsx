'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AQIApiResponse, StationMeasurement, CitySummary } from '@/types/aqi';

interface Props {
  stationId?: string;
  city?: string;
  title?: string;
}

/** Small live AQI card for SEO landing pages. Fetches /api/aqi on the client and never shows fake data. */
export const LiveStationAQI: React.FC<Props> = ({ stationId, city, title }) => {
  const [data, setData] = useState<AQIApiResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/aqi')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: AQIApiResponse) => !cancelled && setData(j))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const station: StationMeasurement | undefined = stationId ? data?.stations.find((s) => s.id === stationId) : undefined;
  const summary: CitySummary | undefined = city ? data?.cities.find((c) => c.city.toLowerCase() === city.toLowerCase()) : undefined;

  const aqi = station ? station.aqi : summary?.avgAqi ?? null;
  const cat = station ? station.category : summary?.dominantCategory;
  const when = station?.lastUpdated || summary?.lastUpdated;
  const time = when
    ? new Date(when).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })
    : null;

  return (
    <section aria-label="Live air quality" className="rounded-2xl border border-white/10 bg-[#0e141f] p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">{title || 'Live AQI right now'}</p>
        {!data && !failed && <p className="text-sm text-gray-400">Loading latest reading…</p>}
        {failed && <p className="text-sm text-amber-300">Live reading unavailable right now. Please try again shortly.</p>}
        {data && aqi === null && (
          <p className="text-sm text-gray-300">
            {station?.isEstimate ? '' : 'This station is not reporting at the moment. '}
            <Link href="/" className="text-emerald-400 hover:underline">See the live map for nearby stations</Link>.
          </p>
        )}
        {data && aqi !== null && cat && (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold font-mono text-white">{station?.isEstimate ? '≈' : ''}{aqi}</span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase border" style={{ backgroundColor: cat.bgColor, color: cat.textColor, borderColor: cat.borderColor }}>
                {cat.label}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {station ? (station.isEstimate ? 'Model estimate (station offline)' : 'Official station reading') : `Average of ${summary?.activeStationCount} reporting stations`}
              {time ? ` · updated ${time} IST` : ''}
            </p>
          </>
        )}
      </div>
      <Link href={stationId ? `/?station=${stationId}#live-aqi` : '/#live-aqi'} className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors">
        Open full live map →
      </Link>
    </section>
  );
};
