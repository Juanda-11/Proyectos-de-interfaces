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
