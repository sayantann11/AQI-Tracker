import { StationMeasurement, PollutantId, PollutantReading } from '@/types/aqi';
import { AQIDataProvider, ProviderAttribution } from './types';
import { calculateNationalAQI, calculateSubIndex } from '../aqi/calculator';
import { getAQICategory } from '../aqi/category';

export const OPEN_METEO_ATTRIBUTION: ProviderAttribution = {
  dataset: 'Open-Meteo Air Quality API (Copernicus CAMS model)',
  organization: 'Open-Meteo / Copernicus Atmosphere Monitoring Service (ECMWF)',
  license: 'CC BY 4.0 (free tier is for non-commercial use)',
  licenseUrl: 'https://open-meteo.com/en/terms',
  datasetUrl: 'https://open-meteo.com/en/docs/air-quality-api',
};

const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const CURRENT = 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone';
const MODEL_NOTE =
  'Estimated from the Copernicus CAMS atmospheric model, not a sensor reading. Models can under-read during severe smog.';

export interface EstimateTarget {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  agency?: string;
  address?: string;
}

const round = (v: unknown, d = 0): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v * 10 ** d) / 10 ** d : null;

export class OpenMeteoProvider implements AQIDataProvider {
  readonly id = 'openmeteo';
  readonly name = 'Open-Meteo (CAMS model)';
  readonly attribution = OPEN_METEO_ATTRIBUTION;

  isConfigured(): boolean {
    return true;
  }

  /** Pure: turn one Open-Meteo `current` block into a StationMeasurement estimate. */
  buildEstimate(target: EstimateTarget, current: any): StationMeasurement {
    const pm25 = round(current?.pm2_5);
    const pm10 = round(current?.pm10);
    const no2 = round(current?.nitrogen_dioxide);
    const so2 = round(current?.sulphur_dioxide);
    const o3 = round(current?.ozone);
    const coRaw = round(current?.carbon_monoxide);
    const co = coRaw === null ? null : Math.round((coRaw / 1000) * 100) / 100; // µg/m³ -> mg/m³

    const conc: Partial<Record<PollutantId, number | null>> = { pm25, pm10, no2, so2, co, o3, nh3: null };
    const mk = (id: PollutantId, name: string, formula: string, value: number | null, unit: string): PollutantReading => ({
      id, name, formula, value, unit,
      subIndex: value === null ? null : calculateSubIndex(id, value),
      isAvailable: value !== null,
      pollutantStatus: value === null ? 'not_monitored' : 'available',
    });
    const pollutants: Record<PollutantId, PollutantReading> = {
      pm25: mk('pm25', 'Fine Particles', 'PM2.5', pm25, 'µg/m³'),
      pm10: mk('pm10', 'Coarse Particles', 'PM10', pm10, 'µg/m³'),
      no2: mk('no2', 'Nitrogen Dioxide', 'NO₂', no2, 'µg/m³'),
      so2: mk('so2', 'Sulphur Dioxide', 'SO₂', so2, 'µg/m³'),
      co: mk('co', 'Carbon Monoxide', 'CO', co, 'mg/m³'),
      o3: mk('o3', 'Ozone', 'O₃', o3, 'µg/m³'),
      nh3: mk('nh3', 'Ammonia', 'NH₃', null, 'µg/m³'),
    };
    const aqiResult = calculateNationalAQI(conc);
    // timezone=GMT is requested, so append Z; never let the server's local zone shift it
    const rawTime: string | undefined = current?.time;
    const t = rawTime ? Date.parse(rawTime.endsWith('Z') ? rawTime : `${rawTime}Z`) : NaN;
    const updated = Number.isFinite(t) ? new Date(t) : new Date();

    return {
      id: target.id,
      name: target.name,
      city: target.city,
      state: target.state,
      latitude: target.latitude,
      longitude: target.longitude,
      aqi: aqiResult.aqi,
      aqiStandard: 'IN_NAQI',
      category: getAQICategory(aqiResult.aqi),
      prominentPollutant: aqiResult.prominentPollutant,
      pollutants,
      lastUpdated: updated.toISOString(),
      fetchedAt: new Date().toISOString(),
      isStale: false,
      freshnessStatus: 'fresh',
      stationStatus: 'not_reporting',
      source: 'Copernicus CAMS model (estimate)',
      agency: target.agency,
      address: target.address,
      dataQualityStatus: 'model_estimate',
      isEstimate: true,
      estimateNote: MODEL_NOTE,
    };
  }

  /** One HTTP call for many points (Open-Meteo accepts comma separated coordinates). */
  async fetchEstimatesBatch(targets: EstimateTarget[]): Promise<StationMeasurement[]> {
    if (targets.length === 0) return [];
    const url = new URL(BASE);
    url.searchParams.set('latitude', targets.map((t) => t.latitude.toFixed(4)).join(','));
    url.searchParams.set('longitude', targets.map((t) => t.longitude.toFixed(4)).join(','));
    url.searchParams.set('current', CURRENT);
    url.searchParams.set('timezone', 'GMT');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const json = await res.json();
    const arr: any[] = Array.isArray(json) ? json : [json];
    const out: StationMeasurement[] = [];
    arr.forEach((entry, i) => {
      if (!targets[i] || !entry?.current) return;
      const est = this.buildEstimate(targets[i], entry.current);
      if (est.aqi !== null) out.push(est);
    });
    return out;
  }

  /** Estimate for arbitrary coordinates (searched locality / GPS outside station range). */
  async fetchEstimateForCoordinates(
    latitude: number,
    longitude: number,
    locationName = 'Your location',
    city = 'Delhi NCR'
  ): Promise<StationMeasurement> {
    const slug = locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'location';
    const [est] = await this.fetchEstimatesBatch([
      {
        id: `model-${slug}`,
        name: `${locationName} (model estimate)`,
        city,
        state: 'India',
        latitude,
        longitude,
        address: `Atmospheric model estimate near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      },
    ]);
    if (!est) throw new Error('Open-Meteo returned no data for this location');
    return est;
  }

  async fetchStations(): Promise<StationMeasurement[]> {
    return [];
  }
}
