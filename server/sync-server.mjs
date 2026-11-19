import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.SYNC_PORT || 4000);
const DATA_FILE = path.resolve(process.cwd(), 'server', 'sync-events.json');

function loadEvents() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {
    // ignore corrupted read
  }
  return [];
}

function saveEvents(events) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  if (url.pathname !== '/api/sync') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (req.method === 'GET') {
    const since = url.searchParams.get('since');
    const all = loadEvents();
    const filtered = since ? all.filter((e) => e.createdAt > since) : all;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        events: filtered,
        serverTime: new Date().toISOString(),
      })
    );
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const incoming = Array.isArray(parsed.events) ? parsed.events : [];
        const current = loadEvents();
        const existingIds = new Set(current.map((e) => e.id));
        const acceptedIds = [];

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
        saveEvents(current);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            acceptedIds,
            serverTime: new Date().toISOString(),
          })
        );
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Method not allowed' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏕️ Servidor de Sincronização (Pull/Push) ativo em http://0.0.0.0:${PORT}/api/sync`);
});
