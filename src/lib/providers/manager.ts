import { StationMeasurement, CitySummary, AQIApiResponse, SourceStatus } from '@/types/aqi';
import { CPCBProvider, CPCB_ATTRIBUTION } from './cpcb';
import { OpenAQProvider } from './openaq';
import { OpenMeteoProvider, EstimateTarget } from './openmeteo';
import { GoogleAQIProvider } from './google-aqi';
import { getAQICategory } from '../aqi/category';
import { CPCB_SAMPLE_RECORDS } from '../fixtures/cpcb-sample';
import { DELHI_NCR_STATIONS } from '../fixtures/delhi-stations';
import { calculateDistanceKm } from '../utils/geo';
import { estimateFromNeighbors } from '../aqi/neighbors';

interface CachedEntry {
  data: AQIApiResponse;
  expiresAt: number;
  createdAt: number;
}
/** Public ?fresh=true can never force more than one upstream refresh per minute. */
const MIN_REFRESH_GAP_MS = 60 * 1000;

// Module-level state lives for the life of the Node server process (Render web service).
let inMemoryCache: CachedEntry | null = null;
let inflight: Promise<AQIApiResponse> | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;
/** Same physical station reported by two feeds if within this distance. */
const DUPLICATE_RADIUS_KM = 1.5;
/** A searched/GPS point uses a real station only if one reports this close. */
export const MAX_STATION_DISTANCE_KM = 3;

const ts = (s: StationMeasurement) => Date.parse(s.lastUpdated) || 0;
const hasReading = (s: StationMeasurement) => s.aqi !== null && s.aqi > 0;

/** Pick the better of two readings for the same station: has data > fresher > earlier source. */
export function pickBetterReading(a: StationMeasurement, b: StationMeasurement): StationMeasurement {
  if (hasReading(a) && !hasReading(b)) return a;
  if (hasReading(b) && !hasReading(a)) return b;
  return ts(b) > ts(a) + 5 * 60 * 1000 ? b : a;
}

/**
 * Merge readings from several providers. Same station is detected by id first and by
 * proximity second, so an OpenAQ copy of a CPCB station never appears twice.
 */
export function mergeProviderStations(...lists: StationMeasurement[][]): StationMeasurement[] {
  const merged: StationMeasurement[] = [];
  for (const list of lists) {
    for (const st of list) {
      let idx = merged.findIndex((m) => m.id === st.id);
      if (idx === -1) {
        idx = merged.findIndex(
          (m) => calculateDistanceKm(m.latitude, m.longitude, st.latitude, st.longitude) <= DUPLICATE_RADIUS_KM
        );
      }
      if (idx === -1) merged.push(st);
      else {
        const best = pickBetterReading(merged[idx], st);
        // keep the registry identity (id/name/city) of the first record
        merged[idx] = best === merged[idx] ? best : { ...best, id: merged[idx].id, name: merged[idx].name, city: merged[idx].city, state: merged[idx].state, agency: merged[idx].agency ?? best.agency, address: merged[idx].address ?? best.address };
      }
    }
  }
  return merged;
}

export class AQIDataManager {
  private cpcbProvider = new CPCBProvider();
  private openaqProvider = new OpenAQProvider();
  private openMeteoProvider = new OpenMeteoProvider();
  private googleProvider = new GoogleAQIProvider();

  getProviderStatus() {
    return {
      cpcb: this.cpcbProvider.isConfigured(),
      openaq: this.openaqProvider.isConfigured(),
      openmeteo: true,
      google: this.googleProvider.isConfigured(),
    };
  }

  isAnyProviderConfigured(): boolean {
    return this.cpcbProvider.isConfigured() || this.openaqProvider.isConfigured();
  }

