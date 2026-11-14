import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { calculateSubIndex, calculateNationalAQI } from '../src/lib/aqi/calculator';
import { getAQICategory } from '../src/lib/aqi/category';
import {
  parseCPCBDate,
  isMeasurementStale,
  normalizePollutantId,
  matchStationMetadata,
  getFreshnessStatus,
  CPCBProvider,
} from '../src/lib/providers/cpcb';
import { AQIDataManager, mergeProviderStations, pickBetterReading } from '../src/lib/providers/manager';
import { filterNCRRecords, isInNCR } from '../src/lib/providers/cpcb';
import { OpenAQProvider, convertToCpcbUnit } from '../src/lib/providers/openaq';
import { OpenMeteoProvider } from '../src/lib/providers/openmeteo';
import { estimateFromNeighbors } from '../src/lib/aqi/neighbors';
import { parseStationName, inferCity, stateForCity } from '../src/lib/utils/station-names';
import { matchStationWithin } from '../src/lib/utils/geo';
import { calculateDistanceKm, findNearestStation, resolveLocalityOrStation } from '../src/lib/utils/geo';
import { CPCB_SAMPLE_RECORDS } from '../src/lib/fixtures/cpcb-sample';
import { DELHI_NCR_STATIONS } from '../src/lib/fixtures/delhi-stations';

// Fixtures carry a fixed 10-Nov-2026 21:00 IST timestamp. Freeze "now" so freshness assertions are deterministic.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-10T16:00:00Z'));
  process.env.ALLOW_FIXTURES = 'true';
});
afterAll(() => {
  vi.useRealTimers();
  delete process.env.ALLOW_FIXTURES;
});

describe('Official CPCB National AQI (NAQI) Breakpoint Calculations', () => {
  it('correctly calculates PM2.5 sub-indices according to official CPCB breakpoints', () => {
    // Range 0-30 -> AQI 0-50
    expect(calculateSubIndex('pm25', 15)).toBe(25);
    expect(calculateSubIndex('pm25', 30)).toBe(50);

    // Range 31-60 -> AQI 51-100
    expect(calculateSubIndex('pm25', 45)).toBe(75);
    expect(calculateSubIndex('pm25', 60)).toBe(100);

    // Range 61-90 -> AQI 101-200
    expect(calculateSubIndex('pm25', 75)).toBe(149);
    expect(calculateSubIndex('pm25', 90)).toBe(200);

    // Range 91-120 -> AQI 201-300
    expect(calculateSubIndex('pm25', 105)).toBe(249);
    expect(calculateSubIndex('pm25', 120)).toBe(300);

    // Range 121-250 -> AQI 301-400
    expect(calculateSubIndex('pm25', 185)).toBe(350);
    expect(calculateSubIndex('pm25', 250)).toBe(400);

    // Range 251+ -> AQI 401-500
    expect(calculateSubIndex('pm25', 375)).toBe(450);
    expect(calculateSubIndex('pm25', 600)).toBe(500); // capped at max 500
  });

  it('correctly calculates PM10 sub-indices', () => {
    expect(calculateSubIndex('pm10', 25)).toBe(25);
    expect(calculateSubIndex('pm10', 50)).toBe(50);
    expect(calculateSubIndex('pm10', 100)).toBe(100);
    expect(calculateSubIndex('pm10', 175)).toBe(150);
    expect(calculateSubIndex('pm10', 300)).toBe(250);
    expect(calculateSubIndex('pm10', 390)).toBe(350);
    expect(calculateSubIndex('pm10', 500)).toBe(441);
  });

  it('returns null for missing, negative, or invalid concentrations', () => {
    expect(calculateSubIndex('pm25', null)).toBeNull();
    expect(calculateSubIndex('pm25', -5)).toBeNull();
    expect(calculateSubIndex('pm25', NaN)).toBeNull();
  });
});

