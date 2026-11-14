import { DELHI_NCR_STATIONS, StationMetadata, POPULAR_UNMONITORED_LOCALITIES, UnmonitoredLocality } from '../fixtures/delhi-stations';

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Matches coordinates to the nearest verified Delhi NCR station within 3 km.
 */
export function matchStationByCoordinates(lat: number, lng: number): StationMetadata | null {
  let closest: StationMetadata | null = null;
  let minDistance = 3.0; // 3km threshold

  for (const station of DELHI_NCR_STATIONS) {
    const dist = calculateDistanceKm(lat, lng, station.latitude, station.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = station;
    }
  }

  return closest;
}

/** Like matchStationByCoordinates but with a caller-chosen radius (default 1.2 km). */
export function matchStationWithin(lat: number, lng: number, maxKm = 1.2): StationMetadata | null {
  let closest: StationMetadata | null = null;
  let min = maxKm;
  for (const station of DELHI_NCR_STATIONS) {
    const d = calculateDistanceKm(lat, lng, station.latitude, station.longitude);
    if (d <= min) {
      min = d;
      closest = station;
    }
  }
  return closest;
}

/**
 * Finds the nearest monitoring station to a user's location.
 */
export function findNearestStation<T extends { latitude: number; longitude: number }>(
  userLat: number,
  userLng: number,
  stations: T[]
): { station: T; distanceKm: number } | null {
  if (!stations.length) return null;

  let nearest: T = stations[0];
  let minDistance = calculateDistanceKm(userLat, userLng, nearest.latitude, nearest.longitude);

  for (let i = 1; i < stations.length; i++) {
    const dist = calculateDistanceKm(userLat, userLng, stations[i].latitude, stations[i].longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = stations[i];
    }
  }

  return { station: nearest, distanceKm: Math.round(minDistance * 10) / 10 };
}

/**
 * Searches for a locality or returns closest monitored stations for unmonitored localities like Saket.
 */
export function resolveLocalityOrStation<T extends { id: string; name: string; city: string; latitude: number; longitude: number }>(
  query: string,
  stations: T[]
): {
  matchedStations: T[];
  unmonitoredMatch?: {
    locality: UnmonitoredLocality;
    nearestStations: Array<{ station: T; distanceKm: number }>;
  };
} {
  const q = query.trim().toLowerCase();
  if (!q) return { matchedStations: stations };

  // 1. Direct station matching
  const directMatches = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
  );

  // 2. Check unmonitored localities directory (e.g. Saket, Karol Bagh, etc.)
  const locality = POPULAR_UNMONITORED_LOCALITIES.find(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      q.includes(l.name.toLowerCase()) ||
      (l.pincode && q.includes(l.pincode))
  );

  if (locality) {
    // Sort stations by distance to this locality
    const nearby = stations
      .map((s) => ({
        station: s,
        distanceKm: Math.round(calculateDistanceKm(locality.latitude, locality.longitude, s.latitude, s.longitude) * 10) / 10,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);

    return {
      matchedStations: directMatches.length > 0 ? directMatches : nearby.map((n) => n.station),
      unmonitoredMatch: {
        locality,
        nearestStations: nearby,
      },
    };
  }

  return { matchedStations: directMatches };
}
