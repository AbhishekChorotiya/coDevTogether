# CoDevTogether Low-Level Design

[Back to README](../README.md) · [High-Level Design](HLD.md)

## 1. Scope

This document specifies the current module boundaries, runtime state, HTTP endpoints, Socket.IO events, validation rules, UI behavior, and test coverage. See [HLD.md](HLD.md) for system context and deployment decisions.

## 2. Source layout and responsibilities

### Server modules

| Module | Responsibility |
| --- | --- |
| `server/index.js` | Creates HTTP and Socket.IO servers, configures origins, registers routes, serves `dist/`, handles shutdown |
| `server/socketHandlers.js` | Validates collaboration events, enforces membership and rate limits, updates the store, broadcasts results |
| `server/roomStore.js` | Maintains active rooms, document snapshots, participant records, and focus state |
| `server/compilerProxy.js` | Validates compilation, limits requests, maps language to filename, calls OneCompiler, sanitizes failures |

### Client modules

| Module | Responsibility |
| --- | --- |
| `src/app/App.jsx` | Browser routing and lazy loading of the room page |
| `src/features/lobby/LobbyPage.jsx` | Name/room input, room ID generation, theme selection, navigation |
| `src/features/room/RoomPage.jsx` | Workspace composition, compilation state, responsive tabs, resizable desktop panels |
| `src/features/room/hooks/useRoomSession.js` | Socket lifecycle and collaborative React state |
| `src/features/room/hooks/usePanelWidths.js` | Desktop panel width persistence, pointer resizing, keyboard resizing, viewport clamping |
| `src/features/editor/CodeEditor.jsx` | CodeMirror language extensions and full-height editor surface |
| `src/features/editor/languages.js` | Supported language metadata, filenames, starter source, validation |
| `src/features/chat/ChatPanel.jsx` | Message rendering, auto-scroll, input, and optimistic local messages |
| `src/shared/components/Select.jsx` | Accessible custom dropdown used for language and theme selection |
| `src/shared/services/socketClient.js` | Socket.IO client configuration |
| `src/shared/services/compilerApi.js` | Browser compilation request, timeout composition, and response normalization |
| `src/shared/protocol/events.js` | Shared event-name contract |

## 3. Runtime state models

The following pseudotypes document plain JavaScript objects used at runtime.

```ts
type Language = "javascript" | "python" | "java" | "cpp";

type RoomDocument = {
  code: string;
  language: Language;
  question: string;
};

type Participant = {
  socketId: string;
  username: string;
  focus: boolean;
};

type Room = {
  clients: Map<string, Participant>;
  document: RoomDocument;
};

type ChatMessage = {
  id: string;
  message: string;
  username?: string;
  self?: boolean;
  type: "message" | "system";
  time: number;
};
```

`RoomStore` owns `Map<roomId, Room>`. Its methods are synchronous because all state is process-local.

## 4. HTTP design

### `GET /health`

Returns process liveness:

```json
{ "status": "ok" }
```

### `POST /api/compile`

Request:

```json
{
  "code": "print('hello')",
  "language": "python",
  "fileName": "main.py"
}
```

`fileName` is accepted for client compatibility but ignored. The server selects the filename from `LANGUAGES`.

Successful responses pass through the OneCompiler JSON object. The UI consumes `stdout` and `stderr` as strings.

| Status | Condition |
| --- | --- |
| `200` | Upstream returned a successful HTTP response |
| `400` | Unsupported language, invalid code type, or malformed JSON |
| `413` | Express JSON body exceeded 210 KB |
| `429` | More than 30 compile requests per IP in 60 seconds |
| `502` | Upstream failure, timeout, malformed JSON, or oversized response |
| `404` | Unknown API route |

Proxy transformation:

```json
{
  "properties": {
    "language": "python",
    "files": [{ "name": "main.py", "content": "print('hello')" }],
    "stdin": null
  }
}
```

Limits:

- Code: 200,000 characters.
- Express JSON body: 210 KB.
- Upstream timeout: 9 seconds.
- Upstream response: 1,000,000 characters, with an early `Content-Length` check.
- Client timeout: 10 seconds.

