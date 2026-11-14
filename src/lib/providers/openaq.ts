import { StationMeasurement, PollutantId, PollutantReading } from '@/types/aqi';
import { AQIDataProvider, ProviderAttribution } from './types';
import { calculateNationalAQI, calculateSubIndex } from '../aqi/calculator';
import { getAQICategory } from '../aqi/category';
import { matchStationByCoordinates } from '../utils/geo';

export const OPENAQ_ATTRIBUTION: ProviderAttribution = {
  dataset: 'OpenAQ Real-time Air Quality Data',
  organization: 'OpenAQ and contributing government monitoring networks',
  license: 'Per-provider open data terms (see OpenAQ)',
  licenseUrl: 'https://docs.openaq.org/about/about',
  datasetUrl: 'https://openaq.org',
};

const OPENAQ_BASE_URL = 'https://api.openaq.org/v3';
// bbox = min_lon,min_lat,max_lon,max_lat  (Delhi NCR)
const NCR_BBOX = '76.7,28.15,77.8,29.0';
// Free tier is 60 req/min: 1 list call + at most MAX_LOCATIONS latest calls
const MAX_LOCATIONS = 45;
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const PARAM_MAP: Record<string, PollutantId> = {
  pm25: 'pm25', pm10: 'pm10', no2: 'no2', so2: 'so2', co: 'co', o3: 'o3', nh3: 'nh3',
};

/** Convert a raw OpenAQ value to the unit used by the CPCB breakpoints (µg/m³; CO in mg/m³). */
export function convertToCpcbUnit(pid: PollutantId, value: number, units: string | undefined): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const u = (units || '').toLowerCase().replace('µ', 'u');
  let v = value;
  if (u === 'ppm') {
    const factor: Partial<Record<PollutantId, number>> = { no2: 1880, so2: 2620, o3: 1960, nh3: 696, co: 1.145 };
    v = value * (factor[pid] ?? 1);
  } else if (u === 'ppb') {
    const factor: Partial<Record<PollutantId, number>> = { no2: 1.88, so2: 2.62, o3: 1.96, nh3: 0.696, co: 0.001145 };
    v = value * (factor[pid] ?? 1);
  } else if (pid === 'co' && (u.startsWith('ug') || u === '')) {
    v = value / 1000; // µg/m³ -> mg/m³
  }
  if (pid === 'co') return v > 200 ? null : Math.round(v * 100) / 100;
  if (v > 5000) return null;
  return Math.round(v * 10) / 10;
}

