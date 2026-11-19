import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

function devSyncApiPlugin(): Plugin {
  const eventsStore: Array<{ id: string; createdAt: string; [key: string]: unknown }> = [];

  return {
    name: 'dev-sync-api',
    configureServer(server) {
      server.middlewares.use('/api/sync', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          const url = new URL(req.url || '/', 'http://localhost');
          const since = url.searchParams.get('since');
          const filtered = since ? eventsStore.filter((e) => e.createdAt > since) : eventsStore;
          res.end(JSON.stringify({ events: filtered, serverTime: new Date().toISOString() }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += String(chunk);
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body || '{}') as {
                events?: Array<{ id: string; createdAt: string; [key: string]: unknown }>;
              };
              const incoming = Array.isArray(parsed.events) ? parsed.events : [];
              const existingIds = new Set(eventsStore.map((e) => e.id));
              const acceptedIds: string[] = [];

              for (const evt of incoming) {
                if (evt && typeof evt.id === 'string') {
                  acceptedIds.push(evt.id);
                  if (!existingIds.has(evt.id)) {
                    eventsStore.push(evt);
                    existingIds.add(evt.id);
                  }
                }
              }

              eventsStore.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
              res.end(JSON.stringify({ acceptedIds, serverTime: new Date().toISOString() }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'JSON inválido' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    devSyncApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/icon-maskable.svg'],
      manifest: {
        name: 'Acampamento Dorina Azevedo 2026',
        short_name: 'Acamp. Dorina',
        description:
          'Gestão Offline-First do Acampamento A Alegria de Ser Desbravador - Clube Dorina Azevedo (20 a 22/11/2026)',
        theme_color: '#0A3D2E',
        background_color: '#FAF6EA',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,ico,woff2,json}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
});
