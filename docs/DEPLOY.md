# Despliegue del frontend en Vercel

> Primero despliega el **backend** (repositorio Proyectos-de-interfaces-MB) siguiendo su `docs/DEPLOY.md`
> y copia su URL, por ejemplo `https://foodlink-backend.vercel.app`.

1. En [vercel.com/new](https://vercel.com/new) importa **este** repositorio. `vercel.json` ya define el build
   (`npx expo export --platform web`, salida `dist`) y la reescritura a `index.html`.
2. En **Settings → Environment Variables** agrega:

   | Variable | Valor |
   | --- | --- |
   | `EXPO_PUBLIC_API_URL` | URL del backend, sin barra final |

3. **Deploy**. La variable se incorpora al compilar, así que si la cambias hay que volver a desplegar.
4. (Recomendado) En el backend define `ALLOWED_ORIGINS` con la URL del frontend.

## Probar en el celular con Expo Go
```bash
cp .env.example .env     # EXPO_PUBLIC_API_URL=https://tu-backend.vercel.app
npm install
npm start
```

## Solución de problemas
| Síntoma | Causa probable |
| --- | --- |
| "El servidor de FoodLink no está disponible o no está configurado" | Falta `EXPO_PUBLIC_API_URL` o no se volvió a desplegar |
| "No se pudo conectar con el servidor" | El backend no responde o bloquea el origen (CORS) |
| Se puede iniciar sesión pero los datos desaparecen | El backend no tiene Upstash Redis conectado (`/api/health` → `storage: memory`) |
| El análisis con IA falla | Revisa `ai.configured` en `/api/health` del backend |
