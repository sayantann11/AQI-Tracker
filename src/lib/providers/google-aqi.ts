import {
  StationMeasurement,
  PollutantId,
  PollutantReading,
} from '@/types/aqi';
import { AQIDataProvider, ProviderAttribution } from './types';
import { calculateNationalAQI, calculateSubIndex } from '../aqi/calculator';
import { getAQICategory } from '../aqi/category';

export const GOOGLE_AQI_ATTRIBUTION: ProviderAttribution = {
  dataset: 'Google Maps Platform Air Quality API',
  organization: 'Google LLC',
  license: 'Google Maps Platform Terms of Service',
  licenseUrl: 'https://cloud.google.com/maps-platform/terms',
  datasetUrl: 'https://developers.google.com/maps/documentation/air-quality',
};

const GOOGLE_AQI_ENDPOINT = 'https://airquality.googleapis.com/v1/currentConditions:lookup';

/**
 * Google Maps Platform Air Quality API Provider
 * Provides coordinate-level current conditions with support for India AQI (IND_CPCB).
 */
export class GoogleAQIProvider implements AQIDataProvider {
  readonly id = 'google';
  readonly name = 'Google Air Quality API';
  readonly attribution = GOOGLE_AQI_ATTRIBUTION;

  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_AIR_QUALITY_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async fetchEstimateForCoordinates(
    latitude: number,
    longitude: number,
    locationName: string = 'Local Estimate',
    city: string = 'India'
  ): Promise<StationMeasurement | null> {
    if (!this.isConfigured()) return null;

    try {
      const res = await fetch(`${GOOGLE_AQI_ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { latitude, longitude },
          extraComputations: ['POLLUTANT_CONCENTRATION', 'LOCAL_AQI'],
          languageCode: 'en',
        }),
        next: { revalidate: 900 },
      });

      if (!res.ok) {
        console.warn(`Google AQI API HTTP error: ${res.status}`);
        return null;
      }

      const data = await res.json();
      const indexes = data.indexes || [];
      // Prefer Indian National AQI code if available
      const indiaIndex = indexes.find((idx: any) => idx.code === 'ind_cpcb') || indexes[0];
      const aqi = indiaIndex?.aqi ?? null;
      const category = getAQICategory(aqi);

      const pollutantsList = data.pollutants || [];
      const concentrations: Partial<Record<PollutantId, number | null>> = {};
      const fullPollutants: Record<PollutantId, PollutantReading> = {
        pm25: { id: 'pm25', name: 'Fine Particles', formula: 'PM2.5', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        pm10: { id: 'pm10', name: 'Coarse Particles', formula: 'PM10', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        no2: { id: 'no2', name: 'Nitrogen Dioxide', formula: 'NO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        so2: { id: 'so2', name: 'Sulphur Dioxide', formula: 'SO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        co: { id: 'co', name: 'Carbon Monoxide', formula: 'CO', value: null, unit: 'mg/m³', subIndex: null, isAvailable: false },
        o3: { id: 'o3', name: 'Ozone', formula: 'O₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
        nh3: { id: 'nh3', name: 'Ammonia', formula: 'NH₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
      };

      for (const p of pollutantsList) {
        const code = (p.code || '').toLowerCase();
        let pid: PollutantId | null = null;
        if (code === 'pm25') pid = 'pm25';
        else if (code === 'pm10') pid = 'pm10';
        else if (code === 'no2') pid = 'no2';
        else if (code === 'so2') pid = 'so2';
        else if (code === 'co') pid = 'co';
        else if (code === 'o3') pid = 'o3';

        if (pid && typeof p.concentration?.value === 'number') {
          const val = Math.round(p.concentration.value * 10) / 10;
          concentrations[pid] = val;
          fullPollutants[pid] = {
            ...fullPollutants[pid],
            value: val,
            subIndex: calculateSubIndex(pid, val),
            isAvailable: true,
          };
        }
      }

      const now = new Date();
      const slug = locationName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      return {
        id: `google-${slug}`,
        name: `${locationName} (Google Maps Layer)`,
        city,
        state: 'India',
        latitude,
        longitude,
        aqi,
        aqiStandard: 'IN_NAQI',
        category,
        prominentPollutant: (indiaIndex?.dominantPollutant as PollutantId) || null,
        pollutants: fullPollutants,
        lastUpdated: data.dateTime || now.toISOString(),
        fetchedAt: now.toISOString(),
        isStale: false,
        freshnessStatus: 'fresh',
        source: 'Google Maps Air Quality Layer',
        dataQualityStatus: 'active',
        address: `Geographical observation centered near [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`,
      };
    } catch (err) {
      console.error('Google AQI Provider error:', err);
      return null;
    }
  }

  async fetchStations(): Promise<StationMeasurement[]> {
    return [];
  }
}
