import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from './config';

export function distanceKm(a, b) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return '—';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Devuelve { coords, granted }. Nunca lanza: si falla, usa la ubicación por defecto.
export async function getUserLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { coords: DEFAULT_LOCATION, granted: false };
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }, granted: true };
  } catch {
    return { coords: DEFAULT_LOCATION, granted: false };
  }
}
