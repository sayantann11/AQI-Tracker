import { NextRequest, NextResponse } from 'next/server';
import { AQIDataManager } from '@/lib/providers/manager';

export const dynamic = 'force-dynamic';

/** GET /api/location?lat=..&lng=..&name=..&city=..  -> nearest real station or a labelled model estimate */
export async function GET(request: NextRequest) {
  const p = new URL(request.url).searchParams;
  const lat = Number(p.get('lat'));
  const lng = Number(p.get('lng'));
  const name = (p.get('name') || 'Your location').slice(0, 80);
  const city = (p.get('city') || 'Delhi NCR').slice(0, 60);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ success: false, error: 'INVALID_COORDINATES' }, { status: 400 });
  }
  // This site covers India; refuse anything outside a generous India box so the API cannot be used as a free proxy
  if (lat < 6 || lat > 37.5 || lng < 67 || lng > 98) {
    return NextResponse.json({ success: false, error: 'OUTSIDE_INDIA' }, { status: 422 });
  }
  try {
    const result = await new AQIDataManager().getAQIForLocation(lat, lng, name, city);
    return NextResponse.json({ success: true, ...result }, { headers: { 'Cache-Control': 'public, s-maxage=300' } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'NO_DATA' }, { status: 502 });
  }
}