function emptyPollutants(): Record<PollutantId, PollutantReading> {
  return {
    pm25: { id: 'pm25', name: 'Fine Particles', formula: 'PM2.5', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
    pm10: { id: 'pm10', name: 'Coarse Particles', formula: 'PM10', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
    no2: { id: 'no2', name: 'Nitrogen Dioxide', formula: 'NO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
    so2: { id: 'so2', name: 'Sulphur Dioxide', formula: 'SO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
    co: { id: 'co', name: 'Carbon Monoxide', formula: 'CO', value: null, unit: 'mg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
    o3: { id: 'o3', name: 'Ozone', formula: 'O₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
    nh3: { id: 'nh3', name: 'Ammonia', formula: 'NH₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
  };
}

export class OpenAQProvider implements AQIDataProvider {
  readonly id = 'openaq';
  readonly name = 'OpenAQ v3';
  readonly attribution = OPENAQ_ATTRIBUTION;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAQ_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async get(path: string, params: Record<string, string>): Promise<any> {
    const url = new URL(`${OPENAQ_BASE_URL}${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url.toString(), {
      headers: { 'X-API-Key': this.apiKey!, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`OpenAQ HTTP ${res.status} on ${path}`);
    return res.json();
  }

  async fetchStations(): Promise<StationMeasurement[]> {
    if (!this.isConfigured()) throw new Error('OPENAQ_API_KEY is not configured');

    const list = await this.get('/locations', { bbox: NCR_BBOX, limit: '1000', monitor: 'true' });
    const now = Date.now();
    const locations: any[] = (list.results || [])
      .filter((l: any) => l?.coordinates && l.isMonitor !== false)
      .filter((l: any) => {
        const last = l.datetimeLast?.utc ? Date.parse(l.datetimeLast.utc) : NaN;
        return Number.isFinite(last) && now - last <= MAX_AGE_MS;
      })
      .sort((a: any, b: any) => Date.parse(b.datetimeLast.utc) - Date.parse(a.datetimeLast.utc))
      .slice(0, MAX_LOCATIONS);

    const out: StationMeasurement[] = [];
    // modest concurrency to stay inside 60 req/min
    for (let i = 0; i < locations.length; i += 8) {
      const chunk = locations.slice(i, i + 8);
      const settled = await Promise.allSettled(
        chunk.map(async (loc) => {
          const latest = await this.get(`/locations/${loc.id}/latest`, { limit: '100' });
          return this.normalizeLocation(loc, latest.results || []);
        })
      );
      for (const s of settled) if (s.status === 'fulfilled' && s.value) out.push(s.value);
    }
    return out;
  }

  /** Pure function: easy to unit-test without network. */
  normalizeLocation(loc: any, latestRows: any[]): StationMeasurement | null {
    const sensorById = new Map<number, any>();
    for (const s of loc.sensors || []) sensorById.set(s.id, s);

    const conc: Partial<Record<PollutantId, number | null>> = {};
    const pollutants = emptyPollutants();
    let latest = 0;

    for (const row of latestRows) {
      const sensor = sensorById.get(row.sensorsId);
      const pname = String(sensor?.parameter?.name || '').toLowerCase();
      const pid = PARAM_MAP[pname];
      if (!pid || typeof row.value !== 'number') continue;
      const t = Date.parse(row.datetime?.utc || '');
      if (!Number.isFinite(t) || Date.now() - t > MAX_AGE_MS) continue;
      const v = convertToCpcbUnit(pid, row.value, sensor?.parameter?.units);
      if (v === null) continue;
      conc[pid] = v;
      pollutants[pid] = {
        ...pollutants[pid], value: v, subIndex: calculateSubIndex(pid, v),
        isAvailable: true, pollutantStatus: 'available', avg: v,
      };
      if (t > latest) latest = t;
    }
    if (latest === 0) return null;

    const lat = loc.coordinates.latitude;
    const lng = loc.coordinates.longitude;
    const meta = matchStationByCoordinates(lat, lng);
    const aqiResult = calculateNationalAQI(conc);
    const updated = new Date(latest);
    const ageH = (Date.now() - latest) / 3600000;
    const stale = ageH > 2;

    return {
      id: meta?.id || `openaq-${loc.id}`,
      name: meta?.name || String(loc.name || 'Delhi NCR station'),
      city: meta?.city || 'Delhi',
      state: meta?.state || 'Delhi',
      latitude: lat,
      longitude: lng,
      aqi: aqiResult.aqi,
      aqiStandard: 'IN_NAQI',
      category: getAQICategory(aqiResult.aqi),
      prominentPollutant: aqiResult.prominentPollutant,
      pollutants,
      lastUpdated: updated.toISOString(),
      fetchedAt: new Date().toISOString(),
      isStale: stale,
      freshnessStatus: ageH <= 1 ? 'fresh' : ageH <= 3 ? 'delayed' : 'stale',
      stationStatus: aqiResult.activeCount > 0 ? (stale ? 'delayed' : 'reporting') : 'not_reporting',
      source: 'OpenAQ (government monitor)',
      agency: meta?.agency,
      address: meta?.address,
      dataQualityStatus: stale ? 'stale' : aqiResult.isSufficient ? 'active' : 'insufficient_data',
    };
  }
}
