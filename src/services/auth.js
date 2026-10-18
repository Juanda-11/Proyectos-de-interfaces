import { api } from './api';
import { clearToken, getToken, setToken } from './session';

// Cuentas de demostración que crea el backend al iniciar (ver su README).
export const DEMO_ACCOUNTS = {
  receiver: { email: 'receptor@foodlink.app', password: 'demo1234' },
  donor: { email: 'donante@foodlink.app', password: 'demo1234' },
};

// Las funciones lanzan ApiError (ver services/api.js). Los códigos más comunes:
// email_taken, invalid_credentials, role_mismatch (details.role), wrong_current_password.