### Static and SPA routes

`express.static` serves `dist/` with a one-hour cache duration. Non-API `GET` requests fall back to `dist/index.html`. Unknown API and non-GET routes return JSON `404` responses.

## 5. Socket connection design

Client configuration:

```js
{
  autoConnect: false,
  forceNew: true,
  reconnectionAttempts: Infinity,
  timeout: 10_000,
  transports: ["websocket", "polling"]
}
```

The session hook registers listeners before calling `connect()`. On every successful connection it emits `join`, which also covers reconnection. Cleanup removes all listeners and disconnects that exact socket, making the effect safe under React Strict Mode.

Server transport configuration:

- Maximum Socket.IO buffer: 256,000 bytes.
- Per-message deflate disabled.
- Origin accepted when absent, explicitly configured, same-host, or localhost.

## 6. Socket event contract

| Event | Direction | Payload | Server behavior |
| --- | --- | --- | --- |
| `join` | Client → server | `{roomId, username}` | Validates, binds socket data, joins room, returns snapshot, broadcasts roster |
| `sync` | Server → client | `{code, language, question}` | Replaces local room snapshot after join/rejoin |
| `joined` | Server → room | `{username, socketId, clients}` | Updates roster and creates a local system notice for other clients |
| `change` | Client → server | `{code, language?}` | Updates authoritative document and broadcasts code plus current language |
| `change` | Server → peers | `{code, language}` | Updates CodeMirror state and language |
| `question` | Client → server | `{question}` | Updates authoritative notes and broadcasts to peers |
| `question` | Server → peers | `{question}` | Updates local notes |
| `message` | Client → server | `{message}` | Creates server-owned ID, username, type, and timestamp; broadcasts to peers |
| `message` | Server → peers | `ChatMessage` | Appends to capped client history |
| `activity` | Client → server | `{action: "run"}` | Emits a server-generated system message to peers |
| `focus-on` | Client → server | none | Marks sender focused and broadcasts roster |
| `focus-off` | Client → server | none | Marks sender away and broadcasts roster |
| `presence` | Server → room | `{clients}` | Replaces participant roster |
| `leave` | Server → peers | `{socketId, username, clients}` | Removes participant and adds a local system notice |
| `room-error` | Server → client | `{message}` | Displays room/session error state |

### Validation and event limits

| Field or bucket | Limit |
| --- | --- |
| Room ID | 64 characters; letters, digits, `_`, and `-` only |
| Username | 40 characters after trimming |
| Code | 200,000 characters |
| Problem notes | 20,000 characters |
| Chat message | 2,000 characters after trimming |
| Document events | 300 per socket per 10 seconds, shared by code and question |
| Chat events | 30 per socket per 10 seconds |
| Activity events | 10 per socket per 10 seconds |

All post-join handlers derive `roomId` from `socket.data` and confirm `socket.rooms.has(roomId)`. Clients cannot use a payload room ID to target another room. Message type, username, timestamp, activity text, and compiler filename are server-owned.

## 7. Room store behavior

### Join

1. Look up room by ID.
2. If absent, create a JavaScript starter document.
3. Add or replace participant by socket ID with `focus: true`.
4. Return the current document object.

### Document update

`updateDocument` shallow-merges a validated patch. Code changes always broadcast the complete code and effective language. There is no version field or conflict detection; arrival order determines the current value.

### Leave

The participant is removed. When `clients.size` reaches zero, the room and its document are deleted.

## 8. Client room session

`useRoomSession` owns:

```text
status       connecting | connected | reconnecting
error        latest connection or room error
users        current participant roster
code         complete editor value
language     supported language ID
question     shared problem notes
messages     local message history, capped at 200
```

Local code and question changes update React state immediately and emit the complete value. Chat uses an optimistic message with `self: true`; the server sends that message only to peers, preventing a duplicate for the sender.

Changing language replaces the code with that language's starter template and emits code plus language atomically.

Focus and blur listeners exist once at room-session level, independent of participant count.

## 9. Compiler client behavior

