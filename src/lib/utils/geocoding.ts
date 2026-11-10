/**
 * Geocoding Service for Indian Localities and Cities
 * Uses OpenStreetMap Nominatim with caching, bounded to India, with instant fallback to built-in NCR index.
 */
import { POPULAR_UNMONITORED_LOCALITIES, DELHI_NCR_STATIONS } from '../fixtures/delhi-stations';

export interface GeocodedLocation {
  name: string;
  displayName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  pincode?: string;
  source: 'verified_index' | 'nominatim_osm';
}

const cache = new Map<string, GeocodedLocation[]>();

export async function geocodeIndianLocation(query: string): Promise<GeocodedLocation[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  const lower = clean.toLowerCase();

  // 1. Check in-memory cache
  if (cache.has(lower)) {
    return cache.get(lower)!;
  }

  const results: GeocodedLocation[] = [];

  // 2. Check built-in verified station registry first (instant & infallible)
  for (const st of DELHI_NCR_STATIONS) {
    if (
      st.name.toLowerCase().includes(lower) ||
      st.slug.toLowerCase().includes(lower) ||
      st.address.toLowerCase().includes(lower) ||
      lower.includes(st.name.toLowerCase())
    ) {
      results.push({
        name: st.name,
        displayName: `${st.name}, ${st.city}, ${st.state}`,
        city: st.city,
        state: st.state,
        latitude: st.latitude,
        longitude: st.longitude,
        source: 'verified_index',
      });
    }
  }

  // 3. Check popular unmonitored localities (Saket, Hauz Khas, Connaught Place, etc.)
  for (const loc of POPULAR_UNMONITORED_LOCALITIES) {
    if (
      loc.name.toLowerCase().includes(lower) ||
      lower.includes(loc.name.toLowerCase()) ||
      (loc.pincode && lower.includes(loc.pincode))
    ) {
      results.push({
        name: loc.name,
        displayName: `${loc.name}, ${loc.city}`,
        city: loc.city,
        state: loc.city === 'Delhi' ? 'Delhi' : loc.city.includes('Noida') ? 'Uttar Pradesh' : 'Haryana',
        latitude: loc.latitude,
        longitude: loc.longitude,
        pincode: loc.pincode,
        source: 'verified_index',
      });
    }
  }

  // If local index matched, return top matches
  if (results.length > 0) {
    cache.set(lower, results.slice(0, 5));
    return results.slice(0, 5);
  }

  // 4. Fallback to OpenStreetMap Nominatim (restricted to countrycodes=in)
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', `${clean}, India`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('countrycodes', 'in');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '5');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'AirScope-India-AQI/1.0 (contact: info@airscope.org.in)',
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const items: any[] = await res.json();
      for (const item of items) {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (isNaN(lat) || isNaN(lon)) continue;

        const addr = item.address || {};
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.city_district ||
          addr.city ||
          addr.town ||
          item.name;

        const city = addr.city || addr.town || addr.county || addr.state_district || 'India';
        const state = addr.state || 'India';

        results.push({
          name: locality || item.display_name.split(',')[0],
          displayName: item.display_name,
          city,
          state,
          latitude: lat,
          longitude: lon,
          pincode: addr.postcode,
          source: 'nominatim_osm',
        });
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding error:', err);
  }

  cache.set(lower, results);
  return results;
}
