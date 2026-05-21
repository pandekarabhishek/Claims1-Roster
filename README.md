# TeamPulse — Leave & Roster Management System
### Claims1 · PI2 2026

A clean, production-ready frontend for managing team leaves and availability. Single-file, zero dependencies, works straight from GitHub Pages.

---

## Live demo

Once deployed to GitHub Pages, your team accesses it at:
```
https://<your-org>.github.io/<repo-name>/
```

---

## Features

| Screen | What it does |
|---|---|
| **Dashboard** | Today's availability, upcoming leaves, top leave-takers, recently added |
| **Calendar** | Month view with colour-coded leave dots, click any day for detail |
| **Availability** | 21-day heatmap, team breakdown, individual leave grid |
| **All leaves** | Full log — filter by type, month, employee · delete entries |
| **Roster** | Full team table — filter by team, stack, month · shows day-chips per person |

**Log leave modal** — available from every screen via the + Log leave button.

---

## How to deploy to GitHub Pages (5 minutes, no coding)

### Step 1 — Create the repository
1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it `leave-tracker` (or anything you like)
4. Set it to **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2 — Upload the file
1. On the repo page, click **Add file → Upload files**
2. Drag and drop `index.html` from this folder
3. Click **Commit changes**

### Step 3 — Enable GitHub Pages
1. Go to **Settings → Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Branch: **main** · Folder: **/ (root)**
4. Click **Save**

### Step 4 — Done!
GitHub gives you a live URL in ~60 seconds:
```
https://<your-username>.github.io/leave-tracker/
```
Share this link with your team. Anyone with the link can use it.

---

## How data is stored (right now)

All leave entries are saved in **browser localStorage**. This means:
- ✅ Works instantly, no setup
- ✅ Persists across browser sessions on the same device
- ⚠️ Each person's browser holds their own copy (not shared yet)

This is the **Phase 1 frontend** — the DB wiring comes in Phase 2.

---

## Phase 2 — Connecting a shared database

When you're ready to share data across the team, you have three options:

### Option A — SharePoint List (recommended if you're on Microsoft 365)
Replace the `loadDB()` / `saveDB()` functions with Microsoft Graph API calls.
No new accounts needed — everyone logs in with their existing Microsoft credentials.

```js
// Future: replace localStorage with SharePoint List API
const SP_SITE = "https://graph.microsoft.com/v1.0/sites/{site-id}/lists/{list-id}/items";

async function loadDB() {
  const res = await fetch(SP_SITE, { headers: { Authorization: "Bearer "+token } });
  const json = await res.json();
  return json.value.map(item => item.fields); // map to leave objects
}
```

### Option B — Supabase (free, no Microsoft needed)
1. Create a free project at [supabase.com](https://supabase.com)
2. Create a `leaves` table with columns: `id, emp, type, from_date, to_date, note`
3. Replace `loadDB()` / `saveDB()` with Supabase JS client calls
4. Free tier supports 50,000 users — more than enough

### Option C — Google Sheets
Use Google Sheets as a backend via the Sheets API.
Familiar for non-technical users, sharable via existing Google accounts.

---

## Customising team members

Open `index.html` and find the `TEAM` array (~line 250).
Add, remove, or edit entries in this format:

```js
{ name: "Full Name", team: "Team Name", stack: "Dev", sup: "Supervisor Name" }
```

---

## Leave types & colours

| Type | Key | Colour |
|---|---|---|
| Planned leave | `planned` | Red |
| Sick leave | `sick` | Amber |
| Work from home | `wfh` | Blue |
| Public holiday | `holiday` | Purple |
| Personal | `personal` | Orange |

---

## File structure

```
/
└── index.html       ← entire app (HTML + CSS + JS, self-contained)
└── README.md        ← this file
```

No build step. No npm. No frameworks. Just open `index.html` in a browser.

---

## Browser support

Works in all modern browsers: Chrome, Firefox, Safari, Edge.
Mobile responsive (sidebar collapses on small screens — Phase 2 enhancement).

---

*Built for Claims1 · PI2 2026 · TeamPulse v1.0*