  /**
   * AQI for an exact point (searched locality or GPS).
   * 1) a real, reporting station within MAX_STATION_DISTANCE_KM
   * 2) otherwise a distance-weighted estimate from up to 3 real stations within 15 km (labelled)
   * 3) otherwise an atmospheric-model estimate for the exact coordinates (labelled)
   * 4) if the model is down, the nearest real station with its distance shown
   */
  async getAQIForLocation(lat: number, lng: number, locationName: string, city = 'Delhi NCR') {
    const latest = await this.getLatestAQI();
    const real = latest.stations.filter((s) => hasReading(s) && !s.isEstimate);
    const ranked = real
      .map((s) => ({ station: s, distKm: Math.round(calculateDistanceKm(lat, lng, s.latitude, s.longitude) * 10) / 10 }))
      .sort((a, b) => a.distKm - b.distKm);
    const nearest = ranked[0];

    if (nearest && nearest.distKm <= MAX_STATION_DISTANCE_KM) {
      return {
        primary: { ...nearest.station, distanceKm: nearest.distKm },
        isEstimate: false,
        method: 'station' as const,
        nearestStationDistKm: nearest.distKm,
      };
    }
    const slug = locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'location';
    const neighborEst = estimateFromNeighbors(
      { id: `est-${slug}`, name: `${locationName} (estimated)`, city, state: 'India', latitude: lat, longitude: lng },
      real
    );
    if (neighborEst) {
      return { primary: neighborEst, isEstimate: true, method: 'neighbors' as const, nearestStationDistKm: nearest?.distKm };
    }
    try {
      const estimate = await this.openMeteoProvider.fetchEstimateForCoordinates(lat, lng, locationName, city);
      return {
        primary: { ...estimate, distanceKm: nearest?.distKm },
        isEstimate: true,
        method: 'model' as const,
        nearestStationDistKm: nearest?.distKm,
      };
    } catch {
      if (nearest) {
        return { primary: { ...nearest.station, distanceKm: nearest.distKm }, isEstimate: false, method: 'station' as const, nearestStationDistKm: nearest.distKm };
      }
      throw new Error('No station or model data available for this location');
    }
  }

  async getLatestAQI(allowDevFixtures = false, bypassCache = false): Promise<AQIApiResponse> {
    const now = Date.now();
    const tooSoon = inMemoryCache ? now - inMemoryCache.createdAt < MIN_REFRESH_GAP_MS : false;
    if ((!bypassCache || tooSoon) && inMemoryCache && inMemoryCache.expiresAt > now) {
      return { ...inMemoryCache.data, cached: true };
    }
    if (inflight) return inflight; // de-duplicate concurrent refreshes
    inflight = this.refresh(allowDevFixtures).finally(() => {
      inflight = null;
    });
    return inflight;
  }

  private async refresh(allowDevFixtures: boolean): Promise<AQIApiResponse> {
    const sources: SourceStatus[] = [];
    const lists: StationMeasurement[][] = [];

    const run = async (id: string, name: string, configured: boolean, fn: () => Promise<StationMeasurement[]>) => {
      if (!configured) {
        sources.push({ id, name, configured: false, ok: false, stationCount: 0 });
        return;
      }
      try {
        const rows = await fn();
        lists.push(rows);
        sources.push({ id, name, configured: true, ok: true, stationCount: rows.length });
      } catch (err: any) {
        console.warn(`[aqi] ${name} failed:`, err?.message || err);
        sources.push({ id, name, configured: true, ok: false, stationCount: 0, error: String(err?.message || err).slice(0, 160) });
      }
    };

    await Promise.all([
      run('cpcb', 'CPCB via data.gov.in', this.cpcbProvider.isConfigured(), () => this.cpcbProvider.fetchStations()),
      run('openaq', 'OpenAQ v3', this.openaqProvider.isConfigured(), () => this.openaqProvider.fetchStations()),
    ]);

    const useFixtures =
      lists.every((l) => l.length === 0) &&
      allowDevFixtures &&
      (process.env.NODE_ENV === 'development' || process.env.ALLOW_FIXTURES === 'true');
    if (useFixtures) lists.push(this.cpcbProvider.normalizeRecords(CPCB_SAMPLE_RECORDS));

    let stations = this.reconcileStations(mergeProviderStations(...lists));

    // Offline stations: 1) distance-weighted estimate from nearby working stations, 2) CAMS model for the rest
    if (!useFixtures) {
      const real = stations.filter((s) => hasReading(s) && !s.isEstimate);
      let filled = 0;
      stations = stations.map((s) => {
        if (s.aqi !== null) return s;
        const est = estimateFromNeighbors(
          { id: s.id, name: s.name, city: s.city, state: s.state, latitude: s.latitude, longitude: s.longitude, agency: s.agency, address: s.address },
          real
        );
        if (est) filled++;
        return est ?? s;
      });
      if (filled > 0) sources.push({ id: 'neighbors', name: 'Nearby-station estimate (offline fill)', configured: true, ok: true, stationCount: filled });

      const offline = stations.filter((s) => s.aqi === null);
      if (offline.length > 0) {
        try {
          const targets: EstimateTarget[] = offline.map((s) => ({
            id: s.id, name: s.name, city: s.city, state: s.state,
            latitude: s.latitude, longitude: s.longitude, agency: s.agency, address: s.address,
          }));
          const estimates = await this.openMeteoProvider.fetchEstimatesBatch(targets);
          const byId = new Map(estimates.map((e) => [e.id, e]));
          stations = stations.map((s) => byId.get(s.id) ?? s);
          sources.push({ id: 'openmeteo', name: 'Open-Meteo CAMS model (offline fill)', configured: true, ok: true, stationCount: estimates.length });
        } catch (err: any) {
          sources.push({ id: 'openmeteo', name: 'Open-Meteo CAMS model (offline fill)', configured: true, ok: false, stationCount: 0, error: String(err?.message || err).slice(0, 160) });
        }
      }
    }

    const measured = stations.filter((s) => hasReading(s) && !s.isEstimate);
    const anyUpstreamOk = sources.some((s) => s.ok && (s.id === 'cpcb' || s.id === 'openaq') && s.stationCount > 0);

    // Everything upstream failed: serve last good data (marked stale) rather than blanking the site
    if (!anyUpstreamOk && !useFixtures && inMemoryCache) {
      return { ...inMemoryCache.data, cached: true, servedStale: true, sources, timestamp: new Date().toISOString() };
    }

    const result: AQIApiResponse = {
      success: measured.length > 0 || useFixtures,
      timestamp: new Date().toISOString(),
      source: useFixtures
        ? 'Developer test fixtures (NOT live)'
        : sources.filter((s) => s.ok && s.stationCount > 0).map((s) => s.name).join(' + ') || 'No live source available',
      cached: false,
      stations,
      cities: this.generateCitySummaries(stations),
      attribution: CPCB_ATTRIBUTION,
      sources,
      ...(!anyUpstreamOk && !useFixtures
        ? { error: this.isAnyProviderConfigured() ? 'UPSTREAM_UNAVAILABLE' : 'NO_API_KEY_CONFIGURED' }
        : {}),
    };

    if (measured.length > 0 && !useFixtures) {
      inMemoryCache = { data: result, expiresAt: Date.now() + CACHE_TTL_MS, createdAt: Date.now() };
    }
    return result;
  }

