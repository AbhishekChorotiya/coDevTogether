# CoDevTogether

CoDevTogether is a React 19 collaborative coding workspace. A room includes a shared CodeMirror editor, problem notes, presence, chat, themes, and remote code compilation. Socket.IO keeps one authoritative in-memory snapshot per active room so reconnecting and newly joined clients receive deterministic state.

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer
- A compatible compiler API for code execution

## Local development

```bash
npm install
cp .env.example .env
npm run server
```

In a second terminal:

```bash
npm run dev
```

The Vite app runs at `http://localhost:5173` and proxies Socket.IO to the server on port 5000. Set `VITE_COMPILER_API_URL` in `.env` to enable compilation.

## Quality checks

```bash
npm run lint
npm test
npm run build
npm audit
```

For a production-style run, build the frontend and start the server:

```bash
npm run build
npm start
```

The Express server serves `dist/`, exposes `GET /health`, and falls back to the React app for browser routes.

## Project structure

```text
server/
  index.js                 HTTP and Socket.IO entry point
  socketHandlers.js        validated room protocol handlers
  roomStore.js             authoritative active-room state
src/
  app/                     routing and application tests
  features/
    chat/                  chat UI
    editor/                editor and language definitions
    lobby/                 room join experience
    room/                  room page, panels, and socket session hook
  shared/
    components/            reusable accessible controls
    hooks/                 cross-feature hooks
    protocol/              client/server event contract
    services/              compiler and socket clients
    utils/                 room ID helpers
  styles/                  global theme and Tailwind styles
```

## Security and deployment notes

- Set `SOCKET_ALLOWED_ORIGINS` to the public application origin in production.
- Room IDs are collaboration links, not authentication. Add authenticated room membership before using the app for private code.
- Code execution belongs in a separately isolated service with CPU, memory, process, network, and execution-time limits. The browser client never executes submitted code itself.
- Active room state is intentionally in memory and is removed when the last participant leaves. Use a persistent store and a Socket.IO adapter before running multiple server instances.
