import { NextResponse } from 'next/server';
import { AQIDataManager } from '@/lib/providers/manager';

export const dynamic = 'force-dynamic';

/** Diagnostics: which providers are configured/working and how many stations each returned. No secrets. */
export async function GET() {
  const mgr = new AQIDataManager();
  const data = await mgr.getLatestAQI(false, false);
  const measured = data.stations.filter((s) => s.aqi !== null && !s.isEstimate);
  return NextResponse.json(
    {
      generatedAt: data.timestamp,
      configured: mgr.getProviderStatus(),
      sources: data.sources,
      totalStations: data.stations.length,
      measuredStations: measured.length,
      freshStations: measured.filter((s) => s.freshnessStatus === 'fresh').length,
      estimatedStations: data.stations.filter((s) => s.isEstimate).length,
      offlineStations: data.stations.filter((s) => s.aqi === null).length,
      error: data.error ?? null,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
