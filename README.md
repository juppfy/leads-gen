# Leads Finder (Open Source)

**Leads Finder** helps you discover high-intent conversations on **Reddit** for any product URL.

It’s built to be open-source friendly:

- **Auth**: Better Auth (email + password only)
- **Backend**: Node.js + Express
- **Database**: Prisma + SQLite in dev (easy), **Postgres-ready** for production
- **Automation**: n8n webhooks for progressive processing

---

## Repo structure

- **`project/`**: React + Vite frontend
- **`server/`**: Express API + Prisma + Better Auth
- **`docs/`**: Full setup, n8n formats, deployment guides

---

## Quick start (local dev)

### 1) Backend

```bash
cd server
npm install
cp env.example .env
# fill in server/.env
npx prisma migrate dev
npm run dev
```

Backend runs at:

- `http://localhost:3001`
- Health: `http://localhost:3001/health`

### 2) Frontend

```bash
cd project
npm install
# create project/.env.local with:
# VITE_API_URL=http://localhost:3001
npm run dev
```

Frontend runs at the Vite URL (commonly `http://localhost:8080`).

---

## n8n integration (local + production)

The backend receives n8n stage payloads at:

- `POST /api/webhook/n8n`

Docs (recommended reading order):

- `docs/N8N_UPDATED_FORMAT_GUIDE.md` (canonical)
- `docs/N8N_FORM_URLENCODED_GUIDE.md`
- `docs/CONVERSATIONS_FINAL_GUIDE.md`

### Local testing from cloud n8n (ngrok)

See `docs/RAILWAY_DEPLOYMENT_GUIDE.md` for the exact steps.

Key rule:

- In n8n, store **only the base URL** (ngrok/Railway) in your env node — do **not** include `/api/...`.

---

## Deploy to Railway

See:

- `docs/RAILWAY_DEPLOYMENT_GUIDE.md`

This repo includes a `railway.json` that targets the backend in `server/`.

---

## Switching to Postgres (production)

See:

- `docs/PRISMA_POSTGRES_GUIDE.md`

---

## License

This project is licensed under the **MIT License**. See `LICENSE`.

