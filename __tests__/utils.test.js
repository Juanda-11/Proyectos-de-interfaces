import { formatDate, formatDateTime, greetingKey, timeAgo } from '../src/utils';

const t = (key, vars) => (vars ? `${key}:${JSON.stringify(vars)}` : key);

describe('timeAgo', () => {
  const ago = (ms) => new Date(Date.now() - ms).toISOString();

  test('menos de un minuto → justNow', () => {
    expect(timeAgo(ago(10 * 1000), t)).toBe('notif.justNow');
  });
  test('minutos, horas y días', () => {
    expect(timeAgo(ago(8 * 60000), t)).toBe('notif.minAgo:{"n":8}');
    expect(timeAgo(ago(3 * 3600000), t)).toBe('notif.hAgo:{"n":3}');
    expect(timeAgo(ago(2 * 86400000), t)).toBe('notif.dAgo:{"n":2}');
  });
  test('fechas futuras no dan negativos', () => {
    expect(timeAgo(new Date(Date.now() + 60000).toISOString(), t)).toBe('notif.justNow');
  });
});

describe('formatDateTime y formatDate', () => {
  const iso = '2026-10-12T18:23:00.000Z';

  test('devuelve texto en español e inglés', () => {
    expect(formatDateTime(iso, 'es')).toMatch(/oct/i);
    expect(formatDateTime(iso, 'en')).toMatch(/Oct/);
    expect(formatDate(iso, 'en')).toMatch(/October 2026/);
    expect(formatDate(iso, 'es')).toMatch(/octubre de 2026/);
  });
  test('valores vacíos', () => {
    expect(formatDateTime('', 'es')).toBe('');
    expect(formatDateTime(null, 'es')).toBe('');
  });
});
