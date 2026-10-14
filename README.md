# MCServerStatus API

A small API that returns the status of Minecraft Java and Bedrock servers.
Used by [MCToolkit](https://mctoolkit.bananabrother77.dev).

## Requirements

- Node.js 22+
- An `API_KEYS` value (see below)

## Setup

```bash
npm ci
```

Create a `.env` file:

```
API_KEYS=mctoolkit:some-long-random-key
```

Generate a key with:

```bash
openssl rand -hex 32
```

Multiple keys are supported, comma-separated, in `name:key` format:

```
API_KEYS=mctoolkit:abc123,friend:def456
```

`.env` is loaded automatically by [dotenv](https://github.com/motdotla/dotenv) when the app starts (`import 'dotenv/config'` at the top of `server.js`), so the key is available no matter how the process is launched.

## Run

```bash
npm run dev     # dev: watches for changes, auto-restarts
npm start       # run once
```

Listens on `127.0.0.1:3000` (override with `PORT`).

### Production (pm2)

```bash
pm2 start server.js --name mcserverstatus
pm2 restart mcserverstatus     # after changing .env or code
pm2 save                       # persist the process list across reboots
```

Because the app reads `.env` itself, no shell exports or `--update-env` are needed.

## Endpoints

### `GET /health`

Open, no key required.

```json
{ "ok": true }
```

### `GET /status?host=<address>[&bedrock=true]`

Requires an `x-api-key` header. `host` may include a port (`play.example.com:25566`).
Use `bedrock=true` for Bedrock servers.

```bash
curl -H "x-api-key: <key>" "http://127.0.0.1:3000/status?host=mc.hypixel.net"
```

Returns:

```json
{
  "online": true,
  "bedrock": false,
  "host": "mc.hypixel.net",
  "port": 25565,
  "version": "Requires MC 1.8 / 1.21",
  "players": {
    "online": 29206,
    "max": 200000,
    "list": [{ "name": "PlayerName", "id": "00000000-0000-0000-0000-000000000000" }]
  },
  "motd": "A Minecraft Server",
  "motdHtml": "<span>A <b>Minecraft</b> Server</span>",
  "favicon": "data:image/png;base64,...",
  "latency": 523
}
```

`players.list` holds the sample of online players; it is empty (`[]`) when the server hides its player list.

Offline servers return `{ "online": false, ... }`.
Missing or invalid key returns `401`; a bad `host` returns `400`.

## Caching

Results are cached in memory: 15s for online servers, 5s for offline.
