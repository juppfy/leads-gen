# 🚀 Getting Started with Lead Finder

Welcome! This guide will help you set up and run Lead Finder on your local machine.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js** 18+ installed ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)
- A code editor (VS Code recommended)

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Clone or Download the Project
```bash
git clone [your-repo-url]
cd leadsgen
```

Or download and extract the ZIP file.

---

### Step 2: Backend Setup

#### 2.1 Install Dependencies
```bash
cd server
npm install --legacy-peer-deps
```

#### 2.2 Configure Environment Variables
```bash
# Copy the example file
cp env.example .env

# Edit .env with your favorite editor
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Minimum required configuration:**
```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="generate-random-string-here"
PORT=3001
FRONTEND_ORIGIN="http://localhost:5173"
N8N_WEBHOOK_REDDIT="your-n8n-webhook-url"
N8N_WEBHOOK_SECRET="your-shared-secret"
```

**Generate a secure secret:**
```bash
# On Mac/Linux/Git Bash
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 2.3 Initialize Database
```bash
npx prisma migrate dev --name init
```

You should see:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

#### 2.4 Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Database connected
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
🔐 Auth endpoints: http://localhost:3001/api/auth/*
🔍 Search API: http://localhost:3001/api/search
📥 Webhook API: http://localhost:3001/api/webhook/n8n
```

✅ **Backend is running!** Keep this terminal open.

---

### Step 3: Frontend Setup

Open a **new terminal** (keep backend running).

#### 3.1 Install Dependencies
```bash
cd project
npm install
```

#### 3.2 Configure Environment Variables
```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local
# Windows: notepad .env.local
# Mac/Linux: nano .env.local
```

**Add this single line:**
```env
VITE_API_URL=http://localhost:3001
```

#### 3.3 Start Frontend Server
```bash
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

✅ **Frontend is running!** Keep this terminal open.

---

### Step 4: Open in Browser

Navigate to: **http://localhost:5173**

You should see the Lead Finder landing page! 🎉

---

## 🔍 Verify Everything Works

### Test 1: Backend Health Check

Open a new terminal:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-21T..."
}
```

### Test 2: Create a Test Account

1. Open http://localhost:5173 in your browser
2. Click "Sign Up" or "Get Started"
3. Enter email and password
4. You should be logged in!

### Test 3: Check Database

View your database in Prisma Studio:
```bash
cd server
npx prisma studio
```

Opens at: http://localhost:5555
- You should see your user in the `User` table

---

## 📂 Project Structure

```
leadsgen/
├── server/                 # Backend (Node.js + Express)
│   ├── prisma/            # Database schema & migrations
│   ├── src/               # Backend source code
│   ├── .env               # Backend environment (YOU CREATE THIS)
│   └── package.json       # Backend dependencies
│
├── project/               # Frontend (React + Vite)
│   ├── src/              # Frontend source code
│   ├── .env.local        # Frontend environment (YOU CREATE THIS)
│   └── package.json      # Frontend dependencies
│
├── ROADMAP.md            # Product roadmap
├── GETTING_STARTED.md    # This file!
└── README.md             # Project overview
```

---

## 🎮 Regular Usage (After Initial Setup)

Once everything is set up, starting the app is simple:

### Terminal 1: Start Backend
```bash
cd server
npm run dev
```

### Terminal 2: Start Frontend
```bash
cd project
npm run dev
```

### Open Browser
Navigate to: http://localhost:5173

**That's it!** Both servers will auto-reload when you make changes.

---

## 🛑 Stopping the Application

In each terminal, press: **`Ctrl + C`**

---

## 🔧 Common Commands

### Backend Commands
```bash
cd server

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client (after schema changes)
npx prisma generate
```

### Frontend Commands
```bash
cd project

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🐛 Troubleshooting

### Problem: "Port already in use"

**Solution:**
```bash
# Kill backend port (3001)
npx kill-port 3001

# Kill frontend port (5173)
npx kill-port 5173

# Then restart servers
```

### Problem: "Module not found" errors

**Solution:**
```bash
# Backend
cd server
rm -rf node_modules
npm install --legacy-peer-deps

# Frontend
cd project
rm -rf node_modules
npm install
```

### Problem: "Database is locked"

**Solution:**
```bash
cd server
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Problem: CORS errors in browser

**Solution:**
1. Check `server/.env` has `FRONTEND_ORIGIN="http://localhost:5173"`
2. Restart backend server
3. Refresh browser

### Problem: "Cannot connect to database"

**Solution:**
```bash
cd server

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Recreate database
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Problem: Backend won't start

**Check:**
1. Port 3001 is not in use
2. `.env` file exists in `server/` folder
3. All required env vars are set
4. Dependencies are installed

**Debug:**
```bash
cd server
npm run build  # Check for TypeScript errors
```

### Problem: Frontend shows blank page

**Check:**
1. Backend is running on port 3001
2. `.env.local` file exists in `project/` folder
3. `VITE_API_URL` is set to `http://localhost:3001`

**Debug:**
- Open browser console (F12) and check for errors

---

## 🔐 Security Notes

### Development
- `.env` files are in `.gitignore` (never commit them!)
- Use different secrets for dev vs production
- SQLite database is fine for development

### Production
- Use PostgreSQL instead of SQLite
- Use strong, random secrets (32+ characters)
- Set `NODE_ENV=production`
- Enable HTTPS
- See deployment guides for Railway/Heroku

---

## 📚 Next Steps

Now that you're up and running:

1. **Configure n8n** - Set up your workflow automation
   - See: `N8N_UPDATED_FORMAT_GUIDE.md`

2. **Read the Roadmap** - See what's coming
   - See: `ROADMAP.md`

3. **Understand the Architecture** - Learn how it works
   - See: `MIGRATION_PLAN_ANALYSIS.md`

4. **Deploy to Production** - When ready
   - See: `MIGRATION_IMPLEMENTATION_GUIDE.md` (Production Deployment section)

---

## 🆘 Getting Help

### Check Documentation
- `GETTING_STARTED.md` - This file
- `README.md` - Project overview
- `ROADMAP.md` - Future features
- `ENV_VARIABLES_GUIDE.md` - Environment setup
- `MIGRATION_IMPLEMENTATION_GUIDE.md` - Advanced topics

### Common Issues
- Most problems are solved by checking `.env` files
- Make sure both backend and frontend are running
- Check browser console for frontend errors
- Check terminal for backend errors

### Still Stuck?
- Open an issue on GitHub
- Check existing issues for solutions
- Join our community discussions

---

## ✅ Success Checklist

- [ ] Node.js 18+ installed
- [ ] Project downloaded/cloned
- [ ] Backend dependencies installed
- [ ] Backend `.env` file created and configured
- [ ] Database migrated successfully
- [ ] Backend running on port 3001
- [ ] Frontend dependencies installed
- [ ] Frontend `.env.local` file created
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173 in browser
- [ ] Can create an account and sign in
- [ ] Backend health check returns OK

If all boxes are checked, you're ready to go! 🎊

---

## 🎯 Quick Reference

### Start Application
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd project && npm run dev

# Browser
Open http://localhost:5173
```

### Stop Application
```bash
# In each terminal
Ctrl + C
```

### View Database
```bash
cd server && npx prisma studio
# Opens http://localhost:5555
```

### Reset Database
```bash
cd server
rm prisma/dev.db
npx prisma migrate dev --name init
```

---

**Welcome to Lead Finder!** 🚀

Happy lead hunting! If you build something cool with this, let us know! ⭐

---

*Last updated: January 21, 2026*
*For the latest updates, check the GitHub repository*
