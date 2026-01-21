# ✅ READY! Updated Format for Your n8n → Leads Finder Backend Workflow

## 🎉 Express + Prisma Backend is Ready!

Your Express backend (with Prisma + SQLite/Postgres) now supports the **exact format** from your real n8n workflow.

---

## ✅ Important URL Rule (ngrok / Railway)

In your n8n workflow, store **only the base server URL** in your “Set Environment Variables” node:

- ✅ `https://<your-ngrok-subdomain>.ngrok.app`
- ✅ `https://<your-railway-domain>` (or your Railway custom domain)

You **do not** need to include `/api/...` in that environment variable — your n8n HTTP Request nodes already append the correct endpoint path.

---

## 📊 How to Send Data from n8n (per stage)

### Stage 1: Website Analysis (JSON body)

**HTTP Request Node (Stage: `website_analysis`)**

- **Method**: `POST`
- **URL (local dev)**: `http://localhost:3001/api/webhook/n8n`
- **URL (local via ngrok)**: `https://<your-ngrok-subdomain>.ngrok.app/api/webhook/n8n`
- **URL (production e.g. Railway)**: `https://<your-domain>/api/webhook/n8n`
- **Authentication**: Header Auth
  - Name: `x-api-key`
  - Value: your `N8N_WEBHOOK_SECRET` from `server/.env`
- **Body Content Type**: `JSON`
- **JSON Body**:
```json
{
  "searchId": "{{ $('Webhook').item.json.body.searchId }}",
  "stage": "website_analysis",
  "websiteData": [
    {
      "title": "...",
      "cta": "...",
      "website_summary": "...",
      "target_market_analysis": "...",
      "preview_image": "...",
      "favicon": "..."
    }
  ]
}
```

---

### Stage 2: Keywords Generated (JSON body)

**HTTP Request Node (Stage: `keywords_generated`)**

- Same URL + headers as Stage 1
- **Body Content Type**: `JSON`
- **JSON Body**:
```json
{
  "searchId": "{{ $('Webhook').item.json.body.searchId }}",
  "stage": "keywords_generated",
  "keywords": {
    "keyword1": "...",
    "keyword2": "...",
    ... (up to keyword10)
  }
}
```

---

### Stage 3: First Keyword Results ⭐ (form-url-encoded)

From this stage onwards (`conversations_partial1`, `conversations_partial2`, …, `conversations_final`) you will send **form URL encoded** bodies.

**HTTP Request Node (Stage: `conversations_partial1`)**

- **Method**: `POST`
- **URL**: same as above (`/api/webhook/n8n`)
- **Body Content Type**: `Form URL Encoded`
- **Fields** (examples as expressions):
  - `searchId` → `{{ $('Webhook').item.json.body.searchId }}`
  - `stage` → `conversations_partial1`
  - `keyword` → `{{ $('Reddit Posts Keywords Generator').item.json.output.keyword1 }}`
  - `platform` → `reddit` (optional; defaults to `REDDIT` if omitted)
  - `passedPosts` → full posts payload (can be nested form fields or a single JSON string – the backend will handle nested objects when using URL-encoded with `extended: true`).

Conceptually, the payload structure looks like this:
```json
{
  "searchId": "{{ $('Webhook').item.json.body.searchId }}",
  "stage": "conversations_partial1",
  "keyword": "{{ $('Reddit Posts Keywords Generator').item.json.output.keyword1 }}",
  "passedPosts": "{{ $json.passed_post }}"
}
```

**What the backend expects:**
- `stage`: `conversations_partial1` (with a number!)
- `keyword`: The keyword that found these posts
- `passedPosts`: An array containing objects with `passed_post` property

**Your actual data structure (conceptual):**
```json
{
  "searchId": "abc123",
  "stage": "conversations_partial1",
  "keyword": "personalized gifts",
  "passedPosts": [
    {
      "passed_post": [
        {
          "subreddit": "Philippines",
          "title": "Personalized Gift Ideas/Recos",
          "body": "Hello! Could you kindly recommend...",
          "postUrl": "https://www.reddit.com/r/Philippines/comments/...",
          "createdAt": "2025-10-22T04:14:29.000Z",
          "assessment": "relevant"
        },
        {
          "subreddit": "perth",
          "title": "Any uniquely perth/australian gift ideas?",
          "body": "First time posting in this sub...",
          "postUrl": "https://www.reddit.com/r/perth/comments/...",
          "createdAt": "2025-10-22T17:03:19.000Z",
          "assessment": "relevant"
        }
      ]
    }
  ]
}
```

**The backend will:**
1. Extract all posts from `passedPosts[].passed_post`
2. Handle 0-10 posts automatically
3. Save to your Leads Finder database (via Prisma) with the keyword
4. Keep status as "searching"

---

### Stage 4: Second Keyword Results (form-url-encoded)
Configure another HTTP Request node:

- **Body Content Type**: `Form URL Encoded`
- Fields similar to Stage 3, but:
  - `stage` → `conversations_partial2`
  - `keyword` → keyword2 expression

**Same format, but:**
- `stage`: `conversations_partial2` (note the 2!)
- `keyword`: keyword2

---

### Stage 5: Remaining Keywords (3–10) – FINAL (form-url-encoded)

