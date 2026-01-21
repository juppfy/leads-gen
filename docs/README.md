# Leads Finder Documentation (`docs/`)

Welcome to the **Leads Finder** documentation. This folder contains everything an open‑source user needs to **install, run, integrate n8n, and deploy** the app.

## Core Docs (start here)

- **`GETTING_STARTED.md`** – Complete beginner‑friendly setup for backend + frontend (local dev)
- **`ENV_VARIABLES_GUIDE.md`** – All environment variables (backend, frontend, n8n, production)
- **`QUICK_START_TESTING.md`** – Test the backend step‑by‑step with `curl` (no prior experience needed)
- **`RAILWAY_DEPLOYMENT_GUIDE.md`** – Deploy backend to Railway + configure frontend + ngrok notes
- **`PRISMA_POSTGRES_GUIDE.md`** – Switching from SQLite (dev) to Postgres (production)
- **`ROADMAP.md`** – Product roadmap and future feature plans

## n8n & Webhook Integration

- **`N8N_UPDATED_FORMAT_GUIDE.md`** – Canonical guide for how n8n talks to `/api/webhook/n8n`  
  (stages, payload structure, JSON vs form‑urlencoded, ngrok/Railway URLs)
- **`CONVERSATIONS_FINAL_GUIDE.md`** – Extra detail for the `conversations_final` stage
- **`N8N_FORM_URLENCODED_GUIDE.md`** – Deep dive into using form‑urlencoded bodies from n8n
- **`N8N_MARKDOWN_FORMAT.md`** – How markdown‑formatted post data is parsed in the backend

> If you only read one n8n doc, use **`N8N_UPDATED_FORMAT_GUIDE.md`** – the others are advanced/appendix material.

## Migration & Architecture (historical but useful)

These explain how the project moved from Firebase → Prisma + Express. They’re kept for context and for contributors who want to understand the design decisions:

- **`MIGRATION_PLAN_ANALYSIS.md`** – Original analysis of the old Firebase/Firestore setup and the new plan
- **`MIGRATION_IMPLEMENTATION_GUIDE.md`** – Detailed migration steps, including production deployment ideas
- **`MIGRATION_COMPLETE_SUMMARY.md`** – Summary of what changed and why

> These docs still mention Firebase/Firestore **as history only**; the current codebase no longer uses Firebase anywhere.

## How to use this folder as an open‑source user

1. **New to the project?** Start with `GETTING_STARTED.md`.
2. **Setting env vars?** Follow `ENV_VARIABLES_GUIDE.md` carefully.
3. **Want to sanity‑check the backend?** Run through `QUICK_START_TESTING.md`.
4. **Connecting n8n?** Use `N8N_UPDATED_FORMAT_GUIDE.md` to wire all stages.
5. **Curious about the architecture/migration?** Read the MIGRATION docs.

Everything else in this folder is optional deep‑dive reading. You can get a full local setup working using only the core docs above.