/**
 * Geocoding & Reverse-Geocoding Service for Indian Localities and Cities
 * Uses local verified index + Photon Komoot OSM API (open CORS, no auth key, bounded to India).
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
  source: 'verified_index' | 'photon_osm' | 'nominatim_osm';
}

export interface ReverseGeocodedResult {
  locality: string;
  city: string;
  state: string;
  displayName: string;
  pincode?: string;
}

const forwardCache = new Map<string, GeocodedLocation[]>();
const reverseCache = new Map<string, ReverseGeocodedResult>();

/**
 * Forward Geocoding: resolves place name / locality / city to Indian coordinates.
 */
export async function geocodeIndianLocation(query: string): Promise<GeocodedLocation[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  const lower = clean.toLowerCase();

  // 1. Check in-memory cache
  if (forwardCache.has(lower)) {
    return forwardCache.get(lower)!;
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

  // If local index matched high confidence, return
  if (results.length > 0) {
    forwardCache.set(lower, results.slice(0, 5));
    return results.slice(0, 5);
  }

  // 4. Photon Komoot OSM API (has open CORS, zero key required, reliable for India)
  try {
    const photonUrl = new URL('https://photon.komoot.io/api/');
    photonUrl.searchParams.set('q', `${clean} India`);
    photonUrl.searchParams.set('limit', '5');

    const res = await fetch(photonUrl.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const features = data.features || [];

      for (const feat of features) {
        const coords = feat.geometry?.coordinates;
        if (!coords || coords.length < 2) continue;
        const [lon, lat] = coords;
        const props = feat.properties || {};

        // Filter to India
        if (props.countrycode && props.countrycode.toUpperCase() !== 'IN') continue;

        const locName = props.name || props.district || props.city || clean;
        const city = props.city || props.district || props.county || 'India';
        const state = props.state || 'India';
        const parts = [props.name, props.district, props.city, props.state].filter(Boolean);
        const displayName = parts.length > 0 ? parts.join(', ') : `${locName}, India`;

        results.push({
          name: locName,
          displayName,
          city,
          state,
          latitude: lat,
          longitude: lon,
          pincode: props.postcode,
          source: 'photon_osm',
        });
      }
    }
  } catch (err) {
    console.warn('Photon geocoding error:', err);
  }

  forwardCache.set(lower, results);
  return results;
}

/**
 * Reverse Geocoding: resolves user GPS (lat, lng) to meaningful locality, city, state.
 * Uses Photon Komoot reverse geocoding with local fallback. Never hardcodes an unrelated city.
 */
export async function reverseGeocodeIndianCoordinates(
  lat: number,
  lng: number
): Promise<ReverseGeocodedResult> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey)!;
  }

  // 1. Check if within 2 km of a known Delhi NCR station or locality
  for (const st of DELHI_NCR_STATIONS) {
    const dLat = Math.abs(st.latitude - lat);
    const dLng = Math.abs(st.longitude - lng);
    if (dLat < 0.02 && dLng < 0.02) {
      const result: ReverseGeocodedResult = {
        locality: st.name,
        city: st.city,
        state: st.state,
        displayName: `${st.name}, ${st.city}`,
      };
      reverseCache.set(cacheKey, result);
      return result;
    }
  }

  for (const loc of POPULAR_UNMONITORED_LOCALITIES) {
    const dLat = Math.abs(loc.latitude - lat);
    const dLng = Math.abs(loc.longitude - lng);
    if (dLat < 0.02 && dLng < 0.02) {
      const result: ReverseGeocodedResult = {
        locality: loc.name,
        city: loc.city,
        state: loc.city === 'Delhi' ? 'Delhi' : loc.city.includes('Noida') ? 'Uttar Pradesh' : 'Haryana',
        displayName: `${loc.name}, ${loc.city}`,
        pincode: loc.pincode,
      };
      reverseCache.set(cacheKey, result);
      return result;
    }
  }

  // 2. Query Photon Komoot reverse geocoding API
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      const props = data.features?.[0]?.properties;
      if (props) {
        const locality =
          props.district ||
          props.locality ||
          props.suburb ||
          props.neighbourhood ||
          props.name ||
          props.city ||
          'Your Location';
        const city = props.city || props.county || props.district || 'India';
        const state = props.state || 'India';
        const parts = [locality, city !== locality ? city : null, state].filter(Boolean);

        const result: ReverseGeocodedResult = {
          locality,
          city,
          state,
          displayName: parts.join(', '),
          pincode: props.postcode,
        };
        reverseCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn('Photon reverse geocoding error:', err);
  }

  // 3. Fallback when network is offline: coordinates-based label (Never substitute Anand Vihar)
  const fallbackResult: ReverseGeocodedResult = {
    locality: `Location (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`,
    city: 'India',
    state: 'India',
    displayName: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
  };
  reverseCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}
