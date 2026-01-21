# Conversations Final Stage - Setup Guide

## Overview
The `conversations_final` stage handles the remaining keywords (3-10) in a single grouped markdown format.

## ✅ Fixed Issue
**Error:** "Value for argument 'seconds' is not a valid integer"

**Cause:** The grouped markdown format uses human-readable dates (`10/15/2024 at 2:30:45 PM`) instead of ISO format, which caused Firestore Timestamp parsing to fail.

**Solution:** Added a flexible date parser (`parseFlexibleDate`) that handles both ISO and human-readable date formats, falling back to server timestamp if parsing fails.

## What Has Been Updated

### 1. **Date Parsing**
- Added `parseFlexibleDate()` function that safely handles multiple date formats
- Applied to all conversation date fields (`postedAt`)
- Automatically falls back to server timestamp on parse errors

### 2. **Conversations Final Processing**
The function now correctly handles the `conversations_final` stage with:
- **Required fields:**
  - `searchId` - The search document ID
  - `stage` - Must be `"conversations_final"`
  - `passedPosts` - Markdown string with grouped format

- **Keyword handling:**
  - Keywords 1-2 are sent separately via `conversations_partial1` and `conversations_partial2`
  - Keywords 3-10 are sent together in `conversations_final`
  - The function retrieves keywords from the search document (already saved from `keywords_generated` stage)

### 3. **Markdown Structure**
The grouped markdown format:
```markdown
# Filtered Conversations

## Product Feedback
### Great user experience with new UI update
**Subreddit:** [r/webdev](https://reddit.com/r/webdev)
**Posted:** 10/15/2024 at 2:30:45 PM
**Discussion:**
The new interface is intuitive and responsive...
[View Full Post](https://reddit.com/r/...)
---

## Bug Reports
### Login endpoint returning 500 error
...
```

### 4. **Data Flow**
1. User submits URL → `POST /api/search` on your backend
2. n8n analyzes website → sends `website_analysis` stage to `/api/webhook/n8n`
3. n8n generates keywords → sends `keywords_generated` stage to `/api/webhook/n8n`
4. n8n finds conversations for keyword 1 → sends `conversations_partial1` stage
5. n8n finds conversations for keyword 2 → sends `conversations_partial2` stage
6. n8n finds conversations for keywords 3-10 → sends `conversations_final` stage (grouped)

## How to Send Data from n8n

### HTTP Request Configuration (Backend Webhook)
1. **Method:** POST
2. **URL (local dev):** `http://localhost:3001/api/webhook/n8n`  
   **URL (ngrok):** `https://<your-ngrok-subdomain>.ngrok.app/api/webhook/n8n`  
   **URL (Railway prod):** `https://<your-railway-domain>/api/webhook/n8n`
3. **Authentication:**
   - Type: Header Auth
   - Name: `x-api-key`
   - Value: your `N8N_WEBHOOK_SECRET` from `server/.env`

### Body Configuration
1. **Content Type:** `application/x-www-form-urlencoded`
2. **Parameters:**
   - `searchId`: `{{ $('Webhook').item.json.output.searchId }}`
   - `stage`: `conversations_final`
   - `passedPosts`: Your grouped markdown string

### Example n8n Setup
```
HTTP Request Node
├─ Method: POST
├─ URL: http://localhost:3001/api/webhook/n8n
├─ Authentication: Header Auth (x-api-key)
└─ Body:
   ├─ searchId = {{ search ID from webhook }}
   ├─ stage = "conversations_final"
   └─ passedPosts = {{ your markdown variable }}
```

## What Happens in the Backend

1. **Receives Data:**
   - Extracts `searchId`, `stage`, and `passedPosts` from form-urlencoded body
   - Validates the search document exists

2. **Parses Markdown:**
   - Detects grouped format by looking for `## ` and `### ` headings
   - Extracts keyword groups and individual conversations
   - Parses each conversation's metadata (title, subreddit, date, body, URL)

3. **Saves to Database (via Prisma):**
   - Creates conversation records linked to the `searchId`
   - Each conversation includes:
     - `platform`: "reddit"
     - `title`: Conversation title
     - `subreddit`: Subreddit name
     - `body`: Discussion content
     - `postUrl`: Reddit URL
     - `keyword`: Extracted from the `## Keyword Group` heading
     - `assessment`: null (not provided in grouped format)
     - `postedAt`: Parsed date (flexible format)
     - `foundAt`: Server timestamp
     - `relevanceScore`: null

4. **Updates Status:**
   - Sets search status to `"complete"`
   - Updates `updatedAt` timestamp

## Testing

### Test the Endpoint
```bash
curl -X POST http://localhost:3001/api/webhook/n8n \
  -H "x-api-key: <your N8N_WEBHOOK_SECRET>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "searchId=YOUR_SEARCH_ID" \
  --data-urlencode "stage=conversations_final" \
  --data-urlencode "passedPosts=# Filtered Conversations

## Test Keyword
### Test Conversation
**Subreddit:** [r/test](https://reddit.com/r/test)
**Posted:** 10/27/2024 at 3:00:00 PM
**Discussion:**
This is a test conversation.
[View Full Post](https://reddit.com/r/test/123)
---"
```

## Expected Response
```json
{
  "success": true,
  "message": "Conversations saved",
  "count": 1
}
```

## Error Handling
- **Invalid searchId:** Returns 404 "Search not found"
- **Missing fields:** Returns 400 "Missing required fields"
- **Invalid auth:** Returns 403 "Unauthorized"
- **Parse errors:** Falls back gracefully (uses server timestamp for dates, skips malformed conversations)

## Summary
✅ Function deployed successfully
✅ Flexible date parsing handles both ISO and human-readable formats
✅ Accepts form-urlencoded data
✅ No need to send keywords separately (retrieved from search document)
✅ Processes grouped markdown format
✅ Maps keyword from `## ` headings to conversation documents

You're ready to test sending `conversations_final` data from n8n! 🚀
