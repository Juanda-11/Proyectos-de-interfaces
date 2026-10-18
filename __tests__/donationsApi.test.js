jest.mock('../src/services/config', () => ({ API_BASE: 'https://api.test', BACKEND_CONFIGURED: true }));

import * as backend from '../src/services/donationsApi';
import { clearToken, setToken } from '../src/services/session';

const ok = (json) => ({ ok: true, status: 200, json: async () => json });
const lastCall = () => {
  const [url, options] = global.fetch.mock.calls.at(-1);
  return { url: url.replace('https://api.test/api', ''), method: options.method, body: options.body ? JSON.parse(options.body) : undefined };
};

beforeEach(async () => {
  await clearToken();
  await setToken('t');
  global.fetch = jest.fn().mockResolvedValue(ok({ donation: { id: 'd1' }, donations: [], notifications: [] }));
});

test('listar y crear', async () => {
  expect(await backend.listDonations()).toEqual([]);
  expect(lastCall()).toMatchObject({ url: '/donations', method: 'GET' });
  expect(await backend.createDonation({ title: 'Pan' })).toEqual({ id: 'd1' });
  expect(lastCall()).toMatchObject({ url: '/donations', method: 'POST', body: { title: 'Pan' } });
});

test('transiciones usan la ruta correcta', async () => {
  await backend.reserveDonation('d1');
  expect(lastCall()).toMatchObject({ url: '/donations/d1/reserve', method: 'POST' });
  await backend.startPickup('d1');
  expect(lastCall().url).toBe('/donations/d1/pickup');
  await backend.cancelDonation('d1');
  expect(lastCall().url).toBe('/donations/d1/cancel');
});

test('entregar envía el código solo si existe', async () => {
  await backend.deliverDonation('d1', 'FL-2026-084');
  expect(lastCall()).toMatchObject({ url: '/donations/d1/deliver', body: { code: 'FL-2026-084' } });
  await backend.deliverDonation('d1');
  expect(lastCall().body).toBeUndefined();
});

test('notificaciones y demo', async () => {
  expect(await backend.listNotifications()).toEqual([]);
  await backend.markNotificationsRead();
  expect(lastCall()).toMatchObject({ url: '/notifications/read-all', method: 'POST' });
  await backend.resetDemoData();
  expect(lastCall().url).toBe('/demo/reset');
});
