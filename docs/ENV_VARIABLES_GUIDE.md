# 🔐 Environment Variables Guide

## Quick Answer: Where Do Variables Go?

| Variable | Location | Used By | Why? |
|----------|----------|---------|------|
| **n8n Webhook URLs** | `server/.env` | Backend | Backend sends requests to n8n |
| **n8n Webhook Secret** | `server/.env` | Backend | Backend validates n8n responses |
| **Backend API URL** | `project/.env.local` | Frontend | Frontend calls backend API |
| **Better Auth Secret** | `server/.env` | Backend | Server-side auth encryption |
| **Database URL** | `server/.env` | Backend | Database connection |

---

## 📁 server/.env (Backend Environment)

**Purpose**: Configuration for your Node.js backend server

```env
# Database Connection
DATABASE_URL="file:./dev.db"                    # SQLite for dev, PostgreSQL URL for production

# Authentication
BETTER_AUTH_SECRET="your-random-secret-here"    # Generate: openssl rand -base64 32

# App Configuration  
PORT=3001                                       # Backend server port
FRONTEND_ORIGIN="http://localhost:5173"         # Frontend URL (for CORS)

# n8n Integration (Backend sends TO n8n)
N8N_WEBHOOK_REDDIT="https://n8n.yourdomain.com/webhook/reddit-abc123"
N8N_WEBHOOK_LINKEDIN=""                         # Empty for v1.0 (Reddit only)
N8N_WEBHOOK_TWITTER=""                          # Empty for v1.0 (Reddit only)

# n8n Security (Backend validates FROM n8n)
N8N_WEBHOOK_SECRET="your-shared-secret"         # Same secret configured in n8n
```

### Why These Go in Backend?
1. **Security**: Secrets never exposed to browser
2. **Server-to-Server**: Backend communicates with n8n
3. **Validation**: Backend verifies incoming n8n webhooks
4. **Database**: Only backend accesses the database

---

## 📁 project/.env.local (Frontend Environment)

**Purpose**: Configuration for your React frontend app

```env
# Backend API
VITE_API_URL="http://localhost:3001"            # Your backend server URL

# ❌ DO NOT PUT THESE IN FRONTEND:
# - N8N_WEBHOOK_URL (backend needs this, not frontend)
# - N8N_WEBHOOK_SECRET (must stay secret!)
# - DATABASE_URL (frontend doesn't access DB)
# - BETTER_AUTH_SECRET (only backend needs this)
```

### Why Only API URL?
1. **Security**: Frontend code is visible in browser
2. **Architecture**: Frontend → Backend → n8n (not Frontend → n8n)
3. **Simplicity**: One variable is all you need!

---

## 🔄 Data Flow

### Search Creation Flow
```
User submits URL in browser
    ↓
Frontend (React)
    ↓ HTTP POST to VITE_API_URL/api/search
    ↓
Backend (Express) - reads server/.env
    ↓ Uses N8N_WEBHOOK_REDDIT
    ↓
n8n workflow starts
```

### Results Return Flow
```
n8n completes analysis
    ↓ HTTP POST with X-API-Key header
    ↓
Backend /api/webhook/n8n - validates N8N_WEBHOOK_SECRET
    ↓ Saves to database
    ↓
Frontend polls API - reads from VITE_API_URL
    ↓
User sees results
```

---

## 🚫 What You NO LONGER Need (Firebase Removed)

### ❌ Remove from project/.env.local:
```env
# DELETE THESE - No longer needed after Firebase migration
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_N8N_WEBHOOK_SECRET=...               # Now in server/.env
VITE_N8N_WEBHOOK_URL=...                  # Now in server/.env as N8N_WEBHOOK_REDDIT
```

### Why Remove?
1. No longer using Firebase Auth (using Better Auth)
2. No longer using Firestore (using Prisma + SQLite/PostgreSQL)
3. No longer calling n8n from frontend (backend handles it)

---

## 📝 Complete Setup Guide

### Step 1: Backend Environment (`server/.env`)

Create `server/.env`:
```bash
cd server
cp env.example .env
```

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"  # Generate random secret
PORT=3001
FRONTEND_ORIGIN="http://localhost:5173"
N8N_WEBHOOK_REDDIT="https://n8n.yourdomain.com/webhook/your-webhook-id"
N8N_WEBHOOK_LINKEDIN=""
N8N_WEBHOOK_TWITTER=""
N8N_WEBHOOK_SECRET="your-shared-secret-with-n8n"
```

### Step 2: Frontend Environment (`project/.env.local`)

Create `project/.env.local`:
```env
VITE_API_URL=http://localhost:3001
```

That's it! Just one line! 🎉

### Step 3: n8n Configuration

In your n8n workflow:

1. **Incoming Webhook (receives from backend)**
   - URL: `https://n8n.yourdomain.com/webhook/your-webhook-id`
   - Copy this URL to `N8N_WEBHOOK_REDDIT` in `server/.env`

