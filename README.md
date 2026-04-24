# Notification System — Frontend

Web client (React 18 + Vite) for the multichannel notification system. It talks over HTTP to either of the two interchangeable backends (Clojure or Spring Boot) and lets you send messages and inspect the history.

## Requirements

- Node.js 18 or higher
- npm 9 or higher
- One of the two backends running locally (see [Connecting to the backends](#connecting-to-the-backends))

## Install

```bash
npm install
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server at `http://localhost:5173`. |
| `npm run build` | Produces a production build in `dist/`. |
| `npm run preview` | Serves the production build locally for verification. |
| `npm test` | Runs the Vitest suite once (CI-style). |
| `npm run test:watch` | Vitest in watch mode. |

To run a single test file:

```bash
npx vitest run tests/components/MessageForm.test.jsx
```

To filter by test name:

```bash
npx vitest run -t "shows success message"
```

## Connecting to the backends

The frontend is not built against a fixed backend: the selection happens at runtime from the "Backend" selector in the UI header. The URLs are declared in `src/services/api.js`:

| Backend | URL | Port |
|---|---|---|
| Clojure | `http://localhost:3010` | 3010 |
| Spring Boot | `http://localhost:8088` | 8088 |

### Starting the backends

**Clojure** (from `../backend-clojure`):

```bash
lein run
```

**Spring Boot** (from `../backend-java`):

```bash
./mvnw spring-boot:run
```

### Switching backends at runtime

The app header has a toggle with two buttons: "Clojure" and "Spring Boot". Clicking one:

1. Updates the active backend inside `src/services/api.js`.
2. Makes `NotificationLog` reload the history against the newly selected backend.
3. Routes new messages to the currently selected backend.

### Response-format differences between backends

Both backends expose the same contract (`POST /api/messages`, `GET /api/logs`) but with different naming conventions:

- **Clojure** returns kebab-case keys: `user-name`, `sent-at`, `users-reached`.
- **Spring Boot** returns camelCase keys: `userName`, `sentAt`, `usersReached`.

The frontend normalizes both shapes in `src/services/logMapper.js` and in the consumers of those responses. When adding a new field to the contract, contemplate both conventions (plus snake_case as a defensive fallback).

## Layout

```
src/
├── App.jsx                        Root composition
├── main.jsx                       Entry point
├── components/
│   ├── BackendSelector/           Clojure / Spring Boot toggle
│   ├── MessageForm/               Message-send form
│   ├── NotificationLog/           History table
│   └── StatusBadge/               Sent / Failed badge
├── hooks/
│   ├── useMessages.js             Send-state orchestration
│   └── useLogs.js                 History loading
├── services/
│   ├── api.js                     HTTP client and backend selection
│   └── logMapper.js               Normalizes kebab / snake / camel keys
└── styles/
    └── global.css                 Global CSS variables
```

## Tests

Stack: Vitest + jsdom + React Testing Library. The suite covers:

- `services/api.js`: validation, backend routing, HTTP error handling.
- `services/logMapper.js`: normalization of the three key formats.
- `hooks/useMessages.js` and `hooks/useLogs.js`: loading, error, result and auto-refresh states.
- `components/MessageForm`, `components/NotificationLog`, `components/BackendSelector`: render, interaction, data paths.

## Troubleshooting

- **"Failed to fetch" in the UI**: the selected backend is not running. Verify its port (3010 or 8088) and that no CORS is blocking the requests.
- **History looks empty after switching backend**: each backend has its own log storage; they do not share state.
- **Port 5173 already in use**: edit `vite.config.js` or export `PORT=xxxx` before `npm run dev`.
- **User names or dates render empty**: the backend likely introduced a new key format. Check `src/services/logMapper.js` and add the new variant.