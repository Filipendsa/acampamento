type SyncEventRecord = {
  id: string;
  createdAt: string;
  [key: string]: unknown;
};

// Armazenamento 100% gratuito:
// 1. Opcionalmente persiste em um GitHub Gist privado/secreto se SYNC_GIST_ID + SYNC_GIST_TOKEN estiverem configurados (custo R$ 0).
// 2. Fallback em memória da instância quando sem Gist configurado.
const GIST_FILENAME = 'dorina-acampamento-sync.json';
const inMemoryStore: SyncEventRecord[] = [];

function getGistConfig(): { gistId: string; token: string } | null {
  const gistId = process.env.SYNC_GIST_ID || '';
  const token = process.env.SYNC_GIST_TOKEN || '';
  if (gistId && token) {
    return { gistId, token };
  }
  return null;
}

async function gistLoadEvents(cfg: { gistId: string; token: string }): Promise<SyncEventRecord[]> {
  const res = await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
    },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    files?: Record<string, { content?: string }>;
  };
  const content = data.files?.[GIST_FILENAME]?.content;
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as SyncEventRecord[]) : [];
  } catch {
    return [];
  }
}

async function gistSaveEvents(
  cfg: { gistId: string; token: string },
  events: SyncEventRecord[]
): Promise<void> {
  await fetch(`https://api.github.com/gists/${cfg.gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(events),
        },
      },
    }),
  });
}

async function loadAllEvents(): Promise<SyncEventRecord[]> {
  const gist = getGistConfig();
  if (gist) {
    return gistLoadEvents(gist);
  }
  return inMemoryStore;
}

async function saveAllEvents(events: SyncEventRecord[]): Promise<void> {
  const gist = getGistConfig();
  if (gist) {
    await gistSaveEvents(gist, events);
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
