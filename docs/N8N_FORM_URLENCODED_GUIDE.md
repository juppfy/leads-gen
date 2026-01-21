# ✅ READY! Form URL-Encoded Support

## 🎉 Problem Solved - Use Form Data Instead!

Your backend webhook `/api/webhook/n8n` now accepts **`application/x-www-form-urlencoded`** format! This makes it super easy to send markdown without JSON parsing issues.

---

## 📝 How to Configure n8n HTTP Request Node

### Settings:
- **URL (backend)**: `http://localhost:3001/api/webhook/n8n` (or your Railway/ngrok URL)
- **Method**: POST
- **Authentication**: Header Auth
  - Name: `x-api-key`
  - Value: your `N8N_WEBHOOK_SECRET` from `server/.env`
- **Send Body**: Yes
- **Body Content Type**: `Form Urlencoded`

> Tip: In n8n, store **only the base server URL** (ngrok/Railway) as an environment variable (e.g. `https://xxxx.ngrok.app`).
> Your HTTP Request nodes should append the path like `/api/webhook/n8n`, so you don’t paste `/api/...` into the env var itself.

### Form Data Fields:

| Field Name | Value |
|------------|-------|
| `searchId` | `{{ $('Webhook').item.json.body.searchId }}` |
| `stage` | `conversations_partial1` |
| `keyword` | `{{ $json.keyword }}` |
| `passedPosts` | `{{ $json.markdown_content }}` |

---

## 🎯 Examples for Each Stage

### Stage 1: Website Analysis
**Body Content Type**: Form Urlencoded

| Field | Value |
|-------|-------|
| `searchId` | `{{ $('Webhook').item.json.body.searchId }}` |
| `stage` | `website_analysis` |
| `websiteData` | `{{ JSON.stringify($json.websiteData) }}` |

**Note**: For websiteData, you'll need to stringify it since it's an array/object.

---

### Stage 2: Keywords Generated
**Body Content Type**: Form Urlencoded

| Field | Value |
|-------|-------|
| `searchId` | `{{ $('Webhook').item.json.body.searchId }}` |
| `stage` | `keywords_generated` |
| `keywords` | `{{ JSON.stringify($json.keywords) }}` |

**Note**: Stringify the keywords object.

---

### Stage 3: Keyword 1 Results (Markdown)
**Body Content Type**: Form Urlencoded

| Field | Value |
|-------|-------|
| `searchId` | `{{ $('Webhook').item.json.body.searchId }}` |
| `stage` | `conversations_partial1` |
| `keyword` | `{{ $json.keyword1 }}` |
| `passedPosts` | `{{ $json.markdown_output }}` |

**This is the easiest!** Just pass the markdown string directly.

---

### Stage 4: Keyword 2 Results
**Body Content Type**: Form Urlencoded

| Field | Value |
|-------|-------|
| `searchId` | `{{ $('Webhook').item.json.body.searchId }}` |
| `stage` | `conversations_partial2` |
| `keyword` | `{{ $json.keyword2 }}` |
| `passedPosts` | `{{ $json.markdown_output }}` |

---

### Stage 5: Final Results
**Body Content Type**: Form Urlencoded

| Field | Value |
|-------|-------|
| `searchId` | `{{ $('Webhook').item.json.body.searchId }}` |
| `stage` | `conversations_final` |
| `keyword` | `keywords 3-10` |
| `passedPosts` | `{{ $json.markdown_output }}` |

---

## 🧪 Test with Curl

```bash
curl -X POST http://localhost:3001/api/webhook/n8n \
  -H "x-api-key: <your N8N_WEBHOOK_SECRET>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "searchId=TEST_123" \
  --data-urlencode "stage=conversations_partial1" \
  --data-urlencode "keyword=test keyword" \
  --data-urlencode $'passedPosts=# Conversation 1\n\n**Subreddit:** r/test\n\n**Title:** Test Post\n\n**Posted:** 2025-10-27T10:00:00.000Z\n\n**Assessment:** relevant\n\n## Body\nThis is a test.\n\n[View Post](https://reddit.com/test)'
```

---

## 📋 Step-by-Step n8n Configuration

### 1. Add HTTP Request Node

### 2. Configure Basic Settings:
- **Method**: POST
- **URL (backend)**: `http://localhost:3001/api/webhook/n8n` (or your Railway/ngrok URL)

