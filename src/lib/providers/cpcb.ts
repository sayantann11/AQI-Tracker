import {
  StationMeasurement,
  PollutantId,
  PollutantReading,
  DataFreshness,
} from '@/types/aqi';
import { AQIDataProvider, ProviderAttribution } from './types';
import { DELHI_NCR_STATIONS, StationMetadata } from '../fixtures/delhi-stations';
import { calculateNationalAQI, calculateSubIndex } from '../aqi/calculator';
import { getAQICategory } from '../aqi/category';
import { CPCBRecordFixture } from '../fixtures/cpcb-sample';
import { matchStationByCoordinates } from '../utils/geo';

export const CPCB_ATTRIBUTION: ProviderAttribution = {
  dataset: 'Real time Air Quality Index from various locations',
  organization: 'Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change',
  license: 'Government Open Data License - India (GODL)',
  licenseUrl: 'https://data.gov.in/government-open-data-license-india',
  datasetUrl: 'https://www.data.gov.in/catalog/real-time-air-quality-index',
};

const DATA_GOV_IN_ENDPOINT =
  'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

/**
 * Normalizes CPCB pollutant identifier to internal PollutantId.
 */
export function normalizePollutantId(raw: string): PollutantId | null {
  const clean = raw.trim().toUpperCase().replace(/[\s\-_]/g, '');
  if (clean === 'PM25' || clean === 'PM2.5') return 'pm25';
  if (clean === 'PM10') return 'pm10';
  if (clean === 'NO2') return 'no2';
  if (clean === 'SO2') return 'so2';
  if (clean === 'CO') return 'co';
  if (clean === 'OZONE' || clean === 'O3') return 'o3';
  if (clean === 'NH3') return 'nh3';
  return null;
}

/**
 * Parses "DD-MM-YYYY HH:MM:SS" string into standard Date.
 */
export function parseCPCBDate(dateStr: string): Date {
  try {
    const [datePart, timePart] = dateStr.trim().split(' ');
    if (!datePart) return new Date();

    const [day, month, year] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = (timePart || '00:00:00').split(':').map(Number);

    return new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30, seconds || 0)); // IST is UTC+5:30
  } catch {
    return new Date();
  }
}

/**
 * Calculates 4-tier data freshness based on observation timestamp.
 * - fresh: <= 1.5 hours (feeds publish hourly)
 * - delayed: 1 - 3 hours
 * - stale: > 3 hours
 * - unavailable: no valid timestamp
 */
export function getFreshnessStatus(date: Date, now: Date = new Date()): DataFreshness {
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  if (isNaN(diffHours) || diffHours < 0) return 'unavailable';
  if (diffHours <= 1.5) return 'fresh'; // hourly feeds are normally ~1h old when published
  if (diffHours <= 3) return 'delayed';
  return 'stale';
}

/**
 * Checks whether a measurement timestamp is older than the 2-hour freshness threshold.
 */
export function isMeasurementStale(date: Date, now: Date = new Date()): boolean {
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  return now.getTime() - date.getTime() > TWO_HOURS_MS;
}

/**
 * Matches a station string from the CPCB feed to our verified station registry.
 * Uses alphanumeric normalization, numeral standardization (Arabic vs Roman),
 * agency suffix removal, and alias lookup.
 * Does NOT fall back to arbitrary stations to avoid overwriting station identities.
 */
export function matchStationMetadata(stationName: string, city?: string): StationMetadata | null {
  if (!stationName) return null;

  const normalizeStr = (s: string) =>
    s
      .toLowerCase()
      .replace(/,\s*(delhi|noida|greater noida|gurugram|faridabad|ghaziabad)?[^,]*(dpcc|cpcb|uppcb|hspcb|iitm|imd|bmc|mpcb|wbpcb|kspcb)[^,]*/gi, '')
      .replace(/phase[- ]?ii\b/g, 'phase2')
      .replace(/phase[- ]?2\b/g, 'phase2')
      .replace(/\bsec(tor)?[- ]?(\d+[a-z]?)\b/g, 'sector$2')
      .replace(/[^a-z0-9]/g, '');

  const normFeed = normalizeStr(stationName);

  for (const station of DELHI_NCR_STATIONS) {
    const normName = normalizeStr(station.name);
    const normSlug = normalizeStr(station.slug);

    // Exact or bidirectional substring match
    if (
      normFeed === normName ||
      normFeed.includes(normName) ||
      normName.includes(normFeed) ||
      normFeed.includes(normSlug)
    ) {
      return station;
    }

    // Check station aliases
    if (station.aliases) {
      for (const alias of station.aliases) {
        const normAlias = normalizeStr(alias);
        if (
          normFeed === normAlias ||
          normFeed.includes(normAlias) ||
          normAlias.includes(normFeed)
        ) {
          return station;
        }
      }
    }
  }

  // Do NOT fall back to arbitrary city stations; unmatched stations must retain their own identity
  return null;
}

