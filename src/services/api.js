import { API_BASE, BACKEND_CONFIGURED } from './config';
import { clearToken, getToken } from './session';

// Error de la API: code es el identificador del backend (p. ej. 'email_taken', 'wrong_code').
export class ApiError extends Error {
  constructor(code, { status = 0, details } = {}) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// El backend caduca/invalida sesiones: AuthContext se suscribe para cerrar la sesión local.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};
