# Notification System — Frontend

Cliente web (React 18 + Vite) para el sistema de notificaciones multicanal. Se conecta por HTTP a cualquiera de los dos backends intercambiables (Clojure o Spring Boot) y permite enviar mensajes y consultar el historial.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Uno de los dos backends corriendo localmente (ver [Conectar a los backends](#conectar-a-los-backends))

## Instalación

```bash
npm install
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo de Vite en `http://localhost:5173`. |
| `npm run build` | Genera la build de producción en `dist/`. |
| `npm run preview` | Sirve la build de producción para verificación local. |
| `npm test` | Corre la suite de Vitest una vez (modo CI). |
| `npm run test:watch` | Vitest en modo watch. |

Para ejecutar un solo archivo de test:

```bash
npx vitest run tests/components/MessageForm.test.jsx
```

Para filtrar por nombre de test:

```bash
npx vitest run -t "muestra mensaje de éxito"
```

## Conectar a los backends

El frontend no se construye apuntando a un backend fijo: la selección se hace en tiempo de ejecución desde el selector "Backend" en la cabecera de la UI. Las URLs están declaradas en `src/services/api.js`:

| Backend | URL | Puerto |
|---|---|---|
| Clojure | `http://localhost:3010` | 3010 |
| Spring Boot | `http://localhost:8088` | 8088 |

### Levantar los backends

**Clojure** (desde `../backend-clojure`):

```bash
lein run
```

**Spring Boot** (desde `../backend-java`):

```bash
./mvnw spring-boot:run
```

### Cambiar de backend en caliente

En la cabecera de la app hay un toggle con dos botones: "Clojure" y "Spring Boot". Al pulsar uno:

1. Se actualiza el backend activo en `src/services/api.js`.
2. `NotificationLog` recarga el historial contra el backend recién elegido.
3. Los mensajes nuevos se envían al backend actualmente seleccionado.

### Diferencias de formato entre backends

Los dos backends exponen el mismo contrato (`POST /api/messages`, `GET /api/logs`) pero con convenciones de nombres distintas:

- **Clojure** devuelve claves en kebab-case: `user-name`, `sent-at`, `users-reached`.
- **Spring Boot** devuelve claves en camelCase: `userName`, `sentAt`, `usersReached`.

El frontend normaliza ambas formas en `src/services/logMapper.js` y en los consumidores de las respuestas. Si se agrega un campo nuevo al contrato, hay que contemplar ambas convenciones (más snake_case como fallback defensivo).

## Estructura

```
src/
├── App.jsx                        Composición raíz
├── main.jsx                       Punto de entrada
├── components/
│   ├── BackendSelector/           Toggle Clojure / Spring Boot
│   ├── MessageForm/               Formulario de envío
│   ├── NotificationLog/           Tabla del historial
│   └── StatusBadge/               Badge Enviado / Fallido
├── hooks/
│   ├── useMessages.js             Estado del envío
│   └── useLogs.js                 Carga del historial
├── services/
│   ├── api.js                     Cliente HTTP y selección de backend
│   └── logMapper.js               Normaliza kebab / snake / camel
└── styles/
    └── global.css                 Variables CSS globales
```

## Tests

Stack: Vitest + jsdom + React Testing Library. La suite cubre:

- `services/api.js`: validaciones, ruteo por backend, manejo de errores HTTP.
- `services/logMapper.js`: normalización de los tres formatos de claves.
- `hooks/useMessages.js` y `hooks/useLogs.js`: estados de carga, error, resultado y auto-refresh.
- `components/MessageForm`, `components/NotificationLog`, `components/BackendSelector`: render, interacción y rutas de datos.

## Solución de problemas

- **"Failed to fetch" en la UI**: el backend seleccionado no está corriendo. Verifica el puerto correspondiente (3010 o 8088) y que no haya un CORS bloqueando las requests.
- **El historial se ve vacío al cambiar de backend**: cada backend tiene su propio almacenamiento de logs, no comparten estado.
- **Puerto 5173 en uso**: edita `vite.config.js` o exporta `PORT=xxxx` antes de `npm run dev`.
- **Los nombres de usuario o fechas aparecen vacíos**: probablemente el backend introdujo un nuevo formato de clave. Revisa `src/services/logMapper.js` y añade la variante.