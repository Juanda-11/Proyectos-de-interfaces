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
