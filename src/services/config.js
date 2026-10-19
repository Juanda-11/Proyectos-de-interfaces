// URL del backend (repositorio Proyectos-de-interfaces-MB). Se define al compilar con EXPO_PUBLIC_API_URL.
export const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
export const BACKEND_CONFIGURED = !!API_BASE;

// Centro de referencia (Pasto, Nariño) cuando no hay permiso de ubicación.
export const DEFAULT_LOCATION = { lat: 1.2136, lng: -77.2811 };
