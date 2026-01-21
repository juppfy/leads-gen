# ▲ Vercel Deployment Guide (Frontend)

## 🎯 What This Guide Covers

This guide shows how to deploy the **frontend** (`project/`) to Vercel. The backend should already be deployed to Railway (see `docs/RAILWAY_DEPLOYMENT_GUIDE.md`).

---

## ✅ Prerequisites

- A Vercel account (free tier works)
- Your backend deployed on Railway (get the URL)
- A GitHub repo with this project pushed

---

## 1) Connect Your GitHub Repo to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will detect it's a Vite project

---

## 2) Configure Project Settings

### Root Directory

**Important:** Set the **Root Directory** to `project`:

1. In Vercel project settings → **General** → **Root Directory**
2. Click **Edit**
3. Enter: `project`
4. Click **Save**

### Build Settings

Vercel should auto-detect these from `project/vercel.json`, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build` (or leave empty, Vercel will auto-detect)
- **Output Directory**: `dist`
- **Install Command**: `npm install` (or leave empty)

---

## 3) Set Environment Variables

In Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Your Railway backend URL | `https://your-app.up.railway.app` |

**Important:**
- Use the **base URL only** (no trailing slash, no `/api/...`)
- Make sure it's the **production** backend URL (Railway), not `localhost`
- Vercel will rebuild automatically when you add variables

---

## 4) Deploy

1. Click **Deploy** (or push to your main branch - Vercel auto-deploys)
2. Wait for build to complete (~2-3 minutes)
3. Vercel will give you a URL like: `https://your-project.vercel.app`

---

## 5) Test Your Deployment

1. Visit your Vercel URL
2. Try signing up/logging in
3. Submit a search request
4. Check browser console for any API errors

**Common issues:**
- **CORS errors**: Make sure `FRONTEND_ORIGIN` in Railway backend includes your Vercel URL
- **404 on routes**: Vercel should handle SPA routing via `vercel.json`, but verify rewrites are working
- **API connection failed**: Double-check `VITE_API_URL` matches your Railway backend URL

---

## 6) Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS setup instructions
4. Update `FRONTEND_ORIGIN` in Railway backend to include your custom domain

---

## 7) Update Railway Backend CORS

After deploying to Vercel, update your Railway backend environment variables:

1. Go to Railway → Your backend service → **Variables**
2. Update `FRONTEND_ORIGIN` to include your Vercel URL:
   ```
   https://your-project.vercel.app
   ```
   Or if you have multiple origins:
   ```
   http://localhost:8080,https://your-project.vercel.app
   ```
3. Railway will redeploy automatically

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your main branch:

1. Push code to GitHub
2. Vercel detects the push
3. Builds and deploys automatically
4. You get a preview URL for each commit

---

## 📋 Deployment Checklist

- [ ] Root Directory set to `project`
- [ ] `VITE_API_URL` environment variable set (Railway backend URL)
- [ ] Build completes successfully
- [ ] Frontend loads at Vercel URL
- [ ] Can sign up/login
- [ ] Can create searches
- [ ] `FRONTEND_ORIGIN` in Railway backend includes Vercel URL

---

## 🐛 Troubleshooting

### Build fails with "Cannot find module"

Make sure Root Directory is set to `project`, not the repo root.

### API calls fail (CORS or 404)

1. Check `VITE_API_URL` is correct (no trailing slash)
2. Check `FRONTEND_ORIGIN` in Railway backend includes your Vercel URL
3. Check browser console for exact error messages

### Routes return 404 (SPA routing broken)

Verify `project/vercel.json` exists and has the rewrites rule. Vercel should auto-detect this, but you can manually add it in Vercel project settings → **Rewrites**.

### Environment variables not working

1. Make sure variable names start with `VITE_` (required for Vite)
2. Redeploy after adding variables (Vercel should auto-redeploy)
3. Check Vercel build logs to see if variables are being injected

---

## 🎉 Success!

Your frontend is now live on Vercel and connected to your Railway backend!

**Next steps:**
- Set up a custom domain (optional)
- Configure n8n webhooks to use your Railway backend URL
- Test the full flow: Frontend → Backend → n8n → Backend → Frontend

---

## 📚 Related Docs

- `docs/RAILWAY_DEPLOYMENT_GUIDE.md` - Backend deployment
- `docs/ENV_VARIABLES_GUIDE.md` - Environment variable reference
- `docs/QUICK_START_TESTING.md` - Local testing guide