`compileCode` performs these steps:

1. Reject an unsupported language locally.
2. Choose same-origin `/api/compile`, or prefix it with `VITE_COMPILER_API_URL`.
3. Combine the caller signal with `AbortSignal.timeout(10_000)`.
4. Send code, language, and metadata filename as JSON.
5. Reject non-2xx responses with a sanitized status message.
6. Normalize non-string `stdout` and `stderr` to empty strings.

`RoomPage` prevents duplicate runs, owns an `AbortController`, updates Output, emits a run activity after success, and opens the Output tab on mobile for success or failure.

## 10. UI composition and responsiveness

```text
App
├── LobbyPage
│   └── Select (theme)
└── RoomPage
    ├── RoomSidebar
    ├── toolbar
    │   ├── Run
    │   ├── Select (language)
    │   └── Select (theme)
    ├── MobileWorkspaceTabs
    ├── problem notes
    ├── CodeEditor
    ├── OutputPanel
    ├── ChatPanel
    └── ResizeHandle × 2
```

### Mobile, below 768 px

- Participant rail is hidden and opened as an off-canvas drawer.
- Main workspace occupies the full viewport width.
- Problem, Code, Output, and Chat use one visible tab panel at a time.
- Compilation activates Output automatically.
- Toolbar controls wrap; theme selection uses a compact trigger.

### Tablet, 768–1279 px

- Code workspace and Output are side by side.
- Chat remains in the mobile tab flow only below 768 px and is hidden at tablet widths.
- The code/result separator supports pointer and keyboard resizing.

### Desktop, 1280 px and above

- Code, Output, and Chat are side by side.
- Two separators resize adjacent columns.
- Minimum widths: code 360 px, output 240 px, chat 260 px.
- Output and chat widths persist in `localStorage`, clamp to viewport capacity, support arrow keys, and reset on double-click.

## 11. Accessible controls

- The custom `Select` uses a button trigger, listbox/option roles, selected state, and focus restoration.
- Dropdown keys: Arrow Up/Down, Home, End, Enter, Space, Escape, and Tab.
- Resize handles use separator roles, value metadata, arrow-key resizing, and visible focus states.
- Mobile workspace buttons use tab roles and `aria-controls`.
- Chat and compiler output use live regions for asynchronous updates.
- Icon-only actions provide accessible labels and titles.

## 12. Error handling

| Layer | Strategy |
| --- | --- |
| Socket client | Connection status and retry message; rejoin on connect |
| Socket server | Ignore malformed events or emit a bounded room error |
| Compiler client | Typed `CompilerError`, timeout detection, sanitized network message |
| Compiler proxy | Bounded JSON errors for validation, rate, timeout, upstream, and size failures |
| Express | JSON responses for malformed body, oversized body, 404, and unexpected error |
| UI | Toast notification plus persistent Output text for compiler errors |

## 13. Test design

| Test area | Covered behavior |
| --- | --- |
| Lobby | Rendering and missing-input validation |
| Select | Click selection, arrow-key selection, Escape, focus restoration |
| Code editor | Full-height layout regression |
| Mobile tabs | Active tab, chat count, tab selection |
| Panel widths | Minimum/maximum clamp, drag resizing, reset behavior |
| Compiler client | Filename mapping, unsupported language, same-origin default |
| Compiler proxy | Exact OneCompiler payload and unsupported-language rejection |
| Room store | Snapshot retention while active and empty-room deletion |
| Socket integration | Cross-room document injection prevention |

All tests run with Vitest. Browser-facing tests use Testing Library and jsdom; server tests use the Node environment and real Socket.IO client/server instances where integration behavior matters.

## 14. Change rules

When extending the application:

1. Add new event names to `src/shared/protocol/events.js` before using them.
2. Validate and rate-limit every new client-originated event in `socketHandlers.js`.
3. Never trust client-provided room IDs, usernames, message types, timestamps, or filenames after join.
4. Update both HLD and LLD when boundaries, persistence, or protocols change.
5. Add an integration test for authorization boundaries and component tests for new interactions.