  /** Make sure every verified station exists in the list, marked offline when it has no reading. */
  public reconcileStations(activeStations: StationMeasurement[]): StationMeasurement[] {
    const resultMap = new Map<string, StationMeasurement>();
    for (const station of activeStations) resultMap.set(station.id, station);
    const now = new Date();

    for (const meta of DELHI_NCR_STATIONS) {
      if (resultMap.has(meta.id)) continue;
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
    return Array.from(resultMap.values());
  }

  /** City summaries use measured stations only; model estimates never feed averages or extremes. */
  private generateCitySummaries(stations: StationMeasurement[]): CitySummary[] {
    const cityGroups = new Map<string, StationMeasurement[]>();
    for (const s of stations) {
      if (!cityGroups.has(s.city)) cityGroups.set(s.city, []);
      cityGroups.get(s.city)!.push(s);
    }
    const summaries: CitySummary[] = [];
    for (const [cityName, cityStations] of cityGroups) {
      const active = cityStations.filter((s) => hasReading(s) && !s.isEstimate);
      const state = cityStations[0]?.state || 'Delhi';
      if (active.length === 0) {
        summaries.push({
          city: cityName, state, stationCount: cityStations.length, activeStationCount: 0,
          avgAqi: null, maxAqi: null, minAqi: null, dominantCategory: getAQICategory(null),
          worstStation: null, bestStation: null, lastUpdated: new Date().toISOString(),
        });
        continue;
      }
      let sum = 0;
      let minS = { name: active[0].name, aqi: active[0].aqi! };
      let maxS = { name: active[0].name, aqi: active[0].aqi! };
      for (const st of active) {
        const v = st.aqi!;
        sum += v;
        if (v < minS.aqi) minS = { name: st.name, aqi: v };
        if (v > maxS.aqi) maxS = { name: st.name, aqi: v };
      }
      const avg = Math.round(sum / active.length);
      summaries.push({
        city: cityName, state, stationCount: cityStations.length, activeStationCount: active.length,
        avgAqi: avg, maxAqi: maxS.aqi, minAqi: minS.aqi, dominantCategory: getAQICategory(avg),
        worstStation: maxS, bestStation: minS,
        lastUpdated: active.reduce((a, b) => (ts(b) > ts(a) ? b : a)).lastUpdated,
      });
    }
    return summaries.sort((a, b) => (b.avgAqi || 0) - (a.avgAqi || 0));
  }
}
