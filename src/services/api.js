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
    throw new ApiError(e.name === 'AbortError' ? 'timeout' : 'network', { details: { url } });
  } finally {
    clearTimeout(timer);
  }
}

// Petición JSON al backend. Añade el token, interpreta { error, details } y avisa si la sesión expira.
export async function request(method, path, { body, auth = true } = {}) {
  if (!BACKEND_CONFIGURED) throw new ApiError('backend_not_configured');
  const headers = { 'Content-Type': 'application/json' };
  const token = auth ? await getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetchWithTimeout(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Respuesta que no es JSON (p. ej. la web sirviendo index.html porque falta el backend).
    throw new ApiError('bad_response', { status: res.status, details: { url: `${API_BASE}/api${path}`, contentType: res.headers && res.headers.get ? res.headers.get('content-type') : undefined } });
  }
  if (!res.ok) {
    if (res.status === 401 && token) {
      await clearToken();
      if (onUnauthorized) onUnauthorized();
    }
    throw new ApiError(data.error || 'server_error', { status: res.status, details: data.details });
  }
  return data;
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
};
