/**
 * AirScope India - Core Air Quality Data Model
 * Based on the Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) standards.
 */

export type AQIStandard = 'IN_NAQI' | 'US_AQI';

export type AQICategoryId =
  | 'good'
  | 'satisfactory'
  | 'moderate'
  | 'poor'
  | 'very_poor'
  | 'severe';

export interface AQICategoryInfo {
  id: AQICategoryId;
  label: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  healthStatement: string;
  actionAdvice: string;
  sensitiveGroupAdvice: string;
  maskRecommended: boolean;
  purifierRecommended: boolean;
  outdoorExerciseAdvice: 'safe' | 'caution' | 'avoid' | 'strictly_avoid';
}

export type PollutantId = 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'nh3';

export interface PollutantReading {
  id: PollutantId;
  name: string;
  formula: string;
  value: number | null;
  unit: string;
  subIndex: number | null;
  min?: number;
  max?: number;
  avg?: number;
  isAvailable: boolean;
}

export type DataFreshness = 'fresh' | 'delayed' | 'stale' | 'unavailable';

export interface StationMeasurement {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  aqi: number | null;
  aqiStandard: AQIStandard;
  category: AQICategoryInfo;
  prominentPollutant: PollutantId | null;
  pollutants: Record<PollutantId, PollutantReading>;
  lastUpdated: string; // ISO 8601 string
  fetchedAt: string;   // ISO 8601 string
  isStale: boolean;     // > 2 hours old
  freshnessStatus?: DataFreshness;
  source: string;       // e.g., "CPCB via data.gov.in"
  dataQualityStatus: 'active' | 'stale' | 'sensor_offline' | 'insufficient_data';
  agency?: string;
  address?: string;
  distanceKm?: number;
}

export interface CitySummary {
  city: string;
  state: string;
  stationCount: number;
  activeStationCount: number;
  avgAqi: number | null;
  maxAqi: number | null;
  minAqi: number | null;
  dominantCategory: AQICategoryInfo;
  worstStation: { name: string; aqi: number } | null;
  bestStation: { name: string; aqi: number } | null;
  lastUpdated: string;
}

export interface AQIApiResponse {
  success: boolean;
  timestamp: string;
  source: string;
  cached: boolean;
  stations: StationMeasurement[];
  cities: CitySummary[];
  attribution: {
    dataset: string;
    organization: string;
    license: string;
    licenseUrl: string;
    datasetUrl: string;
  };
  error?: string;
}
