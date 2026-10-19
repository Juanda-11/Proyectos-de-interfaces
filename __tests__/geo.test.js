import { distanceKm, formatDistance } from '../src/services/geo';

const pasto = { lat: 1.2136, lng: -77.2811 };

describe('distanceKm', () => {
  test('mismo punto → 0', () => {
    expect(distanceKm(pasto, pasto)).toBe(0);
  });
  test('Pasto ↔ Ipiales ≈ 80 km', () => {
    const ipiales = { lat: 0.8303, lng: -77.6444 };
    expect(distanceKm(pasto, ipiales)).toBeGreaterThan(55);
    expect(distanceKm(pasto, ipiales)).toBeLessThan(70);
  });
  test('es simétrica', () => {
    const a = { lat: 4.711, lng: -74.0721 };
    expect(distanceKm(a, pasto)).toBeCloseTo(distanceKm(pasto, a), 6);
  });
});

describe('formatDistance', () => {
  test('metros por debajo de 1 km y kilómetros por encima', () => {
    expect(formatDistance(0.556)).toBe('556 m');
    expect(formatDistance(1.44)).toBe('1.4 km');
  });
  test('valores inválidos', () => {
    expect(formatDistance(null)).toBe('—');
    expect(formatDistance(NaN)).toBe('—');
  });
});
