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

## Run

```bash
npm run dev     # dev, loads .env, auto-restarts
npm start       # production (env supplied by the host)
```

Listens on `127.0.0.1:3000` (override with `PORT`).

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
  "players": { "online": 29206, "max": 200000 },
  "motd": "...",
  "favicon": "data:image/png;base64,...",
  "latency": 523
}
```

Offline servers return `{ "online": false, ... }`.
Missing or invalid key returns `401`; a bad `host` returns `400`.

## Caching

Results are cached in memory: 15s for online servers, 5s for offline.
