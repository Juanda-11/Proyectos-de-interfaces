jest.mock('../src/services/config', () => ({ API_BASE: 'https://api.test', BACKEND_CONFIGURED: true }));

import { changePassword, deleteAccount, login, logout, register, restoreSession, updateProfile } from '../src/services/auth';
import { clearToken, getToken, setToken } from '../src/services/session';

const ok = (json, status = 200) => ({ ok: true, status, json: async () => json });
const fail = (status, json) => ({ ok: false, status, json: async () => json });
const lastCall = () => {
  const [url, options] = global.fetch.mock.calls.at(-1);
  return { url, ...options, body: options.body ? JSON.parse(options.body) : undefined };
};

beforeEach(async () => {
  await clearToken();
  global.fetch = jest.fn();
});

test('login guarda el token y devuelve el usuario', async () => {
  global.fetch.mockResolvedValue(ok({ token: 't1', user: { id: 'u1', role: 'donor' } }));
  const user = await login({ email: 'a@b.co', password: 'secreto', role: 'donor' });
  expect(user.id).toBe('u1');
  expect(await getToken()).toBe('t1');
  expect(lastCall().url).toBe('https://api.test/api/auth/login');
  expect(lastCall().headers.Authorization).toBeUndefined();
});

test('login fallido no guarda token y propaga el código', async () => {
  global.fetch.mockResolvedValue(fail(403, { error: 'role_mismatch', details: { role: 'donor' } }));
  await expect(login({ email: 'a@b.co', password: 'x' })).rejects.toMatchObject({ code: 'role_mismatch', details: { role: 'donor' } });
  expect(await getToken()).toBeNull();
});

test('register guarda el token', async () => {
  global.fetch.mockResolvedValue(ok({ token: 't2', user: { id: 'u2' } }, 201));
  await register({ name: 'Ana', email: 'a@b.co', password: 'secreto', role: 'receiver' });
  expect(await getToken()).toBe('t2');
});

test('restoreSession: sin token → null; con token válido → usuario; 401 → null; red → error', async () => {
  expect(await restoreSession()).toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
  await setToken('t');
  global.fetch.mockResolvedValueOnce(ok({ user: { id: 'u1' } }));
  expect((await restoreSession()).id).toBe('u1');
  global.fetch.mockResolvedValueOnce(fail(401, { error: 'invalid_token' }));
  expect(await restoreSession()).toBeNull();
  await setToken('t');
  global.fetch.mockRejectedValueOnce(new TypeError('offline'));
  await expect(restoreSession()).rejects.toMatchObject({ code: 'network' });
  expect(await getToken()).toBe('t');
});

test('logout, perfil, contraseña y borrado de cuenta', async () => {
  await setToken('t');
  global.fetch.mockResolvedValue(ok({ user: { name: 'Nuevo' } }));
  expect((await updateProfile({ name: 'Nuevo' })).name).toBe('Nuevo');
  expect(lastCall().method).toBe('PATCH');
  global.fetch.mockResolvedValue(ok({ ok: true }));
  await changePassword('vieja', 'nueva');
  expect(lastCall().body).toEqual({ current: 'vieja', next: 'nueva' });
  await deleteAccount();
  expect(lastCall().method).toBe('DELETE');
  expect(await getToken()).toBeNull();
  await setToken('t');
  await logout();
  expect(await getToken()).toBeNull();
});
