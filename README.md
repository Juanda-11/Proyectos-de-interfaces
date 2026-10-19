# FoodLink 🌱 — Frontend

App para **reducir el desperdicio de alimentos** conectando a quienes tienen excedentes (donantes) con quienes los
necesitan (receptores). Proyecto final de *Diseño de Interfaces*.

React Native + Expo: **una sola base de código para web, iPhone y Android**.

> 🔗 El **backend** (API REST, base de datos e IA) está en otro repositorio:
> [Juanda-11/Proyectos-de-interfaces-MB](https://github.com/Juanda-11/Proyectos-de-interfaces-MB).
> Arquitectura: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Demo en línea: <https://foodlink-ashen.vercel.app>

## Funcionalidades
| Área | Qué hace |
| --- | --- |
| **Acceso** | Dos perfiles (**Recibir** / **Donar**), registro con correo y sesión que se restaura al abrir la app. |
| **Tema e idioma** | Claro / oscuro / sistema y español / English, con botón rápido en el inicio y opciones en Configuración. |
| **Análisis con IA** | Foto con la cámara o de la galería: la IA identifica el alimento, categoría, cantidad, estado, vida útil y alérgenos. |
| **Mapa real** | Leaflet con teselas sin API key y respaldo automático entre proveedores; tu ubicación y marcadores por estado. |
| **Seguimiento** | Cuatro etapas que se muestran una a una; la entrega se cierra con **código / QR** validado en el servidor. |
| **Datos compartidos** | Donante y receptor ven lo mismo desde dispositivos distintos (refresco cada 15 s y "tirar para actualizar"). |
| **Perfil** | Datos editables, estadísticas, configuración, seguridad (contraseña, borrar cuenta), ayuda y cierre de sesión. |
| **Impacto** | kg recuperados, entregas, aliados, CO₂ evitado, meta mensual y logros. |

## Cuentas de prueba
| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Receptor | `receptor@foodlink.app` | `demo1234` |
| Donante | `donante@foodlink.app` | `demo1234` |

El **código de entrega** de cada donación solo lo ve el donante. Para completar una entrega como receptor, abre la
donación con la cuenta de donante (muestra el código y un QR) y escríbelo en la cuenta de receptor.

## Ejecutar en local
Necesitas el backend corriendo (ver su README: `npm run dev` → `http://localhost:3000`).

```bash
cp .env.example .env          # EXPO_PUBLIC_API_URL=http://localhost:3000
npm install
npm run web                   # navegador
npm start                     # Expo Go en iPhone/Android
```

## Scripts
| Comando | Descripción |
| --- | --- |
| `npm run web` / `npm start` | Servidor de desarrollo (web / móvil) |
| `npm run build` | Genera la versión web estática en `dist/` |
| `npm run lint` | ESLint |
| `npm test` | Pruebas con Jest |
| `npm run format` | Prettier |

## Estructura
```
App.js                 Proveedores, sesión y navegación
src/services/          Cliente de la API, sesión, auth, donaciones, IA, errores
src/context/           Auth, Data (refresco periódico), Location
src/screens/           Una pantalla por archivo
src/components/        UI reutilizable (ui/), mapa, barra de etapas, ErrorBoundary
src/i18n · src/theme/  Textos es/en y paletas claro/oscuro
__tests__/             Jest: cliente API, auth, datos, i18n, utilidades...
```
