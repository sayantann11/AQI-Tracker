import { NextRequest, NextResponse } from 'next/server';
import { AQIDataManager } from '@/lib/providers/manager';

export const dynamic = 'force-dynamic';

const CACHE = 'public, s-maxage=300, stale-while-revalidate=600';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const allowDev = url.searchParams.get('dev') === 'true';
    const fresh = url.searchParams.get('fresh') === 'true';
    const city = url.searchParams.get('city');

    const data = await new AQIDataManager().getLatestAQI(allowDev, fresh);
    const body = city
      ? { ...data, stations: data.stations.filter((s) => s.city.toLowerCase() === city.toLowerCase()) }
      : data;

    return NextResponse.json(body, { headers: { 'Cache-Control': fresh ? 'no-store' : CACHE } });
  } catch (error: any) {
    console.error('API /api/aqi error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', timestamp: new Date().toISOString() },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
