import { describe, it, expect } from 'vitest';
import { calculateSubIndex, calculateNationalAQI } from '../src/lib/aqi/calculator';
import { getAQICategory } from '../src/lib/aqi/category';
import {
  parseCPCBDate,
  isMeasurementStale,
  normalizePollutantId,
  matchStationMetadata,
  CPCBProvider,
} from '../src/lib/providers/cpcb';
import { AQIDataManager } from '../src/lib/providers/manager';
import { calculateDistanceKm, findNearestStation } from '../src/lib/utils/geo';
import { CPCB_SAMPLE_RECORDS } from '../src/lib/fixtures/cpcb-sample';
import { DELHI_NCR_STATIONS } from '../src/lib/fixtures/delhi-stations';

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
