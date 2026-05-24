import express, { type Express } from 'express';
import cors from 'cors';
import { loadRootEnv } from './loadEnv.js';
import apiRoutes from './routes/index.js';

loadRootEnv();

let appInstance: Express | null = null;

export function getExpressApp(): Express {
  if (appInstance) return appInstance;

  const app = express();
  const allowedOrigins = (process.env.FRONTEND_URL || process.env.VITE_SITE_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'awardx-express-routes' });
  });

  app.use('/api', apiRoutes);

  app.use((_req, res) => {
    if (!res.headersSent) {
      res.status(404).json({ error: 'Not found' });
    }
  });

  appInstance = app;
  return app;
}
