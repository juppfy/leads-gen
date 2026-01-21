# Leadsgen Backend (Node.js + Prisma + Better Auth placeholder)

This folder contains the new backend that will replace Firebase Functions with a Node.js/Express API, Prisma ORM, and Better Auth for email/password authentication.

## Quick start (local dev)
1. Copy `env.example` → `.env` and fill values.
2. Install deps:
   ```powershell
   cd "server"
   npm install
   ```
3. Generate Prisma client and SQLite DB:
   ```powershell
   npx prisma migrate dev --name init
   ```
4. Run dev server:
   ```powershell
   npm run dev
   ```

## Environment variables (`server/.env`)
- `DATABASE_URL` — SQLite for local (file:./dev.db) or Postgres URL in prod.
- `BETTER_AUTH_SECRET` — required; use a long random string.
- `PORT` — API port (default 3001).
- `FRONTEND_ORIGIN` — allow CORS from the frontend (e.g., http://localhost:5173).
- `N8N_WEBHOOK_*` — URLs for platform-specific webhooks.
- `N8N_WEBHOOK_SECRET` — shared secret for webhook auth.

## Next steps
- Implement Better Auth (email/password) with Prisma adapter.
- Implement `/api/search` and `/api/webhook/n8n` to mirror existing Firebase logic.
- Add REST endpoints for search + conversations retrieval.
- Wire frontend to use this API and remove Firebase SDK usage.
