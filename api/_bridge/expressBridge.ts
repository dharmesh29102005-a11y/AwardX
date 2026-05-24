import type { Express } from 'express';
import { getExpressApp } from '../../server/src/app.js';

function buildApiPath(pathKey: string): string {
  const normalized = pathKey.replace(/^\/+|\/+$/g, '');
  return normalized ? `/api/${normalized}` : '/api';
}

/**
 * Forwards a Vercel-style request to the Express app (server routes).
 * Mutates req.url so Express routing matches production paths.
 */
export async function handleWithExpress(req: any, res: any, pathKey: string): Promise<void> {
  const app: Express = getExpressApp();
  const search = typeof req.url === 'string' && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const originalUrl = req.url;
  const targetUrl = `${buildApiPath(pathKey)}${search}`;
  req.url = targetUrl;
  if (req.originalUrl !== undefined) {
    req.originalUrl = targetUrl;
  }

  await new Promise<void>((resolve) => {
    app(req, res, () => {
      if (!res.headersSent) {
        res.status(404).json({ error: 'Not found', path: pathKey });
      }
      resolve();
    });
  });

  req.url = originalUrl;
}
