# 🚀 Migration Implementation Guide: Firebase → Prisma + SQLite + Better Auth

## ✅ What's Been Completed

### Backend Infrastructure ✅
- ✅ Node.js/Express server with TypeScript
- ✅ Prisma ORM with SQLite (production-ready for PostgreSQL)
- ✅ Better Auth for email/password authentication
- ✅ Complete REST API replacing Firebase Cloud Functions
- ✅ All webhook handlers for n8n integration
- ✅ Database schema matching Firestore structure

---

## 📁 Project Structure

```
leadsgen/
├── server/                        # NEW: Node.js backend
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── auth.ts               # Better Auth configuration
│   │   ├── config.ts             # Environment configuration
│   │   ├── prisma.ts             # Prisma client
│   │   ├── index.ts              # Express server entry
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts # Auth middleware
│   │   └── routes/
│   │       ├── search.ts         # Search API (replaces sendToN8n)
│   │       └── webhook.ts        # Webhook API (replaces receiveFromN8n)
│   ├── .env                      # Environment variables (you created this)
│   ├── package.json
│   └── README.md
├── project/                       # Frontend (needs migration)
│   └── src/
│       ├── contexts/
│       │   └── AuthContext.tsx   # Needs update for Better Auth
│       ├── hooks/                # Need update for REST API
│       ├── lib/
│       │   └── firebase.ts       # To be replaced
│       └── services/
│           └── searchService.ts  # Needs update for REST API
└── functions/                     # OLD: Can be deleted after migration
```

---

## 🔧 Backend Setup (Completed)

### 1. Database Migration ✅
The Prisma schema has been created and migrated to SQLite:

```bash
cd server
npx prisma migrate dev --name init
```

**Schema includes:**
- User (with plan and searchCount)
- Session (for Better Auth)
- Account (for Better Auth providers)
- Search (with platforms and status)
- Platform (tracking each social platform)
- Conversation (posts/leads found)

### 2. Environment Variables ✅
You've already created `server/.env` with:
```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="your-secret"
PORT=3001
FRONTEND_ORIGIN="http://localhost:5173"
N8N_WEBHOOK_REDDIT="your-n8n-webhook-url"
N8N_WEBHOOK_LINKEDIN="your-n8n-webhook-url"
N8N_WEBHOOK_TWITTER="your-n8n-webhook-url"
N8N_WEBHOOK_SECRET="your-webhook-secret"
```

### 3. API Endpoints Created ✅

#### Authentication (Better Auth)
- `POST /api/auth/sign-up` - Register with email/password
- `POST /api/auth/sign-in` - Login with email/password
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session

#### Search API
- `POST /api/search` - Create search and trigger n8n (replaces `sendToN8n`)
- `GET /api/search` - Get all searches for user (history)
- `GET /api/search/:id` - Get specific search
- `GET /api/search/:id/conversations` - Get conversations for search
- `DELETE /api/search/:id` - Delete search

#### Webhook API
- `POST /api/webhook/n8n` - Receive results from n8n (replaces `receiveFromN8n`)

---

## 🎯 Frontend Migration Steps

### Phase 1: Update Environment Variables

Create `project/.env.local`:
```env
# NEW: Backend API URL
VITE_API_URL=http://localhost:3001

# OLD: Remove these after migration
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# etc.
```

### Phase 2: Replace Firebase Auth with Better Auth

#### A. Install Better Auth Client
```bash
cd project
npm install better-auth
```