describe('CPCB Data Sufficiency and Overall AQI Aggregation', () => {
  it('enforces CPCB 3-pollutant minimum and particulate requirement', () => {
    // Only 2 pollutants (PM2.5 and NO2): not sufficient for official CPCB NAQI
    const partialResult = calculateNationalAQI({
      pm25: 60,
      no2: 40,
    });
    expect(partialResult.isSufficient).toBe(false);
    expect(partialResult.activeCount).toBe(2);

    // 3 pollutants without PM2.5 or PM10 (e.g. NO2, SO2, CO): not sufficient
    const noPmResult = calculateNationalAQI({
      no2: 40,
      so2: 40,
      co: 1.0,
    });
    expect(noPmResult.isSufficient).toBe(false);

    // 3 pollutants with PM2.5: valid CPCB NAQI
    const validResult = calculateNationalAQI({
      pm25: 60, // sub-index 100
      no2: 40,  // sub-index 50
      co: 1.0,  // sub-index 50
    });
    expect(validResult.isSufficient).toBe(true);
    expect(validResult.aqi).toBe(100);
    expect(validResult.prominentPollutant).toBe('pm25');
  });

  it('sets overall AQI to the maximum of all valid sub-indices', () => {
    const result = calculateNationalAQI({
      pm25: 30, // sub-index 50
      pm10: 200, // sub-index 167
      no2: 30,  // sub-index 38
    });
    expect(result.isSufficient).toBe(true);
    expect(result.aqi).toBe(167);
    expect(result.prominentPollutant).toBe('pm10');
  });
});

describe('CPCB AQI Category Mapping', () => {
  it('correctly maps all 6 official Indian AQI tiers', () => {
    expect(getAQICategory(25).id).toBe('good');
    expect(getAQICategory(50).id).toBe('good');
    expect(getAQICategory(75).id).toBe('satisfactory');
    expect(getAQICategory(100).id).toBe('satisfactory');
    expect(getAQICategory(150).id).toBe('moderate');
    expect(getAQICategory(200).id).toBe('moderate');
    expect(getAQICategory(250).id).toBe('poor');
    expect(getAQICategory(300).id).toBe('poor');
    expect(getAQICategory(350).id).toBe('very_poor');
    expect(getAQICategory(400).id).toBe('very_poor');
    expect(getAQICategory(450).id).toBe('severe');
    expect(getAQICategory(500).id).toBe('severe');
  });

  it('handles null AQI gracefully with an Unavailable indicator', () => {
    const category = getAQICategory(null);
    expect(category.label).toBe('Unavailable');
    expect(category.color).toBe('#64748b');
  });
});

describe('Timestamp and Stale Data Detection', () => {
  it('parses CPCB date format "DD-MM-YYYY HH:MM:SS" correctly', () => {
    const d = parseCPCBDate('10-11-2026 14:30:00');
    expect(d).toBeInstanceOf(Date);
    expect(isNaN(d.getTime())).toBe(false);
  });

  it('identifies readings older than 2 hours as stale', () => {
    const now = new Date('2026-11-10T16:00:00Z');
    const fresh = new Date('2026-11-10T15:00:00Z'); // 1 hr old
    const stale = new Date('2026-11-10T13:00:00Z'); // 3 hrs old

    expect(isMeasurementStale(fresh, now)).toBe(false);
    expect(isMeasurementStale(stale, now)).toBe(true);
  });
});

