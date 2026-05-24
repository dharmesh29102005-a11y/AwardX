# AwardX Setup Guide

## Prerequisites

- Node.js installed
- Supabase account
- Google OAuth credentials (for Google sign-in)

## Step 1: Environment Variables

1. Create a `.env` file in the root directory with the following:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_SITE_URL=http://localhost:3000
VITE_SENTRY_DSN=https://xxx.ingest.sentry.io/xxx

# Server-only (Vercel Functions / backend only)
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
RESEND_API_KEY=YOUR_RESEND_API_KEY
SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=rzp_test_xxx
UPTIME_BASE_URL=https://your-production-domain.com
```

2. If deploying to production, update `VITE_SITE_URL` to your production URL.
3. Rotate any previously exposed Supabase keys immediately and replace them with newly issued keys.

## Step 2: Database Setup

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/complete_schema.sql`
4. Paste and run it in the SQL Editor

This will create all necessary tables, indexes, RLS policies, triggers, and functions.

## Step 3: Configure Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if prompted
6. Create an OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `https://yavozrvkpbywjdabygoo.supabase.co/auth/v1/callback`
     - `http://localhost:3000` (for development)

7. Copy the Client ID and Client Secret

### 3.2 Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Find "Google" in the list and enable it
4. Enter your Google OAuth Client ID and Client Secret
5. Save the changes

### 3.3 Update Redirect URLs in Supabase

1. In Supabase dashboard, go to Authentication → URL Configuration
2. Add your site URLs to "Redirect URLs":
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the Application

Start the frontend and API together (same routes as Vercel production):

```bash
npm run dev
```

This runs:

- Vite on `http://localhost:3000`
- Local API shim on `http://localhost:5001` (`scripts/dev-api-server.ts` → `api/[...path].ts` + Express route bridge)

Vite proxies `/api/*` to port 5001. There is **no separate Express deploy** — production uses Vercel serverless.

- Frontend only: `npm run dev:client` (API calls will fail unless you also run `npm run dev:api`)
- API shim only: `npm run dev:api`
- Full Vercel-like dev: `npm run dev:vercel` (requires Vercel CLI)

**Local env tips**

- Leave `VITE_BACKEND_URL` empty so requests use the Vite proxy.
- Default API port is `5001` (avoid 5000 on macOS — AirPlay).
- Optional: set `CRON_SECRET` and call `GET http://localhost:5001/api/cron/round-scheduler?secret=...` to test the scheduler tick.

The application will be available at `http://localhost:3000`

## Step 6: Testing Authentication

1. Navigate to the login page
2. Click the Google sign-in button
3. Complete the Google OAuth flow
4. You should be redirected back to the application and logged in

## Database Schema Overview

The schema includes:

- **Core Tables**: organizations, profiles, programs, submissions
- **Judging System**: judges, submission_judges, judging_criteria, scores
- **CRM**: contacts, contact_custom_fields
- **Messaging**: message_threads, messages, thread_participants
- **Marketing**: social_accounts, scheduled_posts, campaign_templates
- **CMS**: testimonials, pricing_tiers, features, use_cases, case_studies, FAQs
- **Audit**: audit_logs
- **RBAC**: roles, permissions, role_permissions, organization_members

## Row Level Security (RLS)

RLS is enabled on all sensitive tables. Basic policies are included, but you should customize them based on your security requirements.

## Next Steps

1. Customize RLS policies based on your security needs
2. Set up email templates in Supabase for password resets and invitations
3. Configure storage buckets for file uploads (avatars, submissions)
4. Set up webhooks if needed for payment processing
5. If using Stripe checkout, point your Stripe webhook to `/api/webhooks/stripe`
6. For Razorpay, client-side verification posts to `/api/payments/razorpay-verify`
7. Stripe Connect onboarding starts at `/api/payments/stripe-connect-start?programId=<program-id>`
8. Health check endpoint for uptime monitoring is `/api/health`
9. Configure GitHub secret `UPTIME_BASE_URL` to enable scheduled checks in `.github/workflows/uptime-monitor.yml`
10. Set `VITE_SENTRY_DSN` in production environment variables to enable frontend error monitoring
11. All `/api/*` routes deploy with the same Vercel project — no separate Express host
12. Configure additional OAuth providers (GitHub, LinkedIn) if needed

## Production deployment (Vercel — awardx.one)

Use **one Vercel project** for the frontend + all API routes.

| Setting | Value |
|--------|--------|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

Do **not** run `npm run dev` or `npm start` on Vercel — those are local only.

**How API routing works**

1. `api/[...path].ts` — Vercel serverless entry for `/api/*`
2. Native handlers in `api/_handlers/` (invites, payments, webhooks, public overview, …)
3. Everything else is served via the Express route modules in `server/src/routes/` (same process, per request — no separate server host)

**Round scheduler:** Vercel Cron hits `/api/cron/round-scheduler` every minute (`vercel.json`). Set `CRON_SECRET` in Vercel and configure the cron job to send `Authorization: Bearer <CRON_SECRET>` (or `?secret=` for manual tests).

**Environment variables (Vercel dashboard)**

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL=https://awardx.one`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (required for dashboard + overview routes)
- `RESEND_API_KEY`, Stripe/Razorpay keys as needed
- `CRON_SECRET` (recommended for scheduler cron)
- **`VITE_BACKEND_URL` — leave empty** (same-origin `/api/*`). Never set to `localhost` in production.
- Optional Redis: `REDIS_ENABLED=true`, `REDIS_URL`, …

## Troubleshooting

### Google OAuth not working

- Verify redirect URIs match exactly in both Google Console and Supabase
- Check that Google OAuth is enabled in Supabase
- Verify Client ID and Secret are correct
- Check browser console for errors

### Database errors

- Ensure all extensions are enabled (uuid-ossp, pgcrypto)
- Verify foreign key constraints match the schema
- Check RLS policies aren't blocking access

### Environment variables not loading

- Ensure `.env` file is in the root directory
- Restart the development server after changing `.env`
- Verify variable names use `VITE_` prefix

### `ERR_CONNECTION_REFUSED` on `/api/overview/...`

**Local:** Run `npm run dev` (client + API shim). `npm run dev:client` alone leaves nothing behind the Vite proxy.

**Production (awardx.one):** Remove `VITE_BACKEND_URL` if it points at `localhost`. Redeploy after changing env vars (Vite bakes `VITE_*` at build time).


