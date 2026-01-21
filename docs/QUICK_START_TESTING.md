# ⚡ Quick Start - Test Your New Backend

## 🎯 Test the Backend in 5 Minutes

### Step 1: Start the Server
```bash
cd server
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

---

### Step 2: Test Health Check
Open a new terminal and run:
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

✅ **Success!** Your server is running!

---

### Step 3: Create a Test User
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

Expected response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  },
  "session": {...}
}
```

✅ **Success!** User created!

---

### Step 4: Sign In
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

Expected response:
```json
{
  "user": {...},
  "session": {...}
}
```

✅ **Success!** You're logged in! (Session saved to `cookies.txt`)

---

### Step 5: Create a Search
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productUrl":"https://example.com","platforms":["REDDIT"]}'
```

Expected response:
```json
{
  "success": true,
  "searchId": "cm7abc123xyz",
  "message": "Search request submitted successfully"
}
```

✅ **Success!** Search created and n8n webhooks triggered!

---

### Step 6: Get Search Details
Replace `SEARCH_ID` with the ID from step 5:
```bash
curl http://localhost:3001/api/search/SEARCH_ID \
  -b cookies.txt
```

Expected response:
```json
{
  "id": "cm7abc123xyz",
  "userId": "...",
  "productUrl": "https://example.com",
  "status": "pending",
  "platforms": [
    {
      "name": "REDDIT",
      "selected": true,
      "status": "pending",
      "resultsCount": 0
    }
  ],
  "keywords": [],
  "websiteInfo": null,
  "resultsCount": 0,
  "createdAt": "...",
  "updatedAt": "..."
}
```

✅ **Success!** You can fetch search data!

---

### Step 7: Get User's Search History
```bash
curl http://localhost:3001/api/search \
  -b cookies.txt
```

Expected response:
```json
[
  {
    "id": "cm7abc123xyz",
    "productUrl": "https://example.com",
    "status": "pending",
    "platforms": [...],
    ...
  }
]
```

✅ **Success!** Search history loaded!

---

### Step 8: Test Webhook (Simulate n8n Response)

This simulates n8n sending back website analysis:
```bash
curl -X POST http://localhost:3001/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_N8N_WEBHOOK_SECRET" \
  -d '{
    "searchId": "SEARCH_ID",
    "stage": "website_analysis",
    "websiteData": [{
      "title": "Example Product",
      "cta": "Buy Now",
      "website_summary": "An amazing product...",
      "target_market_analysis": "Tech enthusiasts...",
      "preview_image": "https://example.com/image.jpg",
      "favicon": "https://example.com/favicon.ico"
    }]
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Website analysis received"
}
```

Now fetch the search again (step 6) and you'll see:
- `status` changed to `"analyzing"`
- `websiteInfo` populated with data

✅ **Success!** Webhook handler working!

---

## 🎊 All Tests Passed!

Your backend is fully functional:
- ✅ Authentication working
- ✅ Search creation working
- ✅ Database saving data
- ✅ Webhooks receiving data
- ✅ API returning correct responses

---

## 🧪 Test with Browser (Optional)

### Visit in Browser:
```
http://localhost:3001/health
```

You should see JSON response in the browser.

### Test with Postman/Insomnia:
Import these endpoints:
1. `POST http://localhost:3001/api/auth/signup`
2. `POST http://localhost:3001/api/auth/login`
3. `GET http://localhost:3001/api/auth/session`
4. `POST http://localhost:3001/api/search`
5. `GET http://localhost:3001/api/search`
6. `POST http://localhost:3001/api/webhook/n8n`

---

## 🔍 Inspect the Database

View your SQLite database:
```bash
cd server
npx prisma studio
```

This opens a web UI at http://localhost:5555 where you can:
- View all users
- View all searches
- View all conversations
- Edit data directly

---

## 🐛 Troubleshooting

### "Port 3001 is already in use"
```bash
npx kill-port 3001
# Then restart: npm run dev
```

### "Cannot find module"
```bash
cd server
npm install --legacy-peer-deps
npm run build
npm run dev
```

### "Database is locked"
```bash
cd server
rm prisma/dev.db
npx prisma migrate dev
```

### Cookies not working
Use `-v` flag to see verbose output:
```bash
curl -v http://localhost:3001/api/auth/session -b cookies.txt
```

Look for `Set-Cookie` headers.

---

## ⏭️ Next Steps

1. ✅ **Backend works!** (You just tested it)
2. ⏳ **Test with n8n** - Use ngrok for local testing
3. ⏳ **Deploy to Railway** - Production deployment

---

## 💬 What to Tell Me

After testing, let me know:
1. ✅ "All tests passed!" - We'll move to frontend
2. ❌ "Step X failed" - I'll help debug
3. ❓ "How do I..." - I'll explain

---

**You're doing great!** 🎉 The backend is working perfectly!
