# Apply Form Setup — The Futbolist

This document walks you through connecting the `/apply/` form to Google Sheets via a Cloudflare Worker. Takes about 20 minutes.

**Architecture:**
```
/apply/ page  →  POST /apply  →  Cloudflare Worker  →  Apps Script webhook  →  Google Sheet
```

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it **"Futbolist — Season One Applications"**.
3. Leave it blank — the script will write the header row automatically on the first submission.

---

## Step 2 — Set up the Apps Script

1. Inside the Sheet, click **Extensions → Apps Script**.
2. Delete all the default code in the editor.
3. Open the file `apply-sheet.gs` from the Futbolist project folder and **paste all of its contents** into the Apps Script editor.
4. Click **Save** (floppy disk icon or Cmd/Ctrl+S). Name the project **"Futbolist Apply Webhook"**.

**Test it first (optional but recommended):**
- In the editor, select the function `doTest` from the dropdown at the top.
- Click **Run**.
- The first time, Google will ask for permissions — click **Review permissions → Allow**.
- After it runs, go back to your Sheet and confirm a test row appeared.
- Delete the test row before going live.

---

## Step 3 — Deploy the Apps Script as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to **Type** and select **Web app**.
3. Set the following:
   - **Description:** `Futbolist Apply Webhook v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`  ← this is required so the Worker can POST to it
4. Click **Deploy**.
5. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   Keep this URL private. It is your webhook secret.

> **Note:** Every time you edit the Apps Script and want the changes to take effect, you must create a **new deployment** (Deploy → New deployment). Re-deploying doesn't update existing deployments.

---

## Step 4 — Add the URL to your Cloudflare Worker

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → your Worker.
2. Click **Settings → Variables and Secrets**.
3. Add a new **Secret** (not a variable — keeps it out of logs):
   - **Name:** `APPLY_SHEET_URL`
   - **Value:** the Apps Script URL from Step 3
4. Click **Save**.

---

## Step 5 — Deploy the updated Worker

The Worker code in `kit-proxy-worker.js` already has the `/apply` route. You just need to redeploy it.

If you deploy via Wrangler:
```bash
wrangler deploy
```

If you paste manually into the Cloudflare dashboard:
1. Open your Worker → **Edit code**
2. Replace the code with the contents of `kit-proxy-worker.js`
3. Click **Deploy**

---

## Step 6 — Wire up the form

In `/apply/index.html`, find this line near the bottom:

```js
const APPLY_ENDPOINT = '';
```

Replace it with your Worker URL + `/apply` path:

```js
const APPLY_ENDPOINT = 'https://your-worker.your-subdomain.workers.dev/apply';
```

If your Worker already handles the other form (Kit waitlist), use the same Worker base URL — just add `/apply` as the path.

---

## Step 7 — Test the live form

1. Open `https://www.thefutbolist.com/apply/` in your browser.
2. Fill in the form completely and submit.
3. Check your Google Sheet — a new row should appear within a few seconds.
4. Check the Network tab in DevTools to confirm the POST returned `{ "ok": true }`.

---

## Managing applications in the Sheet

The Sheet will have one row per applicant with these columns:

| Column | Contents |
|--------|----------|
| Timestamp | ISO date/time of submission |
| Name | Full name |
| Email | Contact email |
| Location | City, Country |
| Position | Primary position |
| Level | Highest level played |
| Last Club | Most recent club |
| Last Season | e.g. 2024–25 |
| Free Agent? | Yes / Not yet, but soon |
| Can Relocate? | Yes / Need to discuss / No |
| Available From | Text |
| Film Link | URL |
| Extra Link | URL (optional) |
| Why Futbolist? | Short answer |
| Source | Always `apply-form` |

**Tips:**
- Add a **Status** column (shortlisted / rejected / contacted) to track where each applicant stands.
- Use **conditional formatting** to color rows by status.
- Share the Sheet with coaches directly from Google Sheets (File → Share).
- Filter by Position or Level using the dropdown filters (Data → Create a filter).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Form submits but no row appears in Sheet | Check the Apps Script execution log (Apps Script → Executions). Make sure you deployed a **new deployment** after any edits. |
| Worker returns 502 | The Apps Script URL is wrong or the deployment is stale. Redeploy the Apps Script and update `APPLY_SHEET_URL`. |
| "Permission denied" in Apps Script log | Make sure **Who has access** is set to `Anyone` in the deployment. |
| Form shows success but `APPLY_SHEET_URL` isn't set | Worker logs `"APPLY_SHEET_URL not set"` and returns `ok: true` — check Cloudflare Worker secrets. |
