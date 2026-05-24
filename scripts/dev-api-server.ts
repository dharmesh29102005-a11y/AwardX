/**
 * Local API shim for Vite dev: same routing as Vercel `api/[...path].ts`.
 * Not used in production (Vercel runs serverless functions directly).
 */
import http from 'node:http';
import { URL } from 'node:url';
import handler from '../api/[...path].ts';

const port = Number(process.env.PORT || process.env.API_PORT || 5001);

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
    const apiMatch = url.pathname.match(/^\/api\/?(.*)$/);
    if (!apiMatch) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    const pathKey = apiMatch[1] || 'health';

    let body: unknown = undefined;
    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
      const raw = await readBody(req);
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          body = raw;
        }
      }
    }

    const vercelReq = req as http.IncomingMessage & {
      query?: Record<string, string | string[]>;
      body?: unknown;
    };
    vercelReq.query = {
      path: pathKey,
      ...Object.fromEntries(url.searchParams.entries()),
    };
    vercelReq.body = body;
    vercelReq.url = url.pathname + url.search;

    await handler(vercelReq, res);
  } catch (error) {
    console.error('[dev-api-server]', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }
});

server.listen(port, () => {
  console.log(`[dev-api] AwardX API (serverless routes) http://127.0.0.1:${port}`);
});