#### B. Create Better Auth Client
Create `project/src/lib/auth-client.ts`:
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
```

#### C. Update AuthContext
Replace `project/src/contexts/AuthContext.tsx`:
```typescript
import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isLoading } = useSession();

  const signInWithEmail = async (email: string, password: string) => {
    await signIn.email({ email, password });
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    await signUp.email({ email, password, name });
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        loading: isLoading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Phase 3: Replace Firestore with REST API

#### A. Create API Client
Create `project/src/lib/api-client.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = {
  // Search endpoints
  createSearch: async (productUrl: string, platforms: string[]) => {
    const response = await fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ productUrl, platforms }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create search');
    }

    return response.json();
  },

  getSearch: async (searchId: string) => {
    const response = await fetch(`${API_URL}/api/search/${searchId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search');
    }

    return response.json();
  },

  getConversations: async (searchId: string) => {
    const response = await fetch(`${API_URL}/api/search/${searchId}/conversations`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  },

  getSearchHistory: async () => {
    const response = await fetch(`${API_URL}/api/search`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search history');
    }

    return response.json();
  },

  deleteSearch: async (searchId: string) => {
    const response = await fetch(`${API_URL}/api/search/${searchId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete search');
    }

    return response.json();
  },
};
```

#### B. Update Search Service
Replace `project/src/services/searchService.ts`:
```typescript
import { apiClient } from '@/lib/api-client';

export const searchService = {
  createSearch: apiClient.createSearch,
};
```

#### C. Replace Realtime Hooks with Polling

Update `project/src/hooks/useSearch.ts`:
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function useSearch(searchId: string | null) {
  const [search, setSearch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchId) {
      setLoading(false);
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchSearch = async () => {
      try {
        const data = await apiClient.getSearch(searchId);
        setSearch(data);
        setError(null);

        // Stop polling if search is completed or failed
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();

    // Poll every 2 seconds while search is active
    interval = setInterval(fetchSearch, 2000);

    return () => clearInterval(interval);
  }, [searchId]);

  return { search, loading, error };
}
```

Update `project/src/hooks/useConversations.ts`:
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function useConversations(searchId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchId) {
      setLoading(false);
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchConversations = async () => {
      try {
        const data = await apiClient.getConversations(searchId);
        setConversations(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Poll every 3 seconds to get new conversations
    interval = setInterval(fetchConversations, 3000);

    return () => clearInterval(interval);
  }, [searchId]);

  return { conversations, loading, error };
}
```

Update `project/src/hooks/useSearchHistory.ts`:
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export function useSearchHistory() {
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient.getSearchHistory();
        setSearches(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const deleteSearch = async (searchId: string) => {
    await apiClient.deleteSearch(searchId);
    setSearches(searches.filter(s => s.id !== searchId));
  };

  return { searches, loading, error, deleteSearch };
}
```

### Phase 4: Update Main App

Update `project/src/main.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Remove Firebase imports

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Phase 5: Update Auth Modal

Update `project/src/components/auth/AuthModal.tsx` to use email/password instead of Google:
```typescript
// Replace Google sign-in button with:
<form onSubmit={handleEmailSignIn}>
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button type="submit">
    {isSignUp ? 'Sign Up' : 'Sign In'}
  </button>
</form>
```

---

## 🧪 Testing the Migration

### 1. Start Backend
```bash
cd server
npm run dev
```

Should see:
```
✅ Database connected
🚀 Server running on http://localhost:3001
🔐 Auth endpoints: http://localhost:3001/api/auth/*
🔍 Search API: http://localhost:3001/api/search
📥 Webhook API: http://localhost:3001/api/webhook/n8n
```

### 2. Test Auth Endpoints
```bash
# Sign Up
curl -X POST http://localhost:3001/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Sign In
curl -X POST http://localhost:3001/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get Session
curl http://localhost:3001/api/auth/session \
  -b cookies.txt
```

### 3. Test Search API
```bash
# Create Search (requires auth)
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productUrl":"https://example.com","platforms":["REDDIT"]}'
```

### 4. Update n8n Webhook URLs
- Replace Firebase Cloud Function URLs with:
  - Reddit: `http://localhost:3001/api/webhook/n8n`
  - LinkedIn: `http://localhost:3001/api/webhook/n8n`
  - Twitter: `http://localhost:3001/api/webhook/n8n`

- Or use ngrok for testing:
```bash
ngrok http 3001
# Use the ngrok URL: https://abc123.ngrok.io/api/webhook/n8n
```

---

## 🚢 Production Deployment (Railway)

### 1. Switch to PostgreSQL

Update `server/.env` (on Railway):
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
BETTER_AUTH_SECRET="production-secret"
PORT=3001
FRONTEND_ORIGIN="https://your-frontend.com"
N8N_WEBHOOK_REDDIT="https://n8n.yourdomain.com/webhook/reddit"
N8N_WEBHOOK_LINKEDIN="https://n8n.yourdomain.com/webhook/linkedin"
N8N_WEBHOOK_TWITTER="https://n8n.yourdomain.com/webhook/twitter"
N8N_WEBHOOK_SECRET="your-production-secret"
```

### 2. Update Prisma Schema (optional)
```prisma
datasource db {
  provider = "postgresql" // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

### 3. Deploy to Railway
```bash
cd server
npm run build
# Railway will automatically deploy
```

### 4. Run Migrations on Railway
```bash
npx prisma migrate deploy
```

### 5. Update n8n with Production URLs
- Update all n8n webhooks to point to Railway URL
- Example: `https://your-app.railway.app/api/webhook/n8n`

---

## 📋 Migration Checklist

### Backend ✅
- [x] Create Node.js/Express server
- [x] Setup Prisma with SQLite
- [x] Implement Better Auth
- [x] Create search API endpoints
- [x] Create webhook handler
- [x] Test database migrations
- [x] Build successfully

### Frontend (Next Steps)
- [ ] Install Better Auth client
- [ ] Create auth client
- [ ] Update AuthContext
- [ ] Create API client
- [ ] Update search service
- [ ] Replace Firestore hooks with REST + polling
- [ ] Update AuthModal for email/password
- [ ] Remove Firebase SDK
- [ ] Test authentication flow
- [ ] Test search creation
- [ ] Test real-time updates (polling)
- [ ] Update env variables

### Infrastructure
- [ ] Setup ngrok for local testing
- [ ] Update n8n webhook URLs (local)
- [ ] Deploy backend to Railway
- [ ] Add PostgreSQL on Railway
- [ ] Run production migrations
- [ ] Update n8n webhook URLs (production)
- [ ] Test end-to-end flow

---

## 🎓 Key Differences from Firebase

### Authentication
- **Firebase**: Google OAuth only
- **Better Auth**: Email/password (Google can be added later)

### Database
- **Firebase**: Firestore (NoSQL, real-time)
- **New**: Prisma + SQLite/PostgreSQL (SQL, polling for updates)

### Functions
- **Firebase**: Cloud Functions (serverless)
- **New**: Express routes (traditional server)

### Real-time Updates
- **Firebase**: Firestore listeners (true real-time)
- **New**: Polling every 2-3 seconds (good enough for this use case)

---

## 💡 Benefits of New Architecture

1. ✅ **No Vendor Lock-in**: Standard Node.js + PostgreSQL
2. ✅ **Open Source Friendly**: Easy for contributors to set up
3. ✅ **Cost Effective**: Flat Railway pricing vs Firebase per-operation
4. ✅ **Full Control**: You own the entire stack
5. ✅ **Easy to Understand**: Standard REST API
6. ✅ **Production Ready**: Clear path from SQLite → PostgreSQL

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001
```

### Database Locked
```bash
# Delete and recreate
cd server
rm prisma/dev.db
npx prisma migrate dev
```

### Auth Not Working
- Check cookies are enabled
- Verify `FRONTEND_ORIGIN` matches your frontend URL
- Check `credentials: 'include'` in all fetch calls

### Polling Too Slow
- Adjust interval in hooks (currently 2-3 seconds)
- Consider WebSockets for true real-time (future enhancement)

---

## 📚 Next Steps

1. Complete frontend migration (follow Phase 1-5 above)
2. Test locally with ngrok
3. Deploy to Railway
4. Update n8n production webhooks
5. Document for open-source users
6. Optional: Add Google OAuth back via Better Auth

---

**Migration Progress: 50% Complete** 🎉
- ✅ Backend fully implemented and tested
- ⏳ Frontend migration remaining
- ⏳ Production deployment remaining
