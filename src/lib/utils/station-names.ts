import { DELHI_NCR_STATIONS } from '../fixtures/delhi-stations';
import { calculateDistanceKm } from './geo';

const AGENCIES = 'CPCB|DPCC|UPPCB|HSPCB|RSPCB|IITM|IMD|MPCB|PPCB|BSPCB|WBPCB|KSPCB|TNPCB|GPCB|OSPCB';
const NAME_RE = new RegExp(`^(.*?)(?:,\\s*([^,]+?))?\\s*-\\s*(${AGENCIES})\\s*$`, 'i');

const CITY_ALIASES: Record<string, string> = {
  'new delhi': 'Delhi', delhi: 'Delhi', gurgaon: 'Gurugram', gurugram: 'Gurugram',
  noida: 'Noida', 'greater noida': 'Greater Noida', faridabad: 'Faridabad', ghaziabad: 'Ghaziabad',
};

const STATE_BY_CITY: Record<string, string> = {
  Delhi: 'Delhi', Noida: 'Uttar Pradesh', 'Greater Noida': 'Uttar Pradesh', Ghaziabad: 'Uttar Pradesh',
  Meerut: 'Uttar Pradesh', Baghpat: 'Uttar Pradesh', Bulandshahr: 'Uttar Pradesh', Modinagar: 'Uttar Pradesh', Khora: 'Uttar Pradesh',
  Gurugram: 'Haryana', Faridabad: 'Haryana', Sonipat: 'Haryana', Bahadurgarh: 'Haryana', Dharuhera: 'Haryana',
  Manesar: 'Haryana', Ballabgarh: 'Haryana', Panchgaon: 'Haryana', Panipat: 'Haryana', Rewari: 'Haryana', Bhiwadi: 'Rajasthan', Alwar: 'Rajasthan', Hapur: 'Uttar Pradesh',
};

const titleCase = (s: string) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

/** "Sector-116, Noida - UPPCB" -> { name: "Sector-116", cityHint: "Noida", agency: "UPPCB" } */
export function parseStationName(raw: string): { name: string; cityHint: string | null; agency: string | null } {
  const m = (raw || '').trim().match(NAME_RE);
  if (!m) return { name: (raw || '').trim(), cityHint: null, agency: null };
  return { name: m[1].trim() || raw.trim(), cityHint: m[2]?.trim() || null, agency: m[3].toUpperCase() };
}

/** Resolve a display city: explicit hint first, otherwise the nearest registry station within 25 km. */
export function inferCity(hint: string | null, lat: number, lng: number): string {
  if (hint) {
    const h = hint.trim();
    const alias = CITY_ALIASES[h.toLowerCase()];
    if (alias) return alias;
    // Guard against OpenAQ "locality" fields that are a state abbreviation or empty.
    const BAD = new Set(['up', 'uk', 'mp', 'hr', 'rj', 'dl', 'nct', 'in', 'india']);
    if (h.length >= 3 && !BAD.has(h.toLowerCase())) return titleCase(h);
  }
  let best: { city: string; d: number } | null = null;
  for (const s of DELHI_NCR_STATIONS) {
    const d = calculateDistanceKm(lat, lng, s.latitude, s.longitude);
    if (!best || d < best.d) best = { city: s.city, d };
  }
  return best && best.d <= 25 ? best.city : 'Delhi';
}

export function stateForCity(city: string): string {
  return STATE_BY_CITY[city] || 'India';
}
