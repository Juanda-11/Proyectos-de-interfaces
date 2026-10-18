import { Platform } from 'react-native';

// URL del backend (repositorio Juanda-11/Proyectos-de-interfaces-MB desplegado en Vercel).
// Se define al compilar con EXPO_PUBLIC_API_URL. En la web, si falta, se usa el mismo dominio.
export const API_BASE = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
export const BACKEND_CONFIGURED = !!API_BASE || Platform.OS === 'web';

// Centro de referencia (Pasto, Nariño) cuando no hay permiso de ubicación.
export const DEFAULT_LOCATION = { lat: 1.2136, lng: -77.2811 };
