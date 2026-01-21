# 🚆 Railway Deployment Guide (Backend + Frontend)

This repo is a monorepo:

- **Backend**: `server/` (Node.js + Express + Prisma + Better Auth)
- **Frontend**: `project/` (Vite + React)

This guide shows how to deploy the backend to Railway, then configure the frontend to talk to it.

---

## ✅ Prerequisites

- A Railway account
- A GitHub repo (this project pushed to GitHub)
- Your backend env vars ready (see `docs/ENV_VARIABLES_GUIDE.md`)

---

## 1) Deploy the backend (`server/`) to Railway

### Option A (recommended): Deploy from GitHub, with Root Directory = `server/`

1. Create a **New Project** in Railway
2. Choose **Deploy from GitHub Repo**
3. Select your repo
4. In the service settings, set:
   - **Root Directory**: `server`
5. Railway should detect Node and use:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`

> If Railway prompts for build/start commands, the backend already has them in `server/package.json`.

---

## 2) Set Railway environment variables (backend)

In Railway, open your backend service → **Variables** and add:

- **`DATABASE_URL`**
  - SQLite (simple): `file:./prisma/dev.db`
  - Postgres (recommended for production): see `docs/PRISMA_POSTGRES_GUIDE.md`
- **`BETTER_AUTH_SECRET`**: a long random secret
- **`FRONTEND_ORIGIN`**: your frontend URL (or `http://localhost:8080` for local testing)
- **`N8N_WEBHOOK_SECRET`**: shared secret for n8n → backend webhook auth
- **`N8N_WEBHOOK_REDDIT`**: your n8n webhook URL that receives search requests (backend → n8n)
- **`PORT`**: Railway sets this automatically; you can omit it unless you want to force it

---

## 3) Run Prisma migrations on Railway

### If using Postgres on Railway

After your DB is attached and `DATABASE_URL` points to Postgres:

- Run migrations (Railway “Run Command” / deploy step):

```bash
npx prisma migrate deploy
```

> `migrate deploy` is the correct command for production.

### If using SQLite on Railway

SQLite will work, but note:

- The database file can be ephemeral across deployments depending on how the container is rebuilt.
- For production, **Postgres is strongly recommended**.

---

## 4) Get your Railway backend URL (for n8n + frontend)

Once deployed, Railway will give you a public URL like:

- `https://<your-service>.up.railway.app`

You will use this as a **base URL** for:

- **n8n env var**: paste **only** the base URL (no `/api/...`)
- **frontend env var**: `VITE_API_URL` should be the base URL

---

## 5) Local testing with ngrok (n8n → your local backend)

If you are testing the repo locally but your n8n is remote/cloud:

1. Visit `https://dashboard.ngrok.com/`
2. Install ngrok
3. Run the authtoken command ngrok provides
4. Start the backend locally (port 3001)
5. In a separate terminal run:

```bash
ngrok http 3001
```

6. Copy the https forwarding URL ngrok prints, e.g.:
   - `https://<your-ngrok-subdomain>.ngrok.app`

7. Paste **only that base URL** into your n8n “Set Environment Variables” node.

> You do not need to include `/api/...` in the environment variable. Your n8n HTTP Request nodes already append the correct endpoint path.

---

## 6) Deploy the frontend (`project/`)

You can deploy the frontend anywhere that supports static/Vite builds (Railway, Vercel, Netlify).

### Required frontend env var

Set:

- `VITE_API_URL` = `https://<your-backend-domain>`

Then build:

```bash
cd project
npm install
npm run build
```

---

## 7) Production checklist

- Confirm CORS origin is correct (`FRONTEND_ORIGIN`)
- Confirm auth cookies work on your domain (HTTPS)
- Confirm n8n webhook auth header `x-api-key` matches `N8N_WEBHOOK_SECRET`
- Confirm the n8n server URL env var is **base URL only**

