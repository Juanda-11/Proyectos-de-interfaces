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

const TIMEOUT_MS = 20000;

// fetch con tiempo límite; los fallos de red se traducen a ApiError('network').
async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e) {
    throw new ApiError(e.name === 'AbortError' ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
  }
}
