/**
 * Optional standalone server for debugging only.
 * Production and `npm run dev` use Vercel serverless via api/[...path].ts.
 */
import { getExpressApp } from './app.js';
import { getCacheStatus } from './cache/redisCache.js';
import { loadRootEnv } from './loadEnv.js';

loadRootEnv();

const port = Number(process.env.PORT || 5001);
const app = getExpressApp();

app.listen(port, () => {
  const cacheStatus = getCacheStatus();
  console.log(`[legacy] Express listening on port ${port} (prefer npm run dev + api bridge)`);
  console.log(
    `[cache] enabled=${cacheStatus.enabled} configured=${cacheStatus.configured} available=${cacheStatus.available}`,
  );
});
