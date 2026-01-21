# 🚆 Railway Deployment Guide

## 🎯 Important: What Railway Deploys

**Railway deploys ONLY the backend (`server/`).**

This repo is a monorepo with:
- **Backend**: `server/` → Deploy to **Railway** ✅
- **Frontend**: `project/` → Deploy to **Vercel/Netlify/Cloudflare Pages** (separate deployment)

**You cannot deploy both in one Railway service.** This guide covers deploying the backend to Railway. The frontend should be deployed separately to a static hosting platform.

---

## ✅ Prerequisites

- A Railway account
- A GitHub repo (this project pushed to GitHub)
- Your backend env vars ready (see `docs/ENV_VARIABLES_GUIDE.md`)

---

## 1) Deploy the backend (`server/`) to Railway

### Method: Deploy from GitHub (Recommended)

1. **Create a New Project** in Railway
2. **Deploy from GitHub Repo** → Select your repo
3. Railway will detect the `railway.json` file at the root, which tells it to:
   - Build from the `server/` directory
   - Use Node.js 20
   - Run `npm ci --legacy-peer-deps && npm run build` (build command)
   - Start with `npm run start` (start command)

**You don't need to manually set Root Directory** - the `railway.json` handles everything automatically.

### ⚠️ Important: Initial Deployment Will Crash

**This is expected!** Railway starts deploying immediately when you connect your GitHub repo, before you can set environment variables.

**What happens:**
1. Build completes successfully ✅
2. Server starts but crashes ❌ (missing env variables)
3. Deploy logs show error messages about missing variables

**What to do:**
1. Don't panic - this is normal!
2. Go to your Railway service → **Variables** tab
3. Add all required environment variables (see Step 2 below)
4. Railway will automatically redeploy once you save the variables
5. The second deployment should succeed ✅

---

## 2) Set Railway environment variables (backend)

In Railway, open your backend service → **Variables** and add:

- **`DATABASE_URL`**
  - SQLite (simple): `file:./prisma/dev.db`
  - Postgres (recommended for production): see `docs/PRISMA_POSTGRES_GUIDE.md`
- **`BETTER_AUTH_SECRET`**: a long random secret
- **`FRONTEND_ORIGIN`**: For now, use `http://localhost:8080` (you'll update this after deploying frontend to Vercel)
  - **Format**: Single URL or comma-separated URLs (no trailing slashes needed - they're auto-removed)
  - **Example (single)**: `https://your-project.vercel.app`
  - **Example (multiple)**: `http://localhost:8080,https://your-project.vercel.app,https://your-project-git-main-username.vercel.app`
  - **Note**: Vercel creates different URLs for production vs preview deployments. Include both if you want to test preview deployments.
- **`N8N_WEBHOOK_SECRET`**: shared secret for n8n → backend webhook auth
- **`N8N_WEBHOOK_REDDIT`**: your n8n webhook URL that receives search requests (backend → n8n)
- **`PORT`**: Railway sets this automatically; you can omit it unless you want to force it

**Note:** After deploying the frontend to Vercel (Step 7), you'll need to come back and update `FRONTEND_ORIGIN` with your Vercel URL(s), then Railway will redeploy automatically.

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

## 4) Generate Railway Public Domain

**Important:** You need to generate a public domain before deploying the frontend to Vercel.

1. After your backend redeploys successfully (Step 2), go to your Railway service
2. Click on **Settings** tab
3. Scroll down to **Public Networking** section
4. Click **Generate Domain** (or **Settings** → **Networking** → **Generate Domain**)
5. Railway will create a public URL like: `https://<your-service>.up.railway.app`
6. **Copy this domain** - you'll need it for:
   - Vercel frontend deployment (`VITE_API_URL`)
   - n8n environment variables

**Note:** You can also use a custom domain later, but the generated Railway domain works perfectly for now.

---

## 5) Use Railway URL for Frontend & n8n

Your Railway backend URL (from Step 4) will be used as a **base URL** for:

- **Vercel frontend**: Set `VITE_API_URL` = `https://<your-service>.up.railway.app`
- **n8n env var**: Paste **only** the base URL (no `/api/...`)

**Important:** Always use the **base URL only** - don't include `/api/...` paths. The frontend and n8n will append the correct endpoints.

---

## 6) Local testing with ngrok (n8n → your local backend)

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

## 7) Deploy the frontend (`project/`)

**Recommended: Deploy to Vercel** (see `docs/VERCEL_DEPLOYMENT_GUIDE.md`)

The frontend can also be deployed to Netlify, Cloudflare Pages, or Railway (as a separate service), but Vercel is recommended for the best Vite/React experience.

### Required frontend env var

Set:

- `VITE_API_URL` = `https://<your-backend-domain>.up.railway.app`

This tells your frontend where to find the backend API.

---

## 8) Production checklist

- Confirm CORS origin is correct (`FRONTEND_ORIGIN`)
- Confirm auth cookies work on your domain (HTTPS)
- Confirm n8n webhook auth header `x-api-key` matches `N8N_WEBHOOK_SECRET`
- Confirm the n8n server URL env var is **base URL only**

