import { DELHI_NCR_STATIONS, StationMetadata } from '../fixtures/delhi-stations';

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
