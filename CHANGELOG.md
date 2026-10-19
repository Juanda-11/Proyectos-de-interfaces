# Changelog

## 4.0.0 — Frontend y backend separados
- La app ya no guarda cuentas ni donaciones en el dispositivo: usa la API del repositorio **Proyectos-de-interfaces-MB**.
- Inicio de sesión con token, sesión restaurada al abrir la app y cierre automático si expira.
- Donaciones, reservas y notificaciones compartidas entre dispositivos (refresco cada 15 s y "tirar para actualizar").
- El código de entrega solo lo ve el donante y se valida en el servidor.
- Análisis de alimentos con IA a través del backend (Gemini gratis o Claude).
- Pantalla sin conexión con reintento, mensajes de error traducidos y `ErrorBoundary`.
- Componentes de UI separados en `components/ui/*`, pruebas con Jest y CI en GitHub Actions.

## 3.0.0
- Inicio de sesión por rol, tema claro/oscuro, español/inglés, mapa real, seguimiento por etapas y análisis con IA.

## 2.1.0
- Prototipo académico funcional con datos simulados.
