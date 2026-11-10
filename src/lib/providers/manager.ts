import {
  StationMeasurement,
  CitySummary,
  AQIApiResponse,
  AQIStandard,
} from '@/types/aqi';
import { CPCBProvider, CPCB_ATTRIBUTION } from './cpcb';
import { OpenAQProvider, OPENAQ_ATTRIBUTION } from './openaq';
import { OpenMeteoProvider, OPEN_METEO_ATTRIBUTION } from './openmeteo';
import { GoogleAQIProvider } from './google-aqi';
import { getAQICategory } from '../aqi/category';
import { CPCB_SAMPLE_RECORDS } from '../fixtures/cpcb-sample';
import { DELHI_NCR_STATIONS } from '../fixtures/delhi-stations';

interface CachedEntry {
  data: AQIApiResponse;
  expiresAt: number;
}

let inMemoryCache: CachedEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export class AQIDataManager {
  private cpcbProvider: CPCBProvider;
  private openaqProvider: OpenAQProvider;
  private openMeteoProvider: OpenMeteoProvider;
  private googleProvider: GoogleAQIProvider;

  constructor() {
    this.cpcbProvider = new CPCBProvider();
    this.openaqProvider = new OpenAQProvider();
    this.openMeteoProvider = new OpenMeteoProvider();
    this.googleProvider = new GoogleAQIProvider();
  }

  isAnyProviderConfigured(): boolean {
    return (
      this.cpcbProvider.isConfigured() ||
      this.openaqProvider.isConfigured() ||
      this.googleProvider.isConfigured() ||
      true // OpenMeteo is always configured
    );
  }

  getProviderStatus(): { cpcb: boolean; openaq: boolean; openmeteo: boolean; google: boolean } {
    return {
      cpcb: this.cpcbProvider.isConfigured(),
      openaq: this.openaqProvider.isConfigured(),
      openmeteo: true,
      google: this.googleProvider.isConfigured(),
    };
  }

  /**
   * Resolves AQI for specific coordinates by priority:
   * 1. Nearest physical station with valid reporting telemetry (< 15km)
   * 2. Google Maps AQI layer (if configured)
   * 3. Copernicus CAMS atmospheric model (infallible fallback)
   */
  async getAQIForLocation(
    lat: number,
    lng: number,
    locationName: string,
    city: string = 'Delhi NCR'
  ): Promise<{ primary: StationMeasurement; isEstimate: boolean }> {
    const latest = await this.getLatestAQI(true);
    const reportingStations = latest.stations.filter(
      (s) => s.aqi !== null && s.dataQualityStatus === 'active'
    );

    // Compute nearest physical station
    if (reportingStations.length > 0) {
      const nearest = reportingStations
        .map((s) => {
          const dLat = ((s.latitude - lat) * Math.PI) / 180;
          const dLng = ((s.longitude - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
              Math.cos((s.latitude * Math.PI) / 180) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = 6371 * c;
          return { station: s, distKm: Math.round(dist * 10) / 10 };
        })
        .sort((a, b) => a.distKm - b.distKm)[0];

      if (nearest && nearest.distKm <= 15) {
        return {
          primary: {
            ...nearest.station,
            distanceKm: nearest.distKm,
          },
          isEstimate: false,
        };
      }
    }

    // Google AQI fallback if key configured
    if (this.googleProvider.isConfigured()) {
      const googleResult = await this.googleProvider.fetchEstimateForCoordinates(
        lat,
        lng,
        locationName,
        city
      );
      if (googleResult) {
        return { primary: googleResult, isEstimate: true };
      }
    }

    // Open-Meteo Copernicus CAMS fallback
    const modelResult = await this.openMeteoProvider.fetchEstimateForCoordinates(
      lat,
      lng,
      locationName,
      city
    );
    return { primary: modelResult, isEstimate: true };
  }

  /**
   * Fetches the latest AQI data with caching and automatic provider fallback.
   * @param allowDevFixtures When true and no live keys are configured, uses realistic test fixtures clearly labeled as Developer Test Mode.
   */
  async getLatestAQI(allowDevFixtures = false): Promise<AQIApiResponse> {
    const now = Date.now();

    // Check cache
    if (inMemoryCache && inMemoryCache.expiresAt > now) {
      return { ...inMemoryCache.data, cached: true };
    }

    let stations: StationMeasurement[] = [];
    let activeSource = 'CPCB Official (data.gov.in)';
    let activeAttribution = CPCB_ATTRIBUTION;

    if (this.cpcbProvider.isConfigured()) {
      try {
        stations = await this.cpcbProvider.fetchStations();
      } catch (err) {
        console.warn('CPCB Provider failed, attempting fallback to OpenAQ:', err);
        if (this.openaqProvider.isConfigured()) {
          try {
            stations = await this.openaqProvider.fetchStations();
            activeSource = this.openaqProvider.name;
            activeAttribution = OPENAQ_ATTRIBUTION;
          } catch (fallbackErr) {
            console.error('All providers failed:', fallbackErr);
          }
        }
      }
    } else if (this.openaqProvider.isConfigured()) {
      try {
        stations = await this.openaqProvider.fetchStations();
        activeSource = this.openaqProvider.name;
        activeAttribution = OPENAQ_ATTRIBUTION;
      } catch (err) {
        console.error('OpenAQ Provider failed:', err);
      }
    } else if (allowDevFixtures) {
      // Offline developer mode with realistic sample fixtures
      stations = this.cpcbProvider.normalizeRecords(CPCB_SAMPLE_RECORDS);
      activeSource = 'Developer Test Fixtures (Offline Mode - Not Live)';
    }

    // Ensure all verified Delhi NCR stations are represented
    stations = this.reconcileStations(stations);

    const cities = this.generateCitySummaries(stations);

    const result: AQIApiResponse = {
      success: stations.length > 0,
      timestamp: new Date().toISOString(),
      source: activeSource,
      cached: false,
      stations,
      cities,
      attribution: activeAttribution,
      ...(!this.isAnyProviderConfigured() && !allowDevFixtures
        ? { error: 'NO_API_KEY_CONFIGURED' }
        : {}),
    };

    if (stations.length > 0) {
      inMemoryCache = {
        data: result,
        expiresAt: now + CACHE_TTL_MS,
      };
    }

    return result;
  }

  /**
   * Reconciles live readings with the official station directory.
   * If a station does not have a live reading in the current cycle,
   * it is included with a clear 'sensor_offline' status rather than being omitted.
   */
  public reconcileStations(activeStations: StationMeasurement[]): StationMeasurement[] {
    const resultMap = new Map<string, StationMeasurement>();

    for (const station of activeStations) {
      resultMap.set(station.id, station);
    }

    const now = new Date();

    for (const meta of DELHI_NCR_STATIONS) {
      if (!resultMap.has(meta.id)) {
        // Station exists in official network but has no data in current batch
        resultMap.set(meta.id, {
          id: meta.id,
          name: meta.name,
          city: meta.city,
          state: meta.state,
          latitude: meta.latitude,
          longitude: meta.longitude,
          aqi: null,
          aqiStandard: 'IN_NAQI',
          category: getAQICategory(null),
          prominentPollutant: null,
          pollutants: {
            pm25: { id: 'pm25', name: 'Fine Particles', formula: 'PM2.5', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
            pm10: { id: 'pm10', name: 'Coarse Particles', formula: 'PM10', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
            no2: { id: 'no2', name: 'Nitrogen Dioxide', formula: 'NO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
            so2: { id: 'so2', name: 'Sulphur Dioxide', formula: 'SO₂', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
            co: { id: 'co', name: 'Carbon Monoxide', formula: 'CO', value: null, unit: 'mg/m³', subIndex: null, isAvailable: false },
            o3: { id: 'o3', name: 'Ozone', formula: 'O₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
            nh3: { id: 'nh3', name: 'Ammonia', formula: 'NH₃', value: null, unit: 'µg/m³', subIndex: null, isAvailable: false },
          },
          lastUpdated: now.toISOString(),
          fetchedAt: now.toISOString(),
          isStale: false,
          freshnessStatus: 'unavailable',
          agency: meta.agency,
          address: meta.address,
          source: 'CPCB / State Board Network',
          dataQualityStatus: 'sensor_offline',
        });
      }
    }

    return Array.from(resultMap.values());
  }

  /**
   * Aggregates station readings by city to form the CitySummary array.
   */
  private generateCitySummaries(stations: StationMeasurement[]): CitySummary[] {
    const cityGroups = new Map<string, StationMeasurement[]>();

    for (const s of stations) {
      if (!cityGroups.has(s.city)) {
        cityGroups.set(s.city, []);
      }
      cityGroups.get(s.city)!.push(s);
    }

    const summaries: CitySummary[] = [];

    for (const [cityName, cityStations] of cityGroups) {
      const activeReadings = cityStations.filter((s) => s.aqi !== null && s.aqi > 0);
      const state = cityStations[0]?.state || 'Delhi';

      if (activeReadings.length === 0) {
        summaries.push({
          city: cityName,
          state,
          stationCount: cityStations.length,
          activeStationCount: 0,
          avgAqi: null,
          maxAqi: null,
          minAqi: null,
          dominantCategory: getAQICategory(null),
          worstStation: null,
          bestStation: null,
          lastUpdated: new Date().toISOString(),
        });
        continue;
      }

      let sum = 0;
      let minStation: { name: string; aqi: number } = { name: activeReadings[0].name, aqi: activeReadings[0].aqi! };
      let maxStation: { name: string; aqi: number } = { name: activeReadings[0].name, aqi: activeReadings[0].aqi! };

      for (const st of activeReadings) {
        const val = st.aqi!;
        sum += val;
        if (val < minStation.aqi) minStation = { name: st.name, aqi: val };
        if (val > maxStation.aqi) maxStation = { name: st.name, aqi: val };
      }

      const avgAqi = Math.round(sum / activeReadings.length);

      summaries.push({
        city: cityName,
        state,
        stationCount: cityStations.length,
        activeStationCount: activeReadings.length,
        avgAqi,
        maxAqi: maxStation.aqi,
        minAqi: minStation.aqi,
        dominantCategory: getAQICategory(avgAqi),
        worstStation: maxStation,
        bestStation: minStation,
        lastUpdated: activeReadings[0]?.lastUpdated || new Date().toISOString(),
      });
    }

    return summaries.sort((a, b) => (b.avgAqi || 0) - (a.avgAqi || 0));
  }
}