describe('Raw CPCB Normalization Layer', () => {
  it('normalizes raw CPCB record fixtures into StationMeasurements', () => {
    const provider = new CPCBProvider();
    const stations = provider.normalizeRecords(CPCB_SAMPLE_RECORDS);

    expect(stations.length).toBeGreaterThan(0);

    const anandVihar = stations.find((s) => s.name.toLowerCase().includes('anand vihar'));
    expect(anandVihar).toBeDefined();
    expect(anandVihar?.city).toBe('Delhi');
    expect(anandVihar?.aqi).not.toBeNull();
    expect(anandVihar?.pollutants.pm25.isAvailable).toBe(true);
    expect(anandVihar?.pollutants.pm10.isAvailable).toBe(true);
    expect(anandVihar?.latitude).toBeCloseTo(28.6468, 2);
    expect(anandVihar?.longitude).toBeCloseTo(77.3160, 2);
  });

  it('normalizes variant pollutant strings to standard PollutantId', () => {
    expect(normalizePollutantId('PM2.5')).toBe('pm25');
    expect(normalizePollutantId('PM-2.5')).toBe('pm25');
    expect(normalizePollutantId('pm10')).toBe('pm10');
    expect(normalizePollutantId('NO2')).toBe('no2');
    expect(normalizePollutantId('OZONE')).toBe('o3');
    expect(normalizePollutantId('O3')).toBe('o3');
    expect(normalizePollutantId('UNKNOWN_GAS')).toBeNull();
  });
});

describe('Geographic Utilities', () => {
  it('calculates Haversine distances accurately', () => {
    // Connaught Place to Anand Vihar is ~11 km
    const dist = calculateDistanceKm(28.6315, 77.2167, 28.6468, 77.3160);
    expect(dist).toBeGreaterThan(9);
    expect(dist).toBeLessThan(13);
  });

  it('finds the nearest monitoring station to a user coordinate', () => {
    // Coordinate near Dwarka Sector 8 (28.5766, 77.0766)
    const nearest = findNearestStation(28.5800, 77.0800, DELHI_NCR_STATIONS);
    expect(nearest).not.toBeNull();
    expect(nearest?.station.name).toContain('Dwarka');
    expect(nearest?.distanceKm).toBeLessThan(1.5);
  });
});

describe('All Criteria Pollutants Sub-Index Calculation', () => {
  it('correctly calculates sub-indices for NO2, SO2, CO, O3, and NH3', () => {
    // NO2: 0-40 -> 0-50, 41-80 -> 51-100, 81-180 -> 101-200
    expect(calculateSubIndex('no2', 20)).toBe(25);
    expect(calculateSubIndex('no2', 60)).toBe(75);
    expect(calculateSubIndex('no2', 130)).toBe(150);

    // SO2: 0-40 -> 0-50, 41-80 -> 51-100
    expect(calculateSubIndex('so2', 20)).toBe(25);
    expect(calculateSubIndex('so2', 60)).toBe(75);

    // CO: 0-1.0 -> 0-50, 1.1-2.0 -> 51-100, 2.1-10.0 -> 101-200 (mg/m3)
    expect(calculateSubIndex('co', 0.5)).toBe(25);
    expect(calculateSubIndex('co', 1.5)).toBe(73);

    // O3: 0-50 -> 0-50, 51-100 -> 51-100
    expect(calculateSubIndex('o3', 25)).toBe(25);
    expect(calculateSubIndex('o3', 75)).toBe(75);

    // NH3: 0-200 -> 0-50, 201-400 -> 51-100
    expect(calculateSubIndex('nh3', 100)).toBe(25);
    expect(calculateSubIndex('nh3', 300)).toBe(75);
  });
});

describe('Station Metadata Fuzzy Matching Layer', () => {
  it('accurately resolves real-world CPCB CAAQMS feed strings', () => {
    // Anand Vihar with agency suffix
    const av = matchStationMetadata('Anand Vihar, Delhi - DPCC', 'Delhi');
    expect(av).not.toBeNull();
    expect(av?.slug).toBe('anand-vihar');
    expect(av?.agency).toBe('DPCC');

    // Sector-62 Noida
    const n62 = matchStationMetadata('Sector-62, Noida - IITM', 'Noida');
    expect(n62).not.toBeNull();
    expect(n62?.slug).toBe('noida-sector-62');

    // Burari Crossing
    const burari = matchStationMetadata('Burari Crossing, Delhi - IITM', 'Delhi');
    expect(burari).not.toBeNull();
    expect(burari?.slug).toBe('burari');

    // Punjabi Bagh
    const pb = matchStationMetadata('Punjabi Bagh, Delhi - DPCC', 'Delhi');
    expect(pb).not.toBeNull();
    expect(pb?.slug).toBe('punjabi-bagh');
    // Ensure coordinates are not inverted (Punjabi Bagh is ~28.6740, 77.1310)
    expect(pb?.latitude).toBeCloseTo(28.6740, 3);
    expect(pb?.longitude).toBeCloseTo(77.1310, 3);

    // R.K. Puram
    const rkp = matchStationMetadata('R K Puram, Delhi - DPCC', 'Delhi');
    expect(rkp).not.toBeNull();
    expect(rkp?.slug).toBe('rk-puram');
    // Ensure coordinates are not inverted (R.K. Puram is ~28.5633, 77.1869)
    expect(rkp?.latitude).toBeCloseTo(28.5633, 3);
    expect(rkp?.longitude).toBeCloseTo(77.1869, 3);
  });
});

