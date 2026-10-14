import 'dotenv/config';
import express from 'express';
import { getStatus } from './mcserverstatus.js';

const app = express();

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

const keys = new Map(
  (process.env.API_KEYS ?? '')
    .split(',')
    .filter(Boolean)
    .map((entry) => {
      const [name, key] = entry.split(':');
      return [key, name];
    }),
);

app.use((req, res, next) => {
  const client = keys.get(req.get('x-api-key'));
  if (!client) return res.status(401).json({ error: 'Unauthorized' });

  req.client = client;
  next();
});

app.get('/status', async (req, res) => {
  const bedrock = req.query.bedrock === 'true';
  const input = String(req.query.host ?? '').trim();

  const [host, portText] = input.split(':');
  const port = portText ? Number(portText) : bedrock ? 19132 : 25565;

  if (!host || !/^[a-z0-9.-]+$/i.test(host)) {
    return res.status(400).json({ error: 'Invalid server address' });
  }

  res.json(await getStatus(host, port, bedrock));
});

app.listen(process.env.PORT ?? 3000, '127.0.0.1', () => {
  console.log('API listening on http://127.0.0.1:3000');
});
