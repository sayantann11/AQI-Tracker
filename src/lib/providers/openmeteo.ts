import {
  StationMeasurement,
  PollutantId,
  PollutantReading,
} from '@/types/aqi';
import { AQIDataProvider, ProviderAttribution } from './types';
import { calculateNationalAQI, calculateSubIndex } from '../aqi/calculator';
import { getAQICategory } from '../aqi/category';

export const OPEN_METEO_ATTRIBUTION: ProviderAttribution = {
  dataset: 'Open-Meteo CAMS Atmospheric Air Quality Model',
  organization: 'Copernicus Atmosphere Monitoring Service (CAMS) & European Centre for Medium-Range Weather Forecasts (ECMWF)',
  license: 'Attribution 4.0 International (CC BY 4.0)',
  licenseUrl: 'https://open-meteo.com/en/terms',
  datasetUrl: 'https://open-meteo.com/en/docs/air-quality-api',
};

const OPEN_METEO_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Open-Meteo CAMS Air Quality Provider
 * Used for location-based estimates when physical CAAQMS stations are beyond reporting distance
 * or currently offline. Never presented as a physical sensor measurement.
 */
export class OpenMeteoProvider implements AQIDataProvider {
  readonly id = 'openmeteo';
  readonly name = 'Open-Meteo / Copernicus CAMS Model';
  readonly attribution = OPEN_METEO_ATTRIBUTION;

  isConfigured(): boolean {
    return true; // Free public access with attribution
  }

  /**
   * Fetches atmospheric model estimate for given geographical coordinates.
   */
  async fetchEstimateForCoordinates(
    latitude: number,
    longitude: number,
    locationName: string = 'Local Estimate',
    city: string = 'Delhi NCR'
  ): Promise<StationMeasurement> {
    const url = new URL(OPEN_METEO_BASE_URL);
    url.searchParams.set('latitude', latitude.toFixed(4));
    url.searchParams.set('longitude', longitude.toFixed(4));
    url.searchParams.set(
      'current',
      'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone'
    );
    url.searchParams.set('timezone', 'Asia/Kolkata');

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 1800 }, // 30-minute model cache
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo API error: HTTP ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const now = new Date();

    // Map model values (in µg/m³; CO is in µg/m³ which needs mg/m³ for Indian NAQI)
    const pm25 = typeof current.pm2_5 === 'number' ? Math.round(current.pm2_5) : null;
    const pm10 = typeof current.pm10 === 'number' ? Math.round(current.pm10) : null;
    const no2 = typeof current.nitrogen_dioxide === 'number' ? Math.round(current.nitrogen_dioxide) : null;
    const so2 = typeof current.sulphur_dioxide === 'number' ? Math.round(current.sulphur_dioxide) : null;
    const o3 = typeof current.ozone === 'number' ? Math.round(current.ozone) : null;
    // Open-Meteo provides CO in µg/m³; Indian NAQI uses mg/m³ (1 mg/m³ = 1000 µg/m³)
    const co = typeof current.carbon_monoxide === 'number' ? Math.round((current.carbon_monoxide / 1000) * 10) / 10 : null;

    const concentrations: Partial<Record<PollutantId, number | null>> = {
      pm25,
      pm10,
      no2,
      so2,
      co,
      o3,
      nh3: null,
    };

    const pollutants: Record<PollutantId, PollutantReading> = {
      pm25: { id: 'pm25', name: 'Fine Particles', formula: 'PM2.5', value: pm25, unit: 'µg/m³', subIndex: calculateSubIndex('pm25', pm25), isAvailable: pm25 !== null },
      pm10: { id: 'pm10', name: 'Coarse Particles', formula: 'PM10', value: pm10, unit: 'µg/m³', subIndex: calculateSubIndex('pm10', pm10), isAvailable: pm10 !== null },
      no2: { id: 'no2', name: 'Nitrogen Dioxide', formula: 'NO₂', value: no2, unit: 'µg/m³', subIndex: calculateSubIndex('no2', no2), isAvailable: no2 !== null },
      so2: { id: 'so2', name: 'Sulphur Dioxide', formula: 'SO₂', value: so2, unit: 'µg/m³', subIndex: calculateSubIndex('so2', so2), isAvailable: so2 !== null },
      co: { id: 'co', name: 'Carbon Monoxide', formula: 'CO', value: co, unit: 'mg/m³', subIndex: calculateSubIndex('co', co), isAvailable: co !== null },
      o3: { id: 'o3', name: 'Ozone', formula: 'O₃', value: o3, unit: 'µg/m³', subIndex: calculateSubIndex('o3', o3), isAvailable: o3 !== null },
      nh3: { id: 'nh3', name: 'Ammonia', formula: 'NH₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
    };

    const aqiResult = calculateNationalAQI(concentrations);
    const category = getAQICategory(aqiResult.aqi);

    const slug = locationName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return {
      id: `model-${slug}`,
      name: `${locationName} (Atmospheric Model)`,
      city,
      state: 'India',
      latitude,
      longitude,
      aqi: aqiResult.aqi,
      aqiStandard: 'IN_NAQI',
      category,
      prominentPollutant: aqiResult.prominentPollutant,
      pollutants,
      lastUpdated: current.time ? new Date(current.time).toISOString() : now.toISOString(),
      fetchedAt: now.toISOString(),
      isStale: false,
      freshnessStatus: 'fresh',
      source: 'Copernicus CAMS Atmospheric Model',
      dataQualityStatus: 'active',
      address: `Atmospheric model simulation centered at [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`,
    };
  }

  async fetchStations(): Promise<StationMeasurement[]> {
    return [];
  }
}
