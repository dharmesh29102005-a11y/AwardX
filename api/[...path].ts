import { loadRootEnv } from '../server/src/loadEnv.js';
import { resolveHandler } from './_handlers/registry';
import { handleWithExpress } from './_bridge/expressBridge';

loadRootEnv();

export default async function handler(req: any, res: any) {
  const raw = req.query.path;
  const pathKey = Array.isArray(raw) ? raw.join('/') : raw || 'health';
  const method = (req.method || 'GET').toUpperCase();

  const routeHandler = resolveHandler(pathKey, method);
  if (routeHandler) {
    await routeHandler(req, res);
    return;
  }

  await handleWithExpress(req, res, pathKey);
}
