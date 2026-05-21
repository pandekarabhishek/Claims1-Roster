# TeamPulse — Leave & Roster Management
### Claims1 · PI2 2026 · React + Vite + Supabase

A production-grade React SPA for managing team leaves and availability. Auto-deploys to GitHub Pages on every push.

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres + real-time) |
| Hosting | GitHub Pages |
| Icons | Lucide React |
| Charts | Recharts |
| Date utils | date-fns |

---

## Project structure

```
src/
├── components/
│   ├── UI.jsx            # Shared primitives (Avatar, Badge, DayChip…)
│   ├── Sidebar.jsx       # Navigation sidebar
│   ├── LogLeaveModal.jsx # Add leave modal
│   ├── Dashboard.jsx     # Overview screen
│   ├── Calendar.jsx      # Month calendar
│   ├── Availability.jsx  # Heatmap + individual table
│   ├── AllLeaves.jsx     # Leave log with filters
│   └── Roster.jsx        # Full team roster
├── hooks/
│   ├── useLeaves.js      # Data layer (Supabase + localStorage fallback)
│   └── useToast.jsx      # Toast notifications
├── data/
│   └── team.js           # Team roster + seed data
├── utils.js              # Date helpers
├── supabase.js           # Supabase client
├── App.jsx               # Root layout + routing
└── main.jsx              # Entry point
```

---

## Step 1 — Supabase setup (15 min)

### 1.1 Create project
1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a name, set a database password, pick **Singapore** region (closest to India)
3. Wait ~2 min for project to spin up

### 1.2 Create the database table
Go to **SQL Editor** in your Supabase dashboard and run this:

```sql
-- Create leaves table
CREATE TABLE leaves (
  id          TEXT PRIMARY KEY,
  emp         TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('planned','sick','wfh','holiday','personal')),
  from_date   DATE NOT NULL,
  to_date     DATE NOT NULL,
  note        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER TABLE leaves REPLICA IDENTITY FULL;

-- Allow public read/write (adjust for auth later)
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON leaves FOR ALL USING (true) WITH CHECK (true);
```

### 1.3 Get your credentials
Go to **Settings → API** and copy:
- **Project URL** — looks like `https://abcxyz.supabase.co`
- **anon public key** — long string starting with `eyJ…`

---

## Step 2 — Local development

```bash
# Clone the repo
git clone https://github.com/pandekarabhishek/Claims1-Roster.git
cd Claims1-Roster

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and paste your Supabase URL and anon key

# Run locally
npm run dev
# → Opens at http://localhost:5173/Claims1-Roster/
```

---

## Step 3 — Deploy to GitHub Pages

### 3.1 Add Supabase secrets to GitHub
1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Add two secrets:
   - `VITE_SUPABASE_URL` → your Project URL
   - `VITE_SUPABASE_ANON` → your anon public key

### 3.2 Enable GitHub Pages
1. Repo → **Settings → Pages**
2. Source: **GitHub Actions**

### 3.3 Push and deploy
```bash
git add .
git commit -m "feat: add Supabase integration"
git push origin main
```

GitHub Actions will build and deploy automatically. Your app will be live at:
```
https://pandekarabhishek.github.io/Claims1-Roster/
```

---

## Without Supabase (localStorage mode)

If `VITE_SUPABASE_URL` is not set, the app runs entirely in the browser using localStorage. Data is private to each browser session. Good for testing — not for shared team use.

---

## Features

| Screen | Features |
|---|---|
| **Dashboard** | Stats cards, today's availability strip, upcoming leaves, top leave-takers, 14-day heatmap |
| **Calendar** | Month view, colour-coded dots by leave type, click-to-inspect day panel, filter by person or type |
| **Availability** | 21-day absence heatmap, team-level breakdown, individual leave grid with day chips |
| **All leaves** | Full log, search + filter by type/month/sort, delete with confirmation |
| **Roster** | Full team table, filter by team/stack/month, leave day chips, total day counter |

---

## Customising

### Add/edit team members
Open `src/data/team.js` and edit the `TEAM` array:
```js
{ name: 'Full Name', team: 'Team Name', stack: 'Dev', sup: 'Supervisor Name' }
```

### Change the Supabase project
Update `.env` (local) and GitHub Secrets (production).

---

*TeamPulse v2.0 · React · Claims1 PI2 2026*
