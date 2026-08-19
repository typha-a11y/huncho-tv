import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {resolveBackendDownloads, recordUserNotification, unrestrictWithRealDebrid} from './src/lib/serverResolver';
import {
  handleInitiatePayment,
  handlePaymentWebhook,
  handleGetPaymentStatus,
  handleSimulateCallback,
} from './server/payments';

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

    // 4. Mobile Money Payments Endpoints (Tanzania)
    const handlePaymentsInitiate = async (req: any, res: any) => {
      let bodyData = '';
      req.on('data', (chunk: any) => { bodyData += chunk; });
      req.on('end', async () => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const parsed = bodyData ? JSON.parse(bodyData) : {};
          const result = await handleInitiatePayment(parsed);
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, message: err?.message || "Failed to initiate payment" }));
        }
      });
    };

    const handlePaymentsWebhook = async (req: any, res: any) => {
      let bodyData = '';
      req.on('data', (chunk: any) => { bodyData += chunk; });
      req.on('end', async () => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const parsed = bodyData ? JSON.parse(bodyData) : {};
          const sigHeader = req.headers['x-signature'] || req.headers['x-webhook-secret'] || '';
          const signature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
          const result = await handlePaymentWebhook(parsed, signature);
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, message: err?.message || "Webhook processing error" }));
        }
      });
    };

    const handlePaymentsStatus = async (req: any, res: any) => {
      const url = new URL(req.url || '', 'http://localhost');
      const reference = url.searchParams.get('reference') || undefined;
      const userId = url.searchParams.get('userId') || undefined;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      try {
        const result = await handleGetPaymentStatus(reference, userId);
        res.end(JSON.stringify(result));
      } catch (err: any) {
        res.end(JSON.stringify({ status: 'PENDING', isPro: false, message: "Error checking payment status" }));
      }
    };

    const handlePaymentsSimulate = async (req: any, res: any) => {
      let bodyData = '';
      req.on('data', (chunk: any) => { bodyData += chunk; });
      req.on('end', async () => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        try {
          const parsed = bodyData ? JSON.parse(bodyData) : {};
          const reference = parsed.reference || '';
          const result = await handleSimulateCallback(reference);
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.end(JSON.stringify({ success: false, message: err?.message || "Simulation failed" }));
        }
      });
    };

    server.middlewares.use('/api/download-resolver', handleDownloadRequest);
    server.middlewares.use('/api/downloads', handleDownloadRequest);
    server.middlewares.use('/api/notify-request', handleNotifyRequest);
    server.middlewares.use('/api/unrestrict-debrid', handleUnrestrictDebrid);
    server.middlewares.use('/api/payments/initiate', handlePaymentsInitiate);
    server.middlewares.use('/api/payments/webhook', handlePaymentsWebhook);
    server.middlewares.use('/api/payments/status', handlePaymentsStatus);
    server.middlewares.use('/api/payments/simulate-callback', handlePaymentsSimulate);
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDownloadsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  };
});
