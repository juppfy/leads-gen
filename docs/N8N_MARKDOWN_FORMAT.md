# ✅ READY! Markdown Format Support

## 🎉 Backend Webhook Updated - Now Accepts Markdown!

Your backend webhook `/api/webhook/n8n` now supports **markdown format** for `passedPosts`! This solves your JSON parsing issues.

---

## 📝 How to Send from n8n

### Simple Format:
```json
{
  "searchId": "{{ $('Webhook').item.json.body.searchId }}",
  "stage": "conversations_partial1",
  "keyword": "{{ $('Reddit Posts Keywords Generator').item.json.output.keyword1 }}",
  "passedPosts": "{{ $json.markdown_content }}"
}
```

**That's it!** Just send the markdown as a string in `passedPosts`.

---

## 📄 Markdown Structure (Your Format)

```markdown
# Conversation 1

**Subreddit:** r/subreddit_name

**Title:** Post title here

**Posted:** 2025-10-26T20:32:19.000Z

**Assessment:** relevant

## Body
The full body text of the post goes here.
It can be multiple lines.

[View Post](https://www.reddit.com/r/subreddit/comments/xyz)

---

# Conversation 2

**Subreddit:** r/another_subreddit

**Title:** Another post title

**Posted:** 2025-10-27T03:42:24.000Z

**Assessment:** relevant

## Body
Another post body text here.

[View Post](https://www.reddit.com/r/another/comments/abc)

---
```

---

## 🔍 What the Function Extracts

From your markdown, the function automatically extracts:

| Markdown Field | Maps To | Database Field |
|----------------|---------|-----------------|
| **Subreddit:** r/name | `subreddit` | `subreddit` |
| **Title:** ... | `title` | `title` |
| **Posted:** ISO date | `createdAt` | `postedAt` |
| **Assessment:** ... | `assessment` | `assessment` |
| ## Body ... | `body` | `excerpt` |
| [View Post](url) | `postUrl` | `url` |
| (from params) | - | `keyword` |
| - | - | `platform: "reddit"` |

---

## 🎯 Examples for Each Stage

### Stage 1: Website Analysis
```json
{
  "searchId": "abc123",
  "stage": "website_analysis",
  "websiteData": [...]
}
```

### Stage 2: Keywords Generated
```json
{
  "searchId": "abc123",
  "stage": "keywords_generated",
  "keywords": {...}
}
```

### Stage 3: Keyword 1 Results (Markdown!)
```json
{
  "searchId": "abc123",
  "stage": "conversations_partial1",
  "keyword": "personalized gifts",
  "passedPosts": "# Conversation 1\n\n**Subreddit:** r/gifts\n\n**Title:** Gift ideas needed\n\n**Posted:** 2025-10-26T10:00:00.000Z\n\n**Assessment:** relevant\n\n## Body\nLooking for gift ideas...\n\n[View Post](https://reddit.com/r/gifts/xyz)\n\n---\n\n# Conversation 2\n..."
}
```

### Stage 4: Keyword 2 Results (Markdown!)
```json
{
  "searchId": "abc123",
  "stage": "conversations_partial2",
  "keyword": "anniversary gifts",
  "passedPosts": "# Conversation 1\n\n**Subreddit:** r/relationships\n..."
}
```

### Stage 5: Final Results (Markdown!)
```json
{
  "searchId": "abc123",
  "stage": "conversations_final",
  "keyword": "keywords 3-10",
  "passedPosts": "# Conversation 1\n\n**Subreddit:** r/...\n..."
}
```

---

## ✅ What Works

The function now handles:

1. **Markdown String** ✅ (NEW!)
   - Send `passedPosts` as a markdown string
   - Function automatically parses it
   - Extracts all fields

2. **Array Format** ✅ (Legacy - still works)
   - Old format with `[{ passed_post: [...] }]`
   - Still supported for backward compatibility

3. **0 Results** ✅
   - Send empty string: `"passedPosts": ""`
   - Function handles gracefully

---

## 🧪 Test Curl Command

```bash
curl -X POST http://localhost:3001/api/webhook/n8n \
  -H "Content-Type: application/json" \
  -H "x-api-key: <your N8N_WEBHOOK_SECRET>" \
  -d '{
    "searchId": "TEST_MD_123",
    "stage": "conversations_partial1",
    "keyword": "test keyword",
    "passedPosts": "# Conversation 1\n\n**Subreddit:** r/test\n\n**Title:** Test Post\n\n**Posted:** 2025-10-27T10:00:00.000Z\n\n**Assessment:** relevant\n\n## Body\nThis is a test post body.\n\n[View Post](https://reddit.com/r/test/123)\n\n---"
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

## 📋 n8n HTTP Request Configuration

**For each keyword result:**

- **URL (backend)**: `http://localhost:3001/api/webhook/n8n` (or your Railway/ngrok URL)
- **Method**: POST
- **Authentication**: Header Auth
  - Name: `x-api-key`
  - Value: your `N8N_WEBHOOK_SECRET` from `server/.env`

**Body:**
```json
{
  "searchId": "{{ $('Webhook').item.json.body.searchId }}",
  "stage": "conversations_partial1",
  "keyword": "{{ $json.keyword }}",
  "passedPosts": "{{ $json.markdown_output }}"
}
```

---

## 🎯 Important Notes

### Markdown Must Include:
- `# Conversation N` headers (for splitting)
- `**Title:**` line (required)
- `[View Post](url)` link (required)
- Other fields are optional but recommended

### Fields Are Flexible:
- Missing **Subreddit:** → saves as null
- Missing **Assessment:** → saves as null
- Missing **Body** → saves empty excerpt
- Missing **Posted:** → uses server timestamp

### Separators:
- Use `---` between conversations (optional, just for readability)
- Function splits by `# Conversation N` pattern

---

## 🚀 YOU'RE READY!

Your Node/Express server is ready to parse markdown format!

**Just send your markdown string in the `passedPosts` field and the function will handle everything!** ✨

---

## 🔄 Migration Path

If you were using the old JSON array format, **don't worry** - both formats work!

**Old format (still works):**
```json
{
  "passedPosts": [
    {
      "passed_post": [
        { "title": "...", "postUrl": "..." }
      ]
    }
  ]
}
```

**New format (recommended):**
```json
{
  "passedPosts": "# Conversation 1\n\n**Title:** ...\n..."
}
```

The function automatically detects which format you're using!


