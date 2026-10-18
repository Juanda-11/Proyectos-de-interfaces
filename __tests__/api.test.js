jest.mock('../src/services/config', () => ({ API_BASE: 'https://api.test', BACKEND_CONFIGURED: true }));

import { ApiError, api, setUnauthorizedHandler } from '../src/services/api';
import { clearToken, getToken, setToken } from '../src/services/session';

const respond = (status, json, { raw } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: raw ? () => Promise.reject(new Error('no json')) : async () => json,
});

beforeEach(async () => {
  await clearToken();
  global.fetch = jest.fn();
});

test('GET añade el prefijo /api y devuelve el JSON', async () => {
  global.fetch.mockResolvedValue(respond(200, { ok: true }));
  expect(await api.get('/health')).toEqual({ ok: true });
  expect(global.fetch.mock.calls[0][0]).toBe('https://api.test/api/health');
});

test('envía el token Bearer cuando hay sesión y el cuerpo como JSON', async () => {
  await setToken('abc');
  global.fetch.mockResolvedValue(respond(201, { donation: { id: 1 } }));
  await api.post('/donations', { title: 'Pan' });
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe('Bearer abc');
  expect(options.method).toBe('POST');
  expect(JSON.parse(options.body)).toEqual({ title: 'Pan' });
});

test('auth: false no envía el token', async () => {
  await setToken('abc');
  global.fetch.mockResolvedValue(respond(200, {}));
  await api.post('/auth/login', {}, { auth: false });
  expect(global.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
});

test('traduce los errores del backend a ApiError', async () => {
  global.fetch.mockResolvedValue(respond(409, { error: 'email_taken', details: { field: 'email' } }));
  await expect(api.post('/auth/register', {})).rejects.toMatchObject({ code: 'email_taken', status: 409, details: { field: 'email' } });
});

test('un 401 con sesión borra el token y avisa', async () => {
  await setToken('viejo');
  const handler = jest.fn();
  setUnauthorizedHandler(handler);
  global.fetch.mockResolvedValue(respond(401, { error: 'invalid_token' }));
  await expect(api.get('/auth/me')).rejects.toBeInstanceOf(ApiError);
  expect(handler).toHaveBeenCalledTimes(1);
  expect(await getToken()).toBeNull();
});

test('un 401 sin sesión (login fallido) no dispara el aviso', async () => {
  const handler = jest.fn();
  setUnauthorizedHandler(handler);
  global.fetch.mockResolvedValue(respond(401, { error: 'invalid_credentials' }));
  await expect(api.post('/auth/login', {})).rejects.toMatchObject({ code: 'invalid_credentials' });
  expect(handler).not.toHaveBeenCalled();
});

test('fallo de red → network; respuesta sin JSON → bad_response', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(api.get('/x')).rejects.toMatchObject({ code: 'network' });
  global.fetch.mockResolvedValue(respond(200, null, { raw: true }));
  await expect(api.get('/x')).rejects.toMatchObject({ code: 'bad_response' });
});
