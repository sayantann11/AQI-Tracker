import { PollutantId, PollutantReading } from '@/types/aqi';
import { CPCB_BREAKPOINTS } from './breakpoints';

/**
 * Calculates the CPCB sub-index for a single pollutant concentration using linear interpolation.
 *
 * Formula:
 * Ip = [ (I_high - I_low) / (C_high - C_low) ] * (Cp - C_low) + I_low
 */
export function calculateSubIndex(pollutantId: PollutantId, concentration: number | null): number | null {
  if (concentration === null || concentration === undefined || isNaN(concentration) || concentration < 0) {
    return null;
  }

  const ranges = CPCB_BREAKPOINTS[pollutantId];
  if (!ranges || ranges.length === 0) return null;

  // Find matching range
  for (const range of ranges) {
    if (concentration >= range.cLow && concentration <= range.cHigh) {
      const subIndex =
        ((range.iHigh - range.iLow) / (range.cHigh - range.cLow)) * (concentration - range.cLow) + range.iLow;
      return Math.round(subIndex);
    }
  }

  // If concentration exceeds the highest range, cap at max scale (500)
  const lastRange = ranges[ranges.length - 1];
  if (concentration > lastRange.cHigh) {
    return 500;
  }

  return 0;
}

export interface AQICalculationResult {
  aqi: number | null;
  prominentPollutant: PollutantId | null;
  isSufficient: boolean;
  activeCount: number;
  subIndices: Partial<Record<PollutantId, number>>;
}

/**
 * Calculates the overall Indian National AQI (NAQI) from individual pollutant readings.
 * Follows CPCB data sufficiency rules:
 * - At least 3 valid pollutants must be present.
 * - At least one must be particulate matter (PM2.5 or PM10).
 * - Overall AQI is the maximum of all valid sub-indices.
 */
export function calculateNationalAQI(
  readings: Partial<Record<PollutantId, number | null>>
): AQICalculationResult {
  const subIndices: Partial<Record<PollutantId, number>> = {};
  let validCount = 0;
  let hasParticulate = false;

  for (const [key, value] of Object.entries(readings)) {
    const pollutantId = key as PollutantId;
    if (value !== null && value !== undefined && !isNaN(value) && value >= 0) {
      const sub = calculateSubIndex(pollutantId, value);
      if (sub !== null) {
        subIndices[pollutantId] = sub;
        validCount++;
        if (pollutantId === 'pm25' || pollutantId === 'pm10') {
          hasParticulate = true;
        }
      }
    }
  }

  // Official CPCB Data Sufficiency check:
  // Requires at least 3 pollutants with at least one PM2.5 or PM10
  const isSufficient = validCount >= 3 && hasParticulate;

  if (!isSufficient) {
    // If not officially sufficient according to CPCB 3-pollutant rule,
    // we still return the max sub-index as provisional if particulate exists,
    // but flag isSufficient as false.
    let provisionalMax: number | null = null;
    let prominent: PollutantId | null = null;

    for (const [key, sub] of Object.entries(subIndices)) {
      if (sub !== undefined && (provisionalMax === null || sub > provisionalMax)) {
        provisionalMax = sub;
        prominent = key as PollutantId;
      }
    }

    return {
      aqi: provisionalMax,
      prominentPollutant: prominent,
      isSufficient: false,
      activeCount: validCount,
      subIndices,
    };
  }

  let maxSubIndex = 0;
  let prominentPollutant: PollutantId | null = null;

  for (const [key, sub] of Object.entries(subIndices)) {
    if (sub !== undefined && sub >= maxSubIndex) {
      maxSubIndex = sub;
      prominentPollutant = key as PollutantId;
    }
  }

  return {
    aqi: maxSubIndex,
    prominentPollutant,
    isSufficient: true,
    activeCount: validCount,
    subIndices,
  };
}
