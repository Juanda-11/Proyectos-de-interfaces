// URL del backend (repositorio Juanda-11/Proyectos-de-interfaces-MB desplegado en Vercel).
// Se define al compilar con EXPO_PUBLIC_API_URL (en Vercel: Settings > Environment Variables + Redeploy).
// Ya no hay API en el mismo dominio, así que sin esta variable la app avisa que falta configurarla.
export const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
export const BACKEND_CONFIGURED = !!API_BASE;

// Centro de referencia (Pasto, Nariño) cuando no hay permiso de ubicación.
export const DEFAULT_LOCATION = { lat: 1.2136, lng: -77.2811 };
