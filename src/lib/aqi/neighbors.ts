import { StationMeasurement, PollutantId, PollutantReading } from '@/types/aqi';
import { calculateNationalAQI, calculateSubIndex } from './calculator';
import { getAQICategory } from './category';
import { calculateDistanceKm } from '../utils/geo';

export interface NeighborTarget {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  agency?: string;
  address?: string;
}

export interface NeighborOptions {
  radiusKm?: number;
  maxStations?: number;
  maxAgeHours?: number;
}

const META: Record<PollutantId, { name: string; formula: string; unit: string }> = {
  pm25: { name: 'Fine Particles', formula: 'PM2.5', unit: 'µg/m³' },
  pm10: { name: 'Coarse Particles', formula: 'PM10', unit: 'µg/m³' },
  no2: { name: 'Nitrogen Dioxide', formula: 'NO₂', unit: 'µg/m³' },
  so2: { name: 'Sulphur Dioxide', formula: 'SO₂', unit: 'µg/m³' },
  co: { name: 'Carbon Monoxide', formula: 'CO', unit: 'mg/m³' },
  o3: { name: 'Ozone', formula: 'O₃', unit: 'µg/m³' },
  nh3: { name: 'Ammonia', formula: 'NH₃', unit: 'µg/m³' },
};
const IDS = Object.keys(META) as PollutantId[];

/**
 * Inverse-distance-weighted estimate from the nearest reporting stations (1/d² weights).
 * Pollutant concentrations are interpolated first and the CPCB AQI is computed from them,
 * so the result is always a valid NAQI. Returns null when no usable station is in range.
 */
export function estimateFromNeighbors(
  target: NeighborTarget,
  stations: StationMeasurement[],
  opts: NeighborOptions = {}
): StationMeasurement | null {
  const radiusKm = opts.radiusKm ?? 15;
  const maxStations = opts.maxStations ?? 3;
  const maxAgeMs = (opts.maxAgeHours ?? 6) * 3600 * 1000;
  const now = Date.now();

  const near = stations
    .filter((s) => s.aqi !== null && !s.isEstimate && s.id !== target.id)
    .filter((s) => now - (Date.parse(s.lastUpdated) || 0) <= maxAgeMs)
    .map((s) => ({ s, d: calculateDistanceKm(target.latitude, target.longitude, s.latitude, s.longitude) }))
    .filter((x) => x.d <= radiusKm)
    .sort((a, b) => a.d - b.d)
    .slice(0, maxStations);
  if (near.length === 0) return null;

  const w = (d: number) => 1 / Math.max(d, 0.5) ** 2;
  const conc: Partial<Record<PollutantId, number | null>> = {};
  const pollutants = {} as Record<PollutantId, PollutantReading>;
  for (const id of IDS) {
    let num = 0;
    let den = 0;
    for (const { s, d } of near) {
      const v = s.pollutants[id]?.value;
      if (typeof v === 'number') {
        num += w(d) * v;
        den += w(d);
      }
    }
    const value = den > 0 ? Math.round((num / den) * (id === 'co' ? 100 : 10)) / (id === 'co' ? 100 : 10) : null;
    conc[id] = value;
    pollutants[id] = {
      id, ...META[id], value,
      subIndex: value === null ? null : calculateSubIndex(id, value),
      isAvailable: value !== null,
      pollutantStatus: value === null ? 'not_monitored' : 'available',
    };
  }

  const result = calculateNationalAQI(conc);
  if (result.aqi === null) return null;

  const oldest = Math.min(...near.map((x) => Date.parse(x.s.lastUpdated) || now));
  const list = near.map((x) => `${x.s.name} (${x.d.toFixed(1)} km)`).join(', ');
  return {
    id: target.id,
    name: target.name,
    city: target.city,
    state: target.state,
    latitude: target.latitude,
    longitude: target.longitude,
    aqi: result.aqi,
    aqiStandard: 'IN_NAQI',
    category: getAQICategory(result.aqi),
    prominentPollutant: result.prominentPollutant,
    pollutants,
    lastUpdated: new Date(oldest).toISOString(),
    fetchedAt: new Date().toISOString(),
    isStale: false,
    freshnessStatus: 'fresh',
    stationStatus: 'not_reporting',
    source: 'Nearby stations (distance-weighted estimate)',
    agency: target.agency,
    address: target.address,
    dataQualityStatus: 'model_estimate',
    isEstimate: true,
    distanceKm: Math.round(near[0].d * 10) / 10,
    estimateNote: `Estimated from nearby official stations: ${list}. Not a direct sensor reading at this spot.`,
  };
}
