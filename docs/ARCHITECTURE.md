# Arquitectura del frontend

FoodLink está dividido en dos repositorios:

| Repositorio | Contenido | Despliegue |
| --- | --- | --- |
| **Proyectos-de-interfaces** (este) | App React Native / Expo (web, iOS y Android) | Vercel (exporta la web estática) |
| **Proyectos-de-interfaces-MB** | API REST serverless + base de datos Redis | Vercel Functions + Upstash |

```
   Navegador / Expo Go ──HTTPS + Bearer token──▶  Backend (/api/*)  ──▶ Upstash Redis
          (este repo)                                (repo MB)          └▶ Gemini / Claude (IA)
```

## Capas del frontend

```
App.js                     Proveedores, sesión y navegación
src/services/              Todo lo que habla con el exterior
  config.js                  URL del backend (EXPO_PUBLIC_API_URL)
  session.js                 Token de sesión en el dispositivo
  api.js                     Cliente JSON: token, errores tipados, sesión expirada
  auth.js · donationsApi.js · ai.js    Funciones de cada recurso del backend
  errors.js                  Código de error → texto para el usuario
src/context/               Estado compartido: Auth, Data (con refresco cada 15 s), Location
src/screens/               Una pantalla por archivo
src/components/            UI reutilizable (components/ui), mapa, barra de etapas
src/i18n · src/theme/      Textos es/en y paletas claro/oscuro
__tests__/                 Pruebas con Jest
```

## Decisiones
- **Un solo cliente HTTP** (`api.js`): añade el token, interpreta `{ error, details }` y, si el backend responde 401,
  cierra la sesión local. Las pantallas solo capturan `ApiError` y muestran `errorKey(e)`.
- **Datos en el backend, no en el dispositivo**: donante y receptor ven los mismos datos desde dispositivos distintos.
  `DataContext` refresca cada 15 s (y al volver a la app) y aplica de inmediato la respuesta de cada acción.
- **El código de entrega** solo lo conoce el donante; la validación ocurre en el servidor.
- **La IA** se llama a través del backend (`/api/analyze`), de modo que las claves nunca llegan al cliente.
- **Mapa** con Leaflet + teselas sin API key (Esri → CARTO → OSM con respaldo automático).
- **Sin conexión**: si no se puede contactar al backend se muestra `OfflineScreen` con reintento.