/** Delhi NCR bounding box used to drop the rest of India from the national feed. */
export function isInNCR(lat?: number, lng?: number): boolean {
  if (lat === undefined || lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return lat >= 28.15 && lat <= 29.05 && lng >= 76.7 && lng <= 77.85;
}

const NCR_CITY_NAMES = ['delhi', 'new delhi', 'noida', 'greater noida', 'gurugram', 'gurgaon', 'faridabad', 'ghaziabad'];

/** Keep only Delhi NCR rows from the national feed (by coordinates, else by city/name). */
export function filterNCRRecords(records: CPCBRecordFixture[]): CPCBRecordFixture[] {
  return records.filter((record) => {
    if (!record.station) return false;
    const la = record.latitude ? parseFloat(String(record.latitude)) : NaN;
    const lo = record.longitude ? parseFloat(String(record.longitude)) : NaN;
    if (Number.isFinite(la) && Number.isFinite(lo) && la !== 0 && lo !== 0) return isInNCR(la, lo);
    const cityOk = NCR_CITY_NAMES.includes((record.city || '').trim().toLowerCase());
    return cityOk || matchStationMetadata(record.station, record.city) !== null;
  });
}

function matchStationByCoordinatesStrict(lat: number, lng: number): StationMetadata | null {
  const m = matchStationByCoordinates(lat, lng); // 3 km window
  if (!m) return null;
  // Tighten to 1.2 km so neighbouring Noida/Delhi sectors are never merged
  const dLat = (m.latitude - lat) * 111;
  const dLng = (m.longitude - lng) * 111 * Math.cos((lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng) <= 1.2 ? m : null;
}

export class CPCBProvider implements AQIDataProvider {
  readonly id = 'cpcb';
  readonly name = 'CPCB Official (data.gov.in)';
  readonly attribution = CPCB_ATTRIBUTION;

  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DATA_GOV_IN_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async fetchStations(): Promise<StationMeasurement[]> {
    if (!this.isConfigured()) {
      throw new Error(
        'CPCBProvider: DATA_GOV_IN_API_KEY is not configured. Register at data.gov.in to obtain a free API key.'
      );
    }

    // The feed is national (~3-4k rows). Page through it so no NCR station is silently cut off.
    const PAGE = 1000;
    const records: CPCBRecordFixture[] = [];
    for (let offset = 0; offset < 8000; offset += PAGE) {
      const url = new URL(DATA_GOV_IN_ENDPOINT);
      url.searchParams.set('api-key', this.apiKey!);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', String(PAGE));
      url.searchParams.set('offset', String(offset));

      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) {
        if (offset > 0 && records.length > 0) break; // keep what we have
        throw new Error(`CPCB API error: HTTP ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const page: CPCBRecordFixture[] = data.records || [];
      records.push(...page);
      const total = Number(data.total ?? data.count ?? 0);
      if (page.length < PAGE || (total && records.length >= total)) break;
    }

    return this.normalizeRecords(filterNCRRecords(records));
  }

  /**
   * Normalizes an array of raw CPCB records into clean StationMeasurement objects.
   */
  normalizeRecords(records: CPCBRecordFixture[]): StationMeasurement[] {
    const stationsMap = new Map<string, {
      stationName: string;
      city: string;
      state: string;
      lastUpdate: string;
      latitude?: number;
      longitude?: number;
      pollutants: Partial<Record<PollutantId, { avg: number; min: number; max: number; unit: string }>>;
    }>();

    for (const record of records) {
      if (!record.station) continue;
      const stationKey = record.station.trim();
      const pollutantId = normalizePollutantId(record.pollutant_id);

      const rawAvg = (record as any).avg_value ?? (record as any).pollutant_avg;
      const rawMin = (record as any).min_value ?? (record as any).pollutant_min;
      const rawMax = (record as any).max_value ?? (record as any).pollutant_max;
      const rawLat = record.latitude ? parseFloat(String(record.latitude)) : undefined;
      const rawLng = record.longitude ? parseFloat(String(record.longitude)) : undefined;

      if (!stationsMap.has(stationKey)) {
        stationsMap.set(stationKey, {
          stationName: stationKey,
          city: record.city?.trim() || 'Delhi',
          state: record.state?.trim() || 'Delhi',
          lastUpdate: record.last_update,
          latitude: rawLat,
          longitude: rawLng,
          pollutants: {},
        });
      }

      if (pollutantId && rawAvg !== undefined && rawAvg !== null && rawAvg !== '') {
        const numAvg = parseFloat(String(rawAvg));
        // Ambient CO is ~0.2-10 mg/m3. Some feed rows report CO on another scale (values like 88-140),
        // which would pin the AQI at 500; treat those readings as invalid.
        const implausible = pollutantId === 'co' && numAvg > 30;
        if (!isNaN(numAvg) && !implausible) {
          const station = stationsMap.get(stationKey)!;
          station.pollutants[pollutantId] = {
            avg: numAvg,
            min: rawMin ? parseFloat(String(rawMin)) : numAvg,
            max: rawMax ? parseFloat(String(rawMax)) : numAvg,
            unit: (record as any).pollutant_unit || 'µg/m3',
          };
        }
      }
    }

    const now = new Date();
    const results: StationMeasurement[] = [];

    for (const [, stationData] of stationsMap) {
      // Coordinates are the most reliable identity; fall back to name matching only if they miss.
      const metadata =
        (stationData.latitude && stationData.longitude
          ? matchStationByCoordinatesStrict(stationData.latitude, stationData.longitude)
          : null) || matchStationMetadata(stationData.stationName, stationData.city);
      const lat = stationData.latitude || metadata?.latitude || 28.6139;
      const lng = stationData.longitude || metadata?.longitude || 77.2090;
      const cleanCity = metadata?.city || stationData.city || 'Delhi';
      const cleanState = metadata?.state || stationData.state || 'Delhi';

      const updateDate = parseCPCBDate(stationData.lastUpdate);
      const isStale = isMeasurementStale(updateDate, now);
      const freshnessStatus = getFreshnessStatus(updateDate, now);

      // Build pollutant readings and sub-indices
      const pollutantConcentrations: Partial<Record<PollutantId, number | null>> = {};
      const fullPollutants: Record<PollutantId, PollutantReading> = {
        pm25: { id: 'pm25', name: 'Fine Particles', formula: 'PM2.5', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
        pm10: { id: 'pm10', name: 'Coarse Particles', formula: 'PM10', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
        no2: { id: 'no2', name: 'Nitrogen Dioxide', formula: 'NO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
        so2: { id: 'so2', name: 'Sulphur Dioxide', formula: 'SO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
        co: { id: 'co', name: 'Carbon Monoxide', formula: 'CO', value: null, unit: 'mg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
        o3: { id: 'o3', name: 'Ozone', formula: 'O₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
        nh3: { id: 'nh3', name: 'Ammonia', formula: 'NH₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false, pollutantStatus: 'not_monitored' },
      };

      for (const [pId, pData] of Object.entries(stationData.pollutants)) {
        const id = pId as PollutantId;
        if (pData) {
          const val = pData.avg;
          pollutantConcentrations[id] = val;
          const sub = calculateSubIndex(id, val);
          fullPollutants[id] = {
            ...fullPollutants[id],
            value: val,
            subIndex: sub,
            min: pData.min,
            max: pData.max,
            avg: pData.avg,
            isAvailable: true,
            pollutantStatus: 'available',
          };
        }
      }

      // Calculate NAQI
      const aqiResult = calculateNationalAQI(pollutantConcentrations);
      const category = getAQICategory(aqiResult.aqi);

      let qualityStatus: StationMeasurement['dataQualityStatus'] = 'active';
      if (isStale) {
        qualityStatus = 'stale';
      } else if (!aqiResult.isSufficient) {
        qualityStatus = 'insufficient_data';
      }

      const stationStatus = aqiResult.activeCount > 0
        ? (isStale ? 'delayed' : 'reporting')
        : 'not_reporting';

      // Clean ID and human-friendly name
      let id = metadata?.id;
      let displayName = metadata?.name;
      if (!id) {
        const cleanName = stationData.stationName
          .replace(/,\s*.*$/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const slugCity = cleanCity.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        id = `station-${slugCity}-${cleanName}`;
      }
      if (!displayName) {
        displayName = stationData.stationName
          .replace(/,\s*(delhi|noida|greater noida|gurugram|faridabad|ghaziabad|kolkata|mumbai|bengaluru)?\s*[-–]\s*[a-z0-9_]+/gi, '')
          .trim();
      }

      results.push({
        id,
        name: displayName,
        city: cleanCity,
        state: cleanState,
        latitude: lat,
        longitude: lng,
        aqi: aqiResult.aqi,
        aqiStandard: 'IN_NAQI',
        category,
        prominentPollutant: aqiResult.prominentPollutant,
        pollutants: fullPollutants,
        lastUpdated: updateDate.toISOString(),
        fetchedAt: now.toISOString(),
        isStale,
        freshnessStatus,
        stationStatus,
        source: 'CPCB via data.gov.in',
        agency: metadata?.agency || (stationData.stationName.match(/[-–]\s*([A-Za-z]+)\s*$/)?.[1] || 'CPCB'),
        address: metadata?.address || `${displayName}, ${cleanCity}, ${cleanState}`,
        dataQualityStatus: qualityStatus,
      });
    }

    return results;
  }
}