describe('Regional City Summaries Isolation', () => {
  it('does not leak NCR satellite cities into Delhi city summary', async () => {
    const manager = new AQIDataManager();
    const result = await manager.getLatestAQI(true);

    expect(result.success).toBe(true);
    expect(result.cities.length).toBeGreaterThan(0);

    const delhiSummary = result.cities.find((c) => c.city.toLowerCase() === 'delhi');
    expect(delhiSummary).toBeDefined();

    // Verify all stations contributing to Delhi average are actually Delhi stations
    const delhiStations = result.stations.filter((s) => s.city.toLowerCase() === 'delhi');
    for (const s of delhiStations) {
      expect(s.city.toLowerCase()).toBe('delhi');
      expect(s.city.toLowerCase()).not.toBe('noida');
      expect(s.city.toLowerCase()).not.toBe('gurugram');
      expect(s.city.toLowerCase()).not.toBe('faridabad');
      expect(s.city.toLowerCase()).not.toBe('ghaziabad');
    }
  });
});

describe('Production Audit Fixes & Regressions', () => {
  it('reconciles all 34 verified official stations and national feeds into the baseline dataset', () => {
    const manager = new AQIDataManager();
    const defaultProvider = new CPCBProvider();
    const sampleRecords = defaultProvider.normalizeRecords(CPCB_SAMPLE_RECORDS);
    const reconciled = manager.reconcileStations(sampleRecords);

    // Expect all verified stations from DELHI_NCR_STATIONS plus metro stations to be present
    expect(reconciled.length).toBeGreaterThanOrEqual(DELHI_NCR_STATIONS.length);

    // Verify key NCR stations exist with active reporting telemetry
    const rkp = reconciled.find((s) => s.id === 'delhi-rk-puram');
    expect(rkp).toBeDefined();
    expect(rkp?.name).toBe('R.K. Puram');
    expect(rkp?.city).toBe('Delhi');
    expect(rkp?.aqi).not.toBeNull();
    expect(rkp?.pollutants.pm25.isAvailable).toBe(true);

    const av = reconciled.find((s) => s.id === 'delhi-anand-vihar');
    expect(av).toBeDefined();
    expect(av?.name).toBe('Anand Vihar');
    expect(av?.aqi).not.toBeNull();

    const sec125 = reconciled.find((s) => s.id === 'noida-sec125');
    expect(sec125).toBeDefined();
    expect(sec125?.city).toBe('Noida');
    expect(sec125?.aqi).not.toBeNull();

    const sec1 = reconciled.find((s) => s.id === 'noida-sec1');
    expect(sec1).toBeDefined();

    const okhla = reconciled.find((s) => s.id === 'delhi-okhla-ph2');
    expect(okhla).toBeDefined();
    expect(okhla?.aqi).not.toBeNull();

    const vs = reconciled.find((s) => s.id === 'gurugram-vikas-sadan');
    expect(vs).toBeDefined();
    expect(vs?.aqi).not.toBeNull();

    const sec51 = reconciled.find((s) => s.id === 'gurugram-sec51');
    expect(sec51).toBeDefined();
    expect(sec51?.aqi).not.toBeNull();

    // Verify national metro stations (Kolkata, Mumbai, Bengaluru)
    const kolkataStation = reconciled.find((s) => s.city.toLowerCase() === 'kolkata');
    expect(kolkataStation).toBeDefined();
    expect(kolkataStation?.aqi).not.toBeNull();

    const mumbaiStation = reconciled.find((s) => s.city.toLowerCase() === 'mumbai');
    expect(mumbaiStation).toBeDefined();
    expect(mumbaiStation?.aqi).not.toBeNull();

    const blrStation = reconciled.find((s) => s.city.toLowerCase() === 'bengaluru');
    expect(blrStation).toBeDefined();
    expect(blrStation?.aqi).not.toBeNull();
  });

  it('correctly resolves unmonitored localities like Saket to nearest verified stations without fabricating an AQI', () => {
    const manager = new AQIDataManager();
    const defaultProvider = new CPCBProvider();
    const sampleRecords = defaultProvider.normalizeRecords(CPCB_SAMPLE_RECORDS);
    const stations = manager.reconcileStations(sampleRecords);

    const result = resolveLocalityOrStation('Saket', stations);
    expect(result.unmonitoredMatch).toBeDefined();
    expect(result.unmonitoredMatch?.locality.name).toBe('Saket');
    expect(result.unmonitoredMatch?.nearestStations.length).toBeGreaterThan(0);

    const nearest = result.unmonitoredMatch?.nearestStations[0];
    expect(nearest).toBeDefined();
    expect(nearest?.distanceKm).toBeGreaterThan(0);
    // Nearest station to Saket coordinates (28.5244, 77.2066) is Okhla or R.K. Puram (< 8 km)
    expect(nearest?.distanceKm).toBeLessThan(10);
  });

  it('accurately evaluates 4-tier data freshness status', () => {
    const now = new Date('2026-11-10T14:00:00Z');

    // 30 mins ago -> fresh
    const freshDate = new Date('2026-11-10T13:30:00Z');
    expect(getFreshnessStatus(freshDate, now)).toBe('fresh');

    // 2 hours ago -> delayed
    const delayedDate = new Date('2026-11-10T12:00:00Z');
    expect(getFreshnessStatus(delayedDate, now)).toBe('delayed');

    // 4 hours ago -> stale
    const staleDate = new Date('2026-11-10T10:00:00Z');
    expect(getFreshnessStatus(staleDate, now)).toBe('stale');
  });

  it('verifies station resolution across all 9 required target locations', async () => {
    const manager = new AQIDataManager();
    const defaultProvider = new CPCBProvider();
    const sampleRecords = defaultProvider.normalizeRecords(CPCB_SAMPLE_RECORDS);
    const stations = manager.reconcileStations(sampleRecords);

    // 1. Saket -> Nearest is R.K. Puram or Okhla (< 10 km)
    const saketRes = resolveLocalityOrStation('Saket', stations);
    expect(saketRes.unmonitoredMatch).toBeDefined();
    expect(saketRes.unmonitoredMatch?.nearestStations[0].distanceKm).toBeLessThan(10);

    // 2. Connaught Place -> Nearest is Mandir Marg or ITO (< 5 km)
    const cpRes = resolveLocalityOrStation('Connaught Place', stations);
    expect(cpRes.unmonitoredMatch).toBeDefined();
    expect(cpRes.unmonitoredMatch?.nearestStations[0].distanceKm).toBeLessThan(5);

    // 3. Anand Vihar -> Direct station match
    const avRes = resolveLocalityOrStation('Anand Vihar', stations);
    expect(avRes.matchedStations.length).toBeGreaterThan(0);
    expect(avRes.matchedStations[0].id).toBe('delhi-anand-vihar');

    // 4. India Gate -> Nearest is JLN Stadium or Mandir Marg (< 6 km)
    const igLoc = { lat: 28.6129, lng: 77.2295 };
    const igNearest = findNearestStation(igLoc.lat, igLoc.lng, stations);
    expect(igNearest).toBeDefined();
    expect(igNearest?.distanceKm).toBeLessThan(6);

    // 5. Noida -> Stations in Noida
    const noidaStations = stations.filter((s) => s.city.toLowerCase() === 'noida');
    expect(noidaStations.length).toBeGreaterThanOrEqual(3);

    // 6. Gurugram -> Stations in Gurugram
    const gurugramStations = stations.filter((s) => s.city.toLowerCase() === 'gurugram');
    expect(gurugramStations.length).toBeGreaterThanOrEqual(4);

    // 7. Kolkata -> Stations in Kolkata (Victoria / Ballygunge)
    const kolkataStations = stations.filter((s) => s.city.toLowerCase() === 'kolkata');
    expect(kolkataStations.length).toBeGreaterThanOrEqual(1);

    // 8. Mumbai -> Stations in Mumbai (Worli / Colaba)
    const mumbaiStations = stations.filter((s) => s.city.toLowerCase() === 'mumbai');
    expect(mumbaiStations.length).toBeGreaterThanOrEqual(1);

    // 9. Bengaluru -> Stations in Bengaluru (Silk Board / Peenya)
    const blrStations = stations.filter((s) => s.city.toLowerCase() === 'bengaluru');
    expect(blrStations.length).toBeGreaterThanOrEqual(1);
  });

  it('decouples station online status from individual pollutant availability', () => {
    const defaultProvider = new CPCBProvider();
    const records = defaultProvider.normalizeRecords(CPCB_SAMPLE_RECORDS);

    for (const st of records) {
      // If station has active pollutants, it is marked reporting
      if (st.aqi !== null) {
        expect(st.stationStatus).toBe('reporting');
      }
      // Each pollutant has an explicit pollutantStatus
      expect(st.pollutants.pm25.pollutantStatus).toBe('available');
    }
  });

  it('bypasses offline stations when finding the nearest reporting station', () => {
    const mockStations: any[] = [
      {
        id: 'station-offline',
        name: 'Offline Station',
        latitude: 28.5200,
        longitude: 77.2000,
        aqi: null,
        dataQualityStatus: 'sensor_offline',
      },
      {
        id: 'station-online',
        name: 'Online Station',
        latitude: 28.5500,
        longitude: 77.2100,
        aqi: 280,
        dataQualityStatus: 'active',
      },
    ];

    // Find nearest only among active reporting stations
    const activeOnly = mockStations.filter((s) => s.aqi !== null);
    const nearest = findNearestStation(28.5201, 77.2001, activeOnly);
    expect(nearest?.station.id).toBe('station-online');
  });
});


