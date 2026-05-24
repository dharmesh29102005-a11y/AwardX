# AwardX API route modules (`server/src`)

Express route handlers used **inside Vercel serverless** via `api/_bridge/expressBridge.ts`. They are **not** a separate deployed server.

## Production

- Request → `api/[...path].ts` (Vercel)
- Native handlers in `api/_handlers/` run first (invites, payments, webhooks, …)
- Other paths → `server/src/routes/*` through the Express bridge

## Local development

```bash
npm run dev          # Vite :3000 + API shim :5001
npm run dev:api      # API shim only
```

The shim (`scripts/dev-api-server.ts`) calls the same `api/[...path].ts` entry as production.

## Optional legacy standalone

```bash
npm run dev:legacy-server   # Express listen on PORT (debug only)
```

## Scheduler

Background scheduling uses **Vercel Cron** (`/api/cron/round-scheduler`), not `app.listen()` intervals. See `api/_lib/roundScheduler.ts`.

## Environment

Use the **project root** `.env` (loaded by `server/src/loadEnv.ts`). Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
