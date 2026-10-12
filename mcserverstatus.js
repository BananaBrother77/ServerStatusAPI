import { status, statusBedrock } from 'minecraft-server-util';

const cache = new Map();
const TTL = 15000; // 15 seconds
const OFFLINE_TTL = 5000; // 5 seconds

export async function getStatus(host, port, bedrock) {
  const key = `${host}:${port}:${bedrock}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;

  const started = Date.now();
  let result;

  try {
    const data = bedrock
      ? await statusBedrock(host, port, { timeout: 5000 })
      : await status(host, port, { timeout: 5000 });

    result = {
      online: true,
      bedrock,
      host,
      port,
      version: data.version?.name ?? null,
      players: {
        online: data.players.online,
        max: data.players.max,
        list: data.players.sample ?? [],
      },
      motd: data.motd?.clean ?? '',
      motdHtml: data.motd?.html ?? '',
      favicon: data.favicon ?? null,
      latency: Date.now() - started,
    };
  } catch (err) {
    result = { online: false, bedrock, host, port, error: err.message };
  }

  const ttl = result.online ? TTL : OFFLINE_TTL;
  cache.set(key, { data: result, expires: Date.now() + ttl });

  return result;
}