describe('Multi-source merge, backup providers and NCR filtering', () => {
  const base = (over: any): any => ({
    id: 'x', name: 'X', city: 'Delhi', state: 'Delhi', latitude: 28.6, longitude: 77.2,
    aqi: 200, lastUpdated: '2026-11-10T14:00:00Z', ...over,
  });

  it('prefers a station that has a reading over an offline one', () => {
    const a = base({ aqi: null });
    const b = base({ aqi: 180 });
    expect(pickBetterReading(a, b).aqi).toBe(180);
    expect(pickBetterReading(b, a).aqi).toBe(180);
  });

  it('prefers the fresher reading when both have data', () => {
    const old = base({ aqi: 300, lastUpdated: '2026-11-10T08:00:00Z' });
    const fresh = base({ aqi: 280, lastUpdated: '2026-11-10T15:00:00Z' });
    expect(pickBetterReading(old, fresh).aqi).toBe(280);
  });

  it('merges the same physical station from two feeds into one, keeping the registry identity', () => {
    const cpcb = base({ id: 'delhi-ito', name: 'ITO', aqi: 250, lastUpdated: '2026-11-10T09:00:00Z', latitude: 28.6286, longitude: 77.2410 });
    const openaq = base({ id: 'openaq-123', name: 'ITO, Delhi - CPCB', aqi: 262, lastUpdated: '2026-11-10T15:00:00Z', latitude: 28.6288, longitude: 77.2412 });
    const merged = mergeProviderStations([cpcb], [openaq]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('delhi-ito');
    expect(merged[0].name).toBe('ITO');
    expect(merged[0].aqi).toBe(262);
  });

  it('keeps distinct stations that are far apart', () => {
    const a = base({ id: 'a', latitude: 28.6, longitude: 77.2 });
    const b = base({ id: 'b', latitude: 28.9, longitude: 77.5 });
    expect(mergeProviderStations([a], [b])).toHaveLength(2);
  });

  it('drops non-NCR rows from the national CPCB feed', () => {
    const rows: any[] = [
      { station: 'Anand Vihar, Delhi - DPCC', city: 'Delhi', latitude: '28.6468', longitude: '77.316' },
      { station: 'Worli, Mumbai - MPCB', city: 'Mumbai', latitude: '19.0', longitude: '72.8' },
      { station: 'Unknown No Coords', city: 'Noida' },
      { station: 'Unknown No Coords 2', city: 'Chennai' },
    ];
    const kept = filterNCRRecords(rows).map((r: any) => r.station);
    expect(kept).toEqual(['Anand Vihar, Delhi - DPCC', 'Unknown No Coords']);
    expect(isInNCR(28.6, 77.2)).toBe(true);
    expect(isInNCR(19, 72.8)).toBe(false);
  });

  it('converts OpenAQ units to CPCB units', () => {
    expect(convertToCpcbUnit('pm25', 120, 'µg/m³')).toBe(120);
    expect(convertToCpcbUnit('co', 1500, 'µg/m³')).toBe(1.5);
    expect(convertToCpcbUnit('co', 1, 'ppm')).toBe(1.15);
    expect(convertToCpcbUnit('pm25', -5, 'µg/m³')).toBeNull();
    expect(convertToCpcbUnit('pm10', 99999, 'µg/m³')).toBeNull();
  });

  it('normalizes an OpenAQ v3 location + latest rows into a station', () => {
    const provider = new OpenAQProvider('test');
    const loc = {
      id: 8118, name: 'ITO, Delhi - CPCB', isMonitor: true,
      coordinates: { latitude: 28.6286, longitude: 77.2410 },
      sensors: [
        { id: 1, parameter: { name: 'pm25', units: 'µg/m³' } },
        { id: 2, parameter: { name: 'pm10', units: 'µg/m³' } },
        { id: 3, parameter: { name: 'no2', units: 'µg/m³' } },
      ],
    };
    const iso = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const rows = [
      { sensorsId: 1, value: 182, datetime: { utc: iso } },
      { sensorsId: 2, value: 250, datetime: { utc: iso } },
      { sensorsId: 3, value: 60, datetime: { utc: iso } },
    ];
    const st = provider.normalizeLocation(loc, rows)!;
    expect(st.id).toBe('delhi-ito');
    expect(st.aqi).toBe(348);
    expect(st.freshnessStatus).toBe('fresh');
    expect(st.isEstimate).toBeUndefined();
    expect(provider.normalizeLocation(loc, [])).toBeNull();
  });

  it('builds a clearly labelled model estimate from Open-Meteo data', () => {
    const om = new OpenMeteoProvider();
    const est = om.buildEstimate(
      { id: 'delhi-ito', name: 'ITO', city: 'Delhi', state: 'Delhi', latitude: 28.6, longitude: 77.2 },
      { time: '2026-11-10T15:00', pm2_5: 150, pm10: 230, nitrogen_dioxide: 40, sulphur_dioxide: 10, ozone: 30, carbon_monoxide: 900 }
    );
    expect(est.isEstimate).toBe(true);
    expect(est.dataQualityStatus).toBe('model_estimate');
    expect(est.aqi).not.toBeNull();
    expect(est.lastUpdated).toBe('2026-11-10T15:00:00.000Z');
    expect(est.estimateNote).toMatch(/model/i);
  });

  it('never serves fixtures as live data unless explicitly allowed', async () => {
    delete process.env.ALLOW_FIXTURES;
    const res = await new AQIDataManager().getLatestAQI(true, true);
    expect(res.success).toBe(false);
    expect(res.error).toBe('NO_API_KEY_CONFIGURED');
    expect(res.stations.every((s) => s.aqi === null || s.isEstimate)).toBe(true);
    process.env.ALLOW_FIXTURES = 'true';
  });
});

describe('Nearby-station estimates for areas without a monitor', () => {
  const mk = (id: string, lat: number, lng: number, pm25: number, pm10: number, over: any = {}): any => ({
    id, name: id, city: 'Delhi', state: 'Delhi', latitude: lat, longitude: lng, aqi: 100, isEstimate: false,
    lastUpdated: new Date().toISOString(),
    pollutants: { pm25: { value: pm25 }, pm10: { value: pm10 }, no2: { value: null }, so2: { value: null }, co: { value: null }, o3: { value: null }, nh3: { value: null } },
    ...over,
  });
  const target = { id: 'est-x', name: 'X', city: 'Delhi', state: 'Delhi', latitude: 28.6, longitude: 77.2 };

  it('averages two equidistant stations', () => {
    const a = mk('a', 28.6, 77.15, 100, 200);
    const b = mk('b', 28.6, 77.25, 200, 300);
    const est = estimateFromNeighbors(target, [a, b])!;
    expect(est.isEstimate).toBe(true);
    expect(est.pollutants.pm25.value).toBe(150);
    expect(est.pollutants.pm10.value).toBe(250);
    expect(est.aqi).not.toBeNull();
    expect(est.estimateNote).toMatch(/nearby official stations/);
  });

  it('weights the closer station more', () => {
    const near = mk('near', 28.6, 77.21, 100, 150);
    const far = mk('far', 28.6, 77.30, 300, 400);
    const est = estimateFromNeighbors(target, [near, far])!;
    expect(est.pollutants.pm25.value!).toBeLessThan(150);
  });

  it('ignores stations beyond the radius, stale, offline or estimated ones', () => {
    const tooFar = mk('far', 29.5, 77.2, 100, 100);
    const stale = mk('old', 28.6, 77.21, 100, 100, { lastUpdated: new Date(Date.now() - 10 * 3600000).toISOString() });
    const offline = mk('off', 28.6, 77.21, 100, 100, { aqi: null });
    const est = mk('est', 28.6, 77.21, 100, 100, { isEstimate: true });
    expect(estimateFromNeighbors(target, [tooFar, stale, offline, est])).toBeNull();
  });
});

describe('Station naming and matching', () => {
  it('splits agency/city suffixes from OpenAQ-style names', () => {
    expect(parseStationName('Sector-116, Noida - UPPCB')).toEqual({ name: 'Sector-116', cityHint: 'Noida', agency: 'UPPCB' });
    expect(parseStationName('Sirifort, Delhi - CPCB').name).toBe('Sirifort');
    expect(parseStationName('Rajiv Chowk').cityHint).toBeNull();
  });
  it('infers the right city instead of defaulting everything to Delhi', () => {
    expect(inferCity('Noida', 28.5, 77.4)).toBe('Noida');
    expect(inferCity('Gurgaon', 28.4, 77.0)).toBe('Gurugram');
    expect(inferCity('Baghpat', 28.9, 77.2)).toBe('Baghpat');
    expect(stateForCity('Baghpat')).toBe('Uttar Pradesh');
    expect(inferCity(null, 28.4067, 77.3178)).toBe('Faridabad');
  });
  it('does not match a station that is more than 1.2 km away (DTU must not become Rohini Sec-16)', () => {
    expect(matchStationWithin(28.75005, 77.11126, 1.2)).toBeNull();
    expect(matchStationWithin(28.7325, 77.1199, 1.2)?.id).toBe('delhi-rohini-sec16');
  });
});

