# FoodLink 🌱

Aplicación para **reducir el desperdicio de alimentos** conectando a quienes tienen excedentes (donantes) con quienes los necesitan (receptores). Proyecto final de *Diseño de Interfaces*.

Una sola base de código (React Native + Expo) que corre en **iPhone, Android y web**, y se despliega en **Vercel**.

## Funcionalidades

| Área | Qué hace |
| --- | --- |
| **Acceso** | Inicio de sesión con dos perfiles (**Recibir** / **Donar**) y registro con correo. Cuentas demo incluidas. |
| **Tema** | Claro / oscuro / sistema. Botón rápido en la pantalla de inicio y opción en Configuración. |
| **Idioma** | Español / English, en el login y en Perfil → Configuración. Se recuerda entre sesiones. |
| **Análisis con IA** | Toma una foto o súbela de la galería: la IA (Gemini o Claude, visión) identifica el alimento, categoría, cantidad, estado, vida útil, alérgenos y consejos de conservación. El usuario revisa y publica. |
| **Mapa real** | OpenStreetMap + Leaflet (sin API keys), con tu ubicación, marcadores por estado y detalle al tocar. |
| **Seguimiento** | Cuatro etapas (publicada → reservada → en camino → entregada) que se muestran **una a una**, con barra animada, etapas futuras bloqueadas y cierre de entrega con **código/QR**. |
| **Perfil** | Datos personales editables, estadísticas, configuración, seguridad (cambiar contraseña, eliminar cuenta), ayuda con FAQ y cierre de sesión. |
| **Impacto** | kg recuperados, entregas, aliados, CO₂ evitado, meta mensual y logros — calculados a partir de las entregas reales. |

### Cuentas de prueba

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Receptor | `receptor@foodlink.app` | `demo1234` |
| Donante | `donante@foodlink.app` | `demo1234` |

(En el login también hay botones "Demo receptor / Demo donante".)

## ¿Un repo o dos? — Decisión de arquitectura

**Un solo repositorio (monorepo).** El "backend" de FoodLink es una única función serverless (`api/analyze.js`) que protege la clave de la IA; separarla en otro repo solo añadiría fricción (dos despliegues, CORS, versiones). Vercel sirve ambas cosas desde el mismo proyecto:

```
├── App.js                  # Punto de entrada: proveedores + navegación
├── src/
│   ├── theme/              # Paletas claro/oscuro y ThemeContext
│   ├── i18n/               # Diccionarios es/en y I18nContext
│   ├── context/            # Auth, datos (donaciones/notificaciones), ubicación
│   ├── navigation/         # Router por pila
│   ├── services/           # auth, donaciones, IA (cliente), geo, storage
│   ├── components/         # UI reutilizable, mapa, barra de etapas...
│   └── screens/            # Una pantalla por archivo
├── api/analyze.js          # Backend serverless (Vercel Function) → Claude
└── vercel.json             # Build de Expo web + rutas
```

> Si más adelante se quiere un backend con base de datos compartida entre dispositivos (Supabase, Firebase…), solo hay que reemplazar `src/services/auth.js` y la persistencia de `DataContext`; las pantallas no cambian. Ahí sí podría tener sentido separarlo.

## Ejecutar en local

```bash
npm install
npm run web          # navegador
npm start            # Expo Go (escanea el QR con el iPhone/Android)
```

Para probar también el análisis con IA en local necesitas la función `/api/analyze`:

```bash
cp .env.example .env.local     # y pon tu ANTHROPIC_API_KEY
npx vercel dev                 # sirve la web + /api juntas
```

Sin clave de IA la app funciona igual: al escanear, avisa que la IA no está configurada y ofrece el registro manual.

## Desplegar en Vercel

1. Entra a [vercel.com/new](https://vercel.com/new) e **importa este repositorio de GitHub**.
2. Vercel lee `vercel.json` automáticamente (build: `npx expo export --platform web`, salida: `dist`). No cambies nada.
3. En **Settings → Environment Variables** agrega:
   - **Recomendado (gratis):** `GEMINI_API_KEY` → clave de [Google AI Studio](https://aistudio.google.com/apikey) (plan gratuito con visión).
   - *Alternativa de pago:* `ANTHROPIC_API_KEY` → clave de [console.anthropic.com](https://console.anthropic.com).
   - Si están las dos se usa Gemini; se puede forzar con `AI_PROVIDER=gemini` o `anthropic`. Opcionales: `GEMINI_MODEL`, `ANTHROPIC_MODEL`.
   - Las claves solo viven en el servidor (nunca en el navegador ni en el repositorio). Tras agregarlas, haz **Redeploy**.
   - Comprueba abriendo `https://TU-APP.vercel.app/api/analyze`: debe mostrar `"configured": true` y el proveedor.
4. **Deploy**. Cada `git push` a la rama principal redepliega; las ramas y PR generan *preview deployments*.

### App en el celular apuntando al despliegue

Para que Expo Go / un build nativo use la IA desplegada, define la URL pública:

```bash
EXPO_PUBLIC_API_URL=https://tu-proyecto.vercel.app npm start
```

## Notas técnicas

- **Cuentas y datos**: se guardan en el dispositivo (AsyncStorage / localStorage) con contraseñas cifradas (SHA-256 + sal). Es adecuado para la demostración académica; para producción real se debe usar un backend de autenticación.
- **Privacidad de las fotos**: la imagen se reduce en el dispositivo, se envía a `/api/analyze` y no se almacena; solo se guarda una miniatura en la donación.
- **Mapa**: teselas de CARTO con datos de OpenStreetMap (claro y oscuro); el servidor público de OSM bloquea peticiones sin Referer y muestra "API key required". Requiere conexión a internet.
- **Accesibilidad**: roles y etiquetas ARIA en botones, pestañas y campos; contraste revisado en ambos temas.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run web` | Servidor de desarrollo web |
| `npm start` | Expo (móvil) |
| `npm run build` | Genera `dist/` (lo mismo que ejecuta Vercel) |