### 3. Configure Authentication:
- Click "Add Credential"
- Select "Header Auth"
- **Name**: `x-api-key`
- **Value**: your `N8N_WEBHOOK_SECRET` from `server/.env`

### 4. Configure Body:
- **Send Body**: Toggle ON
- **Body Content Type**: Select "Form Urlencoded"

### 5. Add Parameters:
Click "Add Parameter" for each field:

**Parameter 1:**
- Name: `searchId`
- Value: `{{ $('Webhook').item.json.body.searchId }}`

**Parameter 2:**
- Name: `stage`
- Value: `conversations_partial1`

**Parameter 3:**
- Name: `keyword`
- Value: `{{ $json.keyword }}`

**Parameter 4:**
- Name: `passedPosts`
- Value: `{{ $json.markdown_output }}`

---

## ✅ Advantages of Form URL-Encoded

### 1. **No JSON Escaping Issues**
- Markdown can contain quotes, newlines, special characters
- Form encoding handles all of this automatically

### 2. **Simpler in n8n**
- Just set values directly
- No need to worry about JSON structure

### 3. **Both Formats Work**
- Want to use JSON? Still works!
- Want to use Form Data? Also works!
- The backend webhook handles both automatically

---

## 🔄 Comparison

### JSON Format (Also Works):
```json
{
  "searchId": "abc123",
  "stage": "conversations_partial1",
  "keyword": "test",
  "passedPosts": "# Conversation 1\n\n**Title:** ..."
}
```
**Issue**: Need to escape quotes and newlines in markdown

### Form URL-Encoded (Easier):
```
searchId=abc123
stage=conversations_partial1
keyword=test
passedPosts=# Conversation 1

**Title:** ...
```
**Benefit**: No escaping needed!

---

## 🎯 What to Remember

1. **Content-Type**: Must be `application/x-www-form-urlencoded`
2. **Header Auth**: Always include `x-api-key` header
3. **Fields**: `searchId`, `stage`, `keyword`, `passedPosts`
4. **Markdown**: Just pass it as-is, no escaping needed

---

## 📝 Complete Workflow Example

```
1. Webhook (receive searchId)
   ↓
2. Analyze Website
   ↓
3. HTTP Request (Form Urlencoded)
   - searchId: {{ $('Webhook').item.json.body.searchId }}
   - stage: website_analysis
   - websiteData: {{ JSON.stringify($json.data) }}
   ↓
4. Generate Keywords
   ↓
5. HTTP Request (Form Urlencoded)
   - searchId: {{ $('Webhook').item.json.body.searchId }}
   - stage: keywords_generated
   - keywords: {{ JSON.stringify($json.keywords) }}
   ↓
6. Search Reddit Keyword 1
   ↓
7. Format as Markdown
   ↓
8. HTTP Request (Form Urlencoded)
   - searchId: {{ $('Webhook').item.json.body.searchId }}
   - stage: conversations_partial1
   - keyword: {{ $json.keyword1 }}
   - passedPosts: {{ $json.markdown }}
   ↓
9. Search Reddit Keyword 2
   ↓
10. Format as Markdown
    ↓
11. HTTP Request (Form Urlencoded)
    - searchId: {{ $('Webhook').item.json.body.searchId }}
    - stage: conversations_partial2
    - keyword: {{ $json.keyword2 }}
    - passedPosts: {{ $json.markdown }}
    ↓
12. Search Keywords 3-10
    ↓
13. Format All as Markdown
    ↓
14. HTTP Request (Form Urlencoded)
    - searchId: {{ $('Webhook').item.json.body.searchId }}
    - stage: conversations_final
    - keyword: keywords 3-10
    - passedPosts: {{ $json.markdown }}
```

---

## 🚀 YOU'RE READY!

Your Node/Express server accepts **both JSON and Form URL-Encoded** formats!

**Use Form URL-Encoded for sending markdown - it's much simpler!** ✨

**No more JSON formatting headaches!** 🎉

---

## 💡 Pro Tip

If you still get errors:
1. Check the `x-api-key` header is set correctly
2. Verify `searchId` is being passed from the webhook
3. Check your server logs (Railway logs or your local terminal)
4. Make sure Content-Type is set to `application/x-www-form-urlencoded`