2. **HTTP Request Node (sends back to backend)**
   - URL: `http://localhost:3001/api/webhook/n8n` (dev) or `https://your-app.railway.app/api/webhook/n8n` (prod)
   - Method: POST
   - Headers: 
     - `Content-Type: application/json`
     - `X-API-Key: your-shared-secret`
   - Make sure `X-API-Key` matches `N8N_WEBHOOK_SECRET` in `server/.env`

---

## 🚀 Production (Railway)

### Backend on Railway (`server/.env` on Railway)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"  # Railway PostgreSQL
BETTER_AUTH_SECRET="production-secret-here"
PORT=3001
FRONTEND_ORIGIN="https://yourfrontend.vercel.app"
N8N_WEBHOOK_REDDIT="https://n8n.yourdomain.com/webhook/production"
N8N_WEBHOOK_LINKEDIN=""
N8N_WEBHOOK_TWITTER=""
N8N_WEBHOOK_SECRET="production-shared-secret"
```

### Frontend on Vercel (`project/.env.local` → Vercel env vars)
```env
VITE_API_URL=https://your-backend.railway.app
```

### n8n Production
- Update HTTP Request node URL to: `https://your-backend.railway.app/api/webhook/n8n`
- Keep same `X-API-Key` header value

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep secrets in `server/.env` (never commit to git)
- Use `.gitignore` to exclude `.env` files
- Generate strong random secrets: `openssl rand -base64 32`
- Use different secrets for dev vs production
- Rotate secrets periodically

### ❌ DON'T:
- Put backend secrets in frontend (visible in browser!)
- Commit `.env` files to git
- Share secrets in public channels
- Reuse the same secret across services
- Use simple/guessable secrets

---

## 🧪 Testing Your Setup

### Test Backend Has Correct Variables
```bash
cd server
npm run dev
```

Look for startup logs showing:
```
✅ Database connected
🚀 Server running on http://localhost:3001
```

### Test Frontend Can Reach Backend
```bash
cd project
npm run dev
```

Open browser console and check:
```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
// Should see: {status: "ok", timestamp: "..."}
```

### Test n8n → Backend Connection
From n8n, trigger a test webhook to:
```
http://localhost:3001/api/webhook/n8n
```

With headers:
```
Content-Type: application/json
X-API-Key: your-secret
```

Check backend logs for successful validation.

---

## ❓ FAQ

### Q: Why can't frontend call n8n directly?
**A:** Security! If frontend had the n8n URL, anyone could inspect your code and spam your workflows. Backend acts as a secure gateway.

### Q: What if I'm using ngrok for local testing?
**A:** 
- Backend still uses `localhost:3001` 
- n8n HTTP Request node uses ngrok URL: `https://abc123.ngrok.io/api/webhook/n8n`
- Frontend still uses `http://localhost:3001` (or ngrok URL if you want)

### Q: Can I use the same secret for everything?
**A:** No! Use different secrets for:
- `BETTER_AUTH_SECRET` (auth encryption)
- `N8N_WEBHOOK_SECRET` (n8n validation)
- Production vs development

### Q: Where do I find my Railway PostgreSQL URL?
**A:** Railway dashboard → Your project → PostgreSQL → Connect → Copy `DATABASE_URL`

### Q: Do I need all three n8n webhook URLs?
**A:** For v1.0 (Reddit only), you only need `N8N_WEBHOOK_REDDIT`. Leave LinkedIn and Twitter empty.

---

## 📋 Checklist

### Backend Setup ✅
- [ ] `server/.env` created
- [ ] `DATABASE_URL` set (SQLite or PostgreSQL)
- [ ] `BETTER_AUTH_SECRET` generated (random 32+ chars)
- [ ] `N8N_WEBHOOK_REDDIT` set (your n8n webhook URL)
- [ ] `N8N_WEBHOOK_SECRET` set (matches n8n X-API-Key)
- [ ] `FRONTEND_ORIGIN` set (your frontend URL)
- [ ] Backend starts without errors (`npm run dev`)

### Frontend Setup ✅
- [ ] `project/.env.local` created  
- [ ] `VITE_API_URL` set to backend URL
- [ ] Old Firebase variables removed
- [ ] Frontend can reach backend health check

### n8n Setup ✅
- [ ] Incoming webhook created (receives from backend)
- [ ] HTTP Request node points to backend webhook endpoint
- [ ] `X-API-Key` header matches `N8N_WEBHOOK_SECRET`
- [ ] Test webhook returns success

---

**Remember**: Backend handles all secrets and external API calls. Frontend only needs to know where the backend is! 🎯
