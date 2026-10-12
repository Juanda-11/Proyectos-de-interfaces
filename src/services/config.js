import { Platform } from 'react-native';

// En la web (Vercel) la API vive en el mismo dominio. En nativo hay que indicar
// la URL del despliegue con EXPO_PUBLIC_API_URL.
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || (Platform.OS === 'web' ? '' : '');

// Centro de referencia (Pasto, Nariño) cuando no hay permiso de ubicación.
export const DEFAULT_LOCATION = { lat: 1.2136, lng: -77.2811 };
