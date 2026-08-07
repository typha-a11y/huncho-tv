import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {resolveBackendDownloads, recordUserNotification, unrestrictWithRealDebrid} from './src/lib/serverResolver';

const apiDownloadsPlugin = (): Plugin => ({
  name: 'api-downloads-middleware',
  configureServer(server) {
    // 1. Download Resolver Endpoint
    const handleDownloadRequest = async (req: any, res: any) => {
      const url = new URL(req.url || '', 'http://localhost');
      const imdbId = url.searchParams.get('imdb_id') || url.searchParams.get('imdbId');
      const title = url.searchParams.get('title') || 'Movie';
      const year = url.searchParams.get('year');
      const debridKey = url.searchParams.get('debrid_key');

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      try {
        const result = await resolveBackendDownloads(imdbId, title, year || undefined, debridKey || undefined);
        res.end(JSON.stringify(result));
      } catch (err) {
        res.end(
          JSON.stringify({
            success: false,
            imdbId,
            title,
            activeSourceType: null,
            sources: []
          })
        );
      }
    };

    // 2. Notify Me Request Endpoint
    const handleNotifyRequest = async (req: any, res: any) => {
      let bodyData = '';
      req.on('data', (chunk: any) => {
        bodyData += chunk;
      });

      req.on('end', async () => {
        let imdbId: string | null = null;
        let title = 'Movie';
        let email: string | undefined = undefined;

        try {
          if (bodyData) {
            const parsed = JSON.parse(bodyData);
            imdbId = parsed.imdbId || parsed.imdb_id || null;
            title = parsed.title || 'Movie';
            email = parsed.email;
          } else {
            const url = new URL(req.url || '', 'http://localhost');
            imdbId = url.searchParams.get('imdb_id') || url.searchParams.get('imdbId');
            title = url.searchParams.get('title') || 'Movie';
            email = url.searchParams.get('email') || undefined;
          }

          const success = await recordUserNotification(imdbId, title, email);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success, message: "Notification flag set successfully" }));
        } catch {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false }));
        }
      });
    };

    // 3. Real-Debrid Unrestrict Direct Link Endpoint
    const handleUnrestrictDebrid = async (req: any, res: any) => {
      let bodyData = '';
      req.on('data', (chunk: any) => {
        bodyData += chunk;
      });

      req.on('end', async () => {
        try {
          let magnetUrl = '';
          let debridKey = '';

          if (bodyData) {
            const parsed = JSON.parse(bodyData);
            magnetUrl = parsed.magnetUrl || parsed.magnet_url || '';
            debridKey = parsed.debridKey || parsed.debrid_key || '';
          }

          const directUrl = await unrestrictWithRealDebrid(magnetUrl, debridKey);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: Boolean(directUrl), directUrl }));
        } catch {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, directUrl: null }));
        }
      });
    };

    server.middlewares.use('/api/download-resolver', handleDownloadRequest);
    server.middlewares.use('/api/downloads', handleDownloadRequest);
    server.middlewares.use('/api/notify-request', handleNotifyRequest);
    server.middlewares.use('/api/unrestrict-debrid', handleUnrestrictDebrid);
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDownloadsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
