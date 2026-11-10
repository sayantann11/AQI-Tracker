import {
  StationMeasurement,
  PollutantId,
  PollutantReading,
} from '@/types/aqi';
import { AQIDataProvider, ProviderAttribution } from './types';
import { calculateNationalAQI, calculateSubIndex } from '../aqi/calculator';
import { getAQICategory } from '../aqi/category';
import { matchStationByCoordinates } from '../utils/geo';
import { DELHI_NCR_STATIONS } from '../fixtures/delhi-stations';

export const OPENAQ_ATTRIBUTION: ProviderAttribution = {
  dataset: 'OpenAQ Real-time Air Quality Data',
  organization: 'OpenAQ Community & Contributing Government Sensor Networks',
  license: 'Open Data Commons Open Database License (ODbL) / Individual Provider Terms',
  licenseUrl: 'https://openaq.org/licenses',
  datasetUrl: 'https://docs.openaq.org',
};

const OPENAQ_BASE_URL = 'https://api.openaq.org/v3';

export class OpenAQProvider implements AQIDataProvider {
  readonly id = 'openaq';
  readonly name = 'OpenAQ v3 Platform';
  readonly attribution = OPENAQ_ATTRIBUTION;

  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAQ_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async fetchStations(): Promise<StationMeasurement[]> {
    if (!this.isConfigured()) {
      throw new Error(
        'OpenAQProvider: OPENAQ_API_KEY is not configured. Register at openaq.org for a free API key.'
      );
    }

    // Coordinates bounding box for Delhi NCR: [minLat, minLng, maxLat, maxLng]
    // 28.2 to 28.9 N, 76.8 to 77.6 E
    const url = new URL(`${OPENAQ_BASE_URL}/locations`);
    url.searchParams.set('bbox', '76.8,28.2,77.6,28.9');
    url.searchParams.set('limit', '50');

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': this.apiKey!,
        Accept: 'application/json',
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`OpenAQ API error: HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    return this.normalizeOpenAQResults(results);
  }

  normalizeOpenAQResults(locations: any[]): StationMeasurement[] {
    const measurements: StationMeasurement[] = [];
    const now = new Date();

    for (const loc of locations) {
      if (!loc.coordinates || typeof loc.coordinates.latitude !== 'number') continue;

      const lat = loc.coordinates.latitude;
      const lng = loc.coordinates.longitude;
      const matchedMeta = matchStationByCoordinates(lat, lng);

      const pollutantsMap: Partial<Record<PollutantId, number | null>> = {};
      const fullPollutants: Record<PollutantId, PollutantReading> = {
        pm25: { id: 'pm25', name: 'Fine Particles', formula: 'PM2.5', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        pm10: { id: 'pm10', name: 'Coarse Particles', formula: 'PM10', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        no2: { id: 'no2', name: 'Nitrogen Dioxide', formula: 'NO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        so2: { id: 'so2', name: 'Sulphur Dioxide', formula: 'SO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        co: { id: 'co', name: 'Carbon Monoxide', formula: 'CO', value: null, unit: 'mg/m³', subIndex: null, isAvailable: false },
        o3: { id: 'o3', name: 'Ozone', formula: 'O₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        nh3: { id: 'nh3', name: 'Ammonia', formula: 'NH₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
      };

      let latestDate = new Date(0);

      if (Array.isArray(loc.sensors)) {
        for (const sensor of loc.sensors) {
          const paramName = (sensor.parameter?.name || '').toLowerCase();
          let pid: PollutantId | null = null;
          if (paramName === 'pm25') pid = 'pm25';
          else if (paramName === 'pm10') pid = 'pm10';
          else if (paramName === 'no2') pid = 'no2';
          else if (paramName === 'so2') pid = 'so2';
          else if (paramName === 'co') pid = 'co';
          else if (paramName === 'o3') pid = 'o3';
          else if (paramName === 'nh3') pid = 'nh3';

          if (pid && typeof sensor.latest?.value === 'number') {
            const val = sensor.latest.value;
            pollutantsMap[pid] = val;
            const sub = calculateSubIndex(pid, val);
            fullPollutants[pid] = {
              ...fullPollutants[pid],
              value: val,
              subIndex: sub,
              isAvailable: true,
            };

            if (sensor.latest.datetime) {
              const d = new Date(sensor.latest.datetime);
              if (d > latestDate) latestDate = d;
            }
          }
        }
      }

      if (latestDate.getTime() === 0) {
        latestDate = now;
      }

      const isStale = now.getTime() - latestDate.getTime() > 2 * 60 * 60 * 1000;
      const aqiResult = calculateNationalAQI(pollutantsMap);
      const category = getAQICategory(aqiResult.aqi);

      measurements.push({
        id: matchedMeta?.id || `openaq-${loc.id}`,
        name: matchedMeta?.name || loc.name || 'Delhi NCR Station',
        city: matchedMeta?.city || loc.locality || 'Delhi',
        state: matchedMeta?.state || 'Delhi',
        latitude: lat,
        longitude: lng,
        aqi: aqiResult.aqi,
        aqiStandard: 'IN_NAQI',
        category,
        prominentPollutant: aqiResult.prominentPollutant,
        pollutants: fullPollutants,
        lastUpdated: latestDate.toISOString(),
        fetchedAt: now.toISOString(),
        isStale,
        source: 'OpenAQ Platform (Verified Sensor)',
        dataQualityStatus: isStale ? 'stale' : aqiResult.isSufficient ? 'active' : 'insufficient_data',
      });
    }

    return measurements;
  }
}
