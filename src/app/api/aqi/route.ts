import { NextRequest, NextResponse } from 'next/server';
import { AQIDataManager } from '@/lib/providers/manager';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let allowDev = process.env.NODE_ENV === 'development';
    let cityFilter: string | null = null;

    if (request?.url) {
      try {
        const url = new URL(request.url);
        if (url.searchParams.get('dev') === 'true') {
          allowDev = true;
        }
        cityFilter = url.searchParams.get('city');
      } catch {
        // Fallback for static collection
      }
    }

    const manager = new AQIDataManager();
    const data = await manager.getLatestAQI(allowDev);

    if (cityFilter) {
      const filteredStations = data.stations.filter(
        (s) => s.city.toLowerCase() === cityFilter.toLowerCase()
      );
      return NextResponse.json({
        ...data,
        stations: filteredStations,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API route error in /api/aqi:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while fetching air quality data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
