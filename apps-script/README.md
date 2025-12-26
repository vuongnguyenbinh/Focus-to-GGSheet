# Google Apps Script Backend Setup

Backend API for Focus Extension using Google Sheets as storage.

## Quick Setup

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Focus Extension Data" (or your preferred name)

### Step 2: Set Up Apps Script

1. In your spreadsheet, go to **Extensions → Apps Script**
2. Delete any existing code in `Code.gs`
3. Copy ALL contents from `Code.gs` in this folder
4. Paste into the Apps Script editor

### Step 3: Configure Secret Key

1. In the Apps Script code, find line 16:
   ```javascript
   SECRET: 'CHANGE_THIS_SECRET_KEY_123',
   ```
2. Change it to a secure random string (e.g., `'my-secure-key-abc123xyz'`)
3. **Save** the file (Ctrl+S or Cmd+S)

### Step 4: Initialize Sheets

1. In Apps Script editor, select function `initializeSheets` from dropdown
2. Click **Run**
3. Grant permissions when prompted (first time only)
4. Check your spreadsheet - "Items" and "Prompts" tabs should appear

### Step 5: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon, select **Web app**
3. Configure:
   - **Description**: "Focus Extension API v1"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Web app URL** (looks like `https://script.google.com/macros/s/ABC.../exec`)

### Step 6: Test the API

Open in browser:
```
{YOUR_WEB_APP_URL}?secret={YOUR_SECRET}&action=test
```

Expected response:
```json
{
  "success": true,
  "data": {
    "ok": true,
    "version": "1.0.0",
    "timestamp": "2024-...",
    "sheets": { "items": true, "prompts": true }
  }
}
```

### Step 7: Configure Extension

1. Open the Focus Extension sidebar
2. Go to Settings
3. Enter:
   - **Apps Script URL**: Your web app URL
   - **Secret Key**: The secret you configured
4. Click **Test** → should show "Connected"
5. Click **Save**

---

## Sheet Schema

### Items Sheet

| Column | Description | Example |
|--------|-------------|---------|
| ID | UUID | `abc123-...` |
| Type | task/bookmark/note | `task` |
| Title | Item title | `Buy groceries` |
| Content | Description/notes | `Milk, eggs, bread` |
| URL | Bookmark URL | `https://...` |
| Priority | high/medium/low | `high` |
| Deadline | YYYY-MM-DD | `2024-12-31` |
| Completed | TRUE/FALSE | `FALSE` |
| Tags | Comma-separated | `work,urgent` |
| Category | Category name | `Personal` |
| Project | Project name | `Home` |
| UpdatedAt | ISO timestamp | `2024-12-27T...` |

### Prompts Sheet

| Column | Description | Example |
|--------|-------------|---------|
| ID | UUID | `def456-...` |
| Title | Prompt name | `SEO Article` |
| Description | Short description | `Generate SEO...` |
| Prompt | Full prompt text | `Write an article...` |
| Type | text/image/video | `text` |
| Category | Category name | `Marketing` |
| Tags | Comma-separated | `seo,content` |
| Note | Additional notes | `Works best with...` |
| Approved | TRUE/FALSE | `TRUE` |
| Favorite | TRUE/FALSE | `FALSE` |
| Quality | 1-5 | `4` |
| TextDemo | Demo output | `Sample text...` |
| URLDemo | Demo URL | `https://...` |
| UpdatedAt | ISO timestamp | `2024-12-27T...` |

---

## API Reference

### GET Endpoints

| Action | Description |
|--------|-------------|
| `?action=test` | Test connection |
| `?action=getItems` | Get all items |
| `?action=getItems&since=1703...` | Get items updated since timestamp |
| `?action=getPrompts` | Get all prompts |
| `?action=getPrompts&since=1703...` | Get prompts updated since timestamp |

### POST Endpoints

Send JSON body with `action` field:

```javascript
// Create item
{ "action": "createItem", "data": { "ID": "...", "Title": "...", ... } }

// Update item
{ "action": "updateItem", "data": { "ID": "...", "Title": "...", ... } }

// Delete item
{ "action": "deleteItem", "id": "..." }

// Same for prompts: createPrompt, updatePrompt, deletePrompt

// Batch operations
{ "action": "batch", "operations": [ ... ] }
```

---

## Troubleshooting

### "Unauthorized" error
- Check that your secret matches in both Apps Script and extension settings

### "Sheet not found" error
- Run `initializeSheets` function in Apps Script editor

### CORS errors
- This is normal for web apps; the extension handles this via background script

### Changes not syncing
- Check the Apps Script execution logs: **View → Executions**
- Verify the spreadsheet has correct data

### Permission denied
- Re-deploy the web app after any code changes
- Make sure "Who has access" is set to "Anyone"

---

## Security Notes

1. **Keep your secret private** - Don't share it or commit it to public repos
2. **Sheet is private by default** - Only you can see the data
3. **Apps Script runs as you** - All operations use your Google account
4. **HTTPS only** - All communication is encrypted