**HTTP Request Node (Stage: `conversations_final`)**

- **Body Content Type**: `Form URL Encoded`
- Fields:
  - `searchId` → same as before
  - `stage` → `conversations_final`
  - `passedPosts` → aggregated remaining posts (same structural pattern as partial stages)

**For the final stage:**
- `stage`: `conversations_final` (this completes the search!)
- Include all remaining posts from keywords 3-10
- You do **not** need to send `keyword` for the final stage (the backend handles it)
- The backend marks the search status as `"complete"`

---

## 🎯 Key Points

### 1. Stage Naming Convention (unchanged)
- ✅ `conversations_partial1` - Keyword 1 results
- ✅ `conversations_partial2` - Keyword 2 results  
- ✅ `conversations_partial3` - Keyword 3 results (if you want)
- ✅ `conversations_final` - Final batch (marks as completed)

The function checks if stage **starts with** `conversations_partial`, so any number works!

### 2. Data Mapping
Your Reddit post fields → database fields:
| Your Field | Saved As |
|------------|----------|
| `subreddit` | `subreddit` |
| `title` | `title` |
| `body` | `excerpt` |
| `postUrl` | `url` |
| `createdAt` | `postedAt` |
| `assessment` | `assessment` |
| keyword param | `keyword` |

### 3. Handling 0 Results
If a keyword has 0 results:
- Send `passedPosts = "no_conversations_found"` (sentinel string), **or** send an empty payload (`passedPosts: []` / `passedPosts: ""`).
- The backend records “no results” for that keyword and continues the pipeline normally.

---

## 📝 Complete n8n Workflow Example (with backend webhook)

```
1. Webhook (receive searchId)
   ↓
2. Analyze Website
   ↓
3. HTTP Request → Stage: website_analysis
   ↓
4. Generate 10 Keywords
   ↓
5. HTTP Request → Stage: keywords_generated
   ↓
6. Search Reddit for Keyword 1
   ↓
7. Filter & Assess Posts (get 0-10 relevant)
   ↓
8. HTTP Request → Stage: conversations_partial1
   - keyword: keyword1
   - passedPosts: [{ passed_post: [...] }]
   ↓
9. Search Reddit for Keyword 2
   ↓
10. Filter & Assess Posts
    ↓
11. HTTP Request → Stage: conversations_partial2
    - keyword: keyword2
    - passedPosts: [{ passed_post: [...] }]
    ↓
12. Search Reddit for Keywords 3-10
    ↓
13. Collect All Posts
    ↓
14. HTTP Request → Stage: conversations_final
    - passedPosts: [{ passed_post: [all remaining posts] }]
```

---

## 🔧 HTTP Request Node Configuration (Backend Webhook)

**Base URL options:**

- **Local dev** (n8n can reach your machine):  
  - `http://localhost:3001/api/webhook/n8n`
- **Local via ngrok** (recommended for cloud n8n):  
  - Start your backend: `npm run dev` in `server/` (port 3001)  
  - In ngrok terminal:  
    ```bash
    ngrok http 3001
    ```  
  - Use: `https://<your-ngrok-subdomain>.ngrok.app/api/webhook/n8n`
- **Production (Railway)**:  
  - `https://<your-railway-domain>/api/webhook/n8n`

**Common settings for all stages:**

- **Method**: `POST`
- **Authentication**: Header Auth
  - Name: `x-api-key`
  - Value: your `N8N_WEBHOOK_SECRET` from `server/.env`
- **Body Type per stage**:
  - `website_analysis`: JSON
  - `keywords_generated`: JSON
  - `conversations_partial1` → `conversations_partialN` → `conversations_final`: Form URL Encoded

---

## ✅ What's Different from the old Firebase Functions setup

| Before (Firebase Function) | Now (Express + Prisma backend) |
|----------------------------|-------------------------------|
| Cloud Function URL (`receiveFromN8n`) | REST endpoint `/api/webhook/n8n` on your Node server |
| Generic `conversations_partial` | Numbered `conversations_partial1`, `conversations_partial2`, etc. |
| `conversations` array directly | `passedPosts` containing `passed_post` arrays |
| No keyword tracking | `keyword` parameter tracks which keyword found each post |
| No assessment field | `assessment` field saved ("relevant") |
| Generic engagement | Handles your exact Reddit data structure |

---

## 🎯 Testing (curl example)

Send this test request with curl (JSON example – you can also test form-url-encoded as needed):

```bash
curl -X POST http://localhost:3001/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your N8N_WEBHOOK_SECRET>" \
  -d '{
    "searchId": "TEST_123",
    "stage": "conversations_partial1",
    "keyword": "test keyword",
    "passedPosts": [{
      "passed_post": [{
        "subreddit": "test",
        "title": "Test Post",
        "body": "This is a test post body",
        "postUrl": "https://reddit.com/test",
        "createdAt": "2025-10-25T10:00:00.000Z",
        "assessment": "relevant"
      }]
    }]
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Conversations received",
  "conversationsCount": 1,
  "stage": "conversations_partial1"
}
```

---

## 🚀 YOU'RE READY!

Your Node/Express server is ready to receive your exact data format from n8n!

**Just configure your n8n HTTP Request nodes with the examples above and you're good to go!** ✨




