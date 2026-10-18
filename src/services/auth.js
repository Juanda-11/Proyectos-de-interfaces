import { api } from './api';
import { clearToken, getToken, setToken } from './session';

// Cuentas de demostración que crea el backend al iniciar (ver su README).
export const DEMO_ACCOUNTS = {
  receiver: { email: 'receptor@foodlink.app', password: 'demo1234' },
  donor: { email: 'donante@foodlink.app', password: 'demo1234' },
};

// Las funciones lanzan ApiError (ver services/api.js). Los códigos más comunes:
// email_taken, invalid_credentials, role_mismatch (details.role), wrong_current_password.

// Devuelve el usuario de la sesión guardada o null si no hay sesión válida.
// Los errores de red se propagan para que la app muestre "sin conexión" en vez de cerrar la sesión.
export async function restoreSession() {
  if (!(await getToken())) return null;
  try {
    return (await api.get('/auth/me')).user;
  } catch (e) {
    if (e.status === 401) return null;
    throw e;
  }
}

export async function register({ name, email, password, role }) {
  const { token, user } = await api.post('/auth/register', { name, email, password, role }, { auth: false });
  await setToken(token);
  return user;
}

export async function login({ email, password, role }) {
  const { token, user } = await api.post('/auth/login', { email, password, role }, { auth: false });
  await setToken(token);
  return user;
}

export async function logout() {
  await clearToken();
}

export async function updateProfile(patch) {
  return (await api.patch('/auth/me', patch)).user;
}

export async function changePassword(current, next) {
  await api.post('/auth/password', { current, next });
}

export async function deleteAccount() {
  await api.delete('/auth/me');
  await clearToken();
}
