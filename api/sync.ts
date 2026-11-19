type SyncEventRecord = {
  id: string;
  createdAt: string;
  [key: string]: unknown;
};

const REDIS_KEY = 'dorina:acampamento:2026:sync_events';
const inMemoryStore: SyncEventRecord[] = [];

function getKvConfig(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (url && token) {
    return { url: url.replace(/\/+$/, ''), token };
  }
  return null;
}

async function kvLoadEvents(kv: { url: string; token: string }): Promise<SyncEventRecord[]> {
  const res = await fetch(`${kv.url}/get/${encodeURIComponent(REDIS_KEY)}`, {
    headers: { Authorization: `Bearer ${kv.token}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { result?: string | null };
  if (!data.result) return [];
  try {
    const parsed = JSON.parse(data.result);
    return Array.isArray(parsed) ? (parsed as SyncEventRecord[]) : [];
  } catch {
    return [];
  }
}

async function kvSaveEvents(
  kv: { url: string; token: string },
  events: SyncEventRecord[]
): Promise<void> {
  await fetch(`${kv.url}/set/${encodeURIComponent(REDIS_KEY)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kv.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(events)),
  });
}

async function loadAllEvents(): Promise<SyncEventRecord[]> {
  const kv = getKvConfig();
  if (kv) {
    return kvLoadEvents(kv);
  }
  return inMemoryStore;
}

async function saveAllEvents(events: SyncEventRecord[]): Promise<void> {
  const kv = getKvConfig();
  if (kv) {
    await kvSaveEvents(kv, events);
    return;
  }
  inMemoryStore.length = 0;
  inMemoryStore.push(...events);
}

export default async function handler(
  req: {
    method?: string;
    query?: Record<string, string | string[] | undefined>;
    body?: { events?: SyncEventRecord[] } | string;
  },
  res: {
    setHeader: (k: string, v: string) => void;
    status: (code: number) => { json: (data: unknown) => void; end: () => void };
  }
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    const sinceParam = req.query?.since;
    const since = Array.isArray(sinceParam) ? sinceParam[0] : sinceParam;
    const all = await loadAllEvents();
    const events = since ? all.filter((e) => e.createdAt > since) : all;

    res.status(200).json({
      events,
      serverTime: new Date().toISOString(),
    });
    return;
  }

  if (req.method === 'POST') {
    let parsedBody: { events?: SyncEventRecord[] } = {};
    if (typeof req.body === 'string') {
      try {
        parsedBody = JSON.parse(req.body) as { events?: SyncEventRecord[] };
      } catch {
        res.status(400).json({ error: 'JSON inválido' });
        return;
      }
    } else if (req.body && typeof req.body === 'object') {
      parsedBody = req.body;
    }

    const incoming = Array.isArray(parsedBody.events) ? parsedBody.events : [];
    const current = await loadAllEvents();
    const existingIds = new Set(current.map((e) => e.id));
    const acceptedIds: string[] = [];

    for (const evt of incoming) {
      if (evt && typeof evt.id === 'string') {
        acceptedIds.push(evt.id);
        if (!existingIds.has(evt.id)) {
          current.push(evt);
          existingIds.add(evt.id);
        }
      }
    }

    current.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    await saveAllEvents(current);

    res.status(200).json({
      acceptedIds,
      serverTime: new Date().toISOString(),
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
