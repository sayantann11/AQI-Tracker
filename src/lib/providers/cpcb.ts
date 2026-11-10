import {
  StationMeasurement,
  PollutantId,
  PollutantReading,
} from '@/types/aqi';
import { AQIDataProvider, ProviderAttribution } from './types';
import { DELHI_NCR_STATIONS, StationMetadata } from '../fixtures/delhi-stations';
import { calculateNationalAQI, calculateSubIndex } from '../aqi/calculator';
import { getAQICategory } from '../aqi/category';
import { CPCBRecordFixture } from '../fixtures/cpcb-sample';

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
 * Checks whether a measurement timestamp is older than the 2-hour freshness threshold.
 */
export function isMeasurementStale(date: Date, now: Date = new Date()): boolean {
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  return now.getTime() - date.getTime() > TWO_HOURS_MS;
}

/**
 * Matches a station string from the CPCB feed to our verified station registry.
 * Uses alphanumeric normalization to handle punctuation and spacing variations
 * (e.g. "R K Puram" vs "R.K. Puram", "Sector-62" vs "Sector 62").
 * Does NOT fall back to cityStations[0] to avoid overwriting Anand Vihar with unmapped stations.
 */
export function matchStationMetadata(stationName: string, city: string): StationMetadata | null {
  const normFeed = stationName.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const station of DELHI_NCR_STATIONS) {
    const normName = station.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSlug = station.slug.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Match exact normalized name or slug
    if (normFeed.includes(normName) || normFeed.includes(normSlug) || normName.includes(normFeed)) {
      return station;
    }

    // Match primary locality token if distinctive (>= 4 characters)
    const primaryLocality = station.slug.split('-')[0].replace(/[^a-z0-9]/g, '');
    if (primaryLocality.length >= 4 && normFeed.includes(primaryLocality)) {
      return station;
    }
  }

  // Do NOT fall back to arbitrary city stations; unmatched stations must retain their own identity
  return null;
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

    const url = new URL(DATA_GOV_IN_ENDPOINT);
    url.searchParams.set('api-key', this.apiKey!);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '5000'); // Fetch complete national CAAQMS batch to ensure all NCR stations & PM2.5 feeds are included

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 900 }, // 15-minute Next.js cache revalidation
    });

    if (!response.ok) {
      throw new Error(`CPCB API error: HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const records: CPCBRecordFixture[] = data.records || [];

    return this.normalizeRecords(records);
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
        if (!isNaN(numAvg)) {
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
      const metadata = matchStationMetadata(stationData.stationName, stationData.city);
      const lat = stationData.latitude || metadata?.latitude || 28.6139;
      const lng = stationData.longitude || metadata?.longitude || 77.2090;
      const cleanCity = metadata?.city || stationData.city || 'Delhi';
      const cleanState = metadata?.state || stationData.state || 'Delhi';

      const updateDate = parseCPCBDate(stationData.lastUpdate);
      const isStale = isMeasurementStale(updateDate, now);

      // Build pollutant readings and sub-indices
      const pollutantConcentrations: Partial<Record<PollutantId, number | null>> = {};
      const fullPollutants: Record<PollutantId, PollutantReading> = {
        pm25: { id: 'pm25', name: 'Fine Particles', formula: 'PM2.5', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        pm10: { id: 'pm10', name: 'Coarse Particles', formula: 'PM10', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        no2: { id: 'no2', name: 'Nitrogen Dioxide', formula: 'NO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        so2: { id: 'so2', name: 'Sulphur Dioxide', formula: 'SO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        co: { id: 'co', name: 'Carbon Monoxide', formula: 'CO', value: null, unit: 'mg/m³', subIndex: null, isAvailable: false },
        o3: { id: 'o3', name: 'Ozone', formula: 'O₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        nh3: { id: 'nh3', name: 'Ammonia', formula: 'NH₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
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

      const id = metadata?.id || `station-${cleanCity.toLowerCase()}-${stationData.stationName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

      results.push({
        id,
        name: metadata?.name || stationData.stationName,
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
        source: 'CPCB via data.gov.in',
        dataQualityStatus: qualityStatus,
      });
    }

    return results;
  }
}
