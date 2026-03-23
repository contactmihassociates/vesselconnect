# NeoBulk — Vessel Dashboard

Live vessel availability dashboard for bulk carriers. Aggregates vessel data from Email, WhatsApp, and Teams broker messages into a single searchable, filterable interface.

## Features

- **Live vessel list** — sortable/filterable table with all vessels currently in market
- **Real-time updates** — auto-refreshes via Supabase Realtime when new vessels are added by n8n
- **Multi-source** — tracks vessels from Email, WhatsApp, and Teams (colour-coded)
- **Filters** — by vessel type, region, source channel, DWT range, and open date
- **Vessel detail** — click any row for full specs: dimensions, speed, consumption, cargo history
- **Analytics page** — charts for vessel type distribution, regions, source breakdown, DWT histogram
- **CSV export** — download filtered vessel list
- **Demo mode** — works with sample data when Supabase is not configured

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/contactmihassociates/vesselconnect.git
cd vesselconnect
npm install
```

### 2. Configure Supabase

Copy the example env file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Get your credentials from [Supabase Dashboard](https://supabase.com/dashboard) → your project → Settings → API

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Without credentials:** The app runs in Demo Mode with sample vessel data.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Supabase Setup

Run these SQL commands in your Supabase SQL editor to add the required columns and deduplication logic:

```sql
-- Add new columns for multi-source tracking
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'email';
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS source_identifier TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE vessels ADD COLUMN IF NOT EXISTS vessel_type TEXT;

-- Deduplication constraint (prevents same vessel appearing multiple times)
ALTER TABLE vessels ADD CONSTRAINT vessels_unique_entry
  UNIQUE (vessel_name, open_port, open_date);

-- Public read access
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON vessels FOR SELECT USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE vessels;
```

### Fix Duplicate Vessels in n8n

Change the **Vessel Librarian** Supabase node from **Insert** to **Upsert**, with conflict target `vessel_name, open_port, open_date`. This prevents re-inserting the same vessel when emails repeat.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select `vesselconnect`
3. Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables
4. Deploy

## Project Structure

```
app/
  page.tsx                  # Main vessel list with filters
  analytics/page.tsx        # Analytics charts and stats
components/
  vessel-table.tsx          # Sortable data table
  filter-sidebar.tsx        # Type, region, source filters
  vessel-detail-modal.tsx   # Full vessel spec view
  charts.tsx                # Recharts analytics
  stats-cards.tsx           # Summary stat cards
  header.tsx                # NeoBulk branding + nav
  live-indicator.tsx        # Realtime connection status
  export-button.tsx         # CSV download
lib/
  types.ts                  # TypeScript interfaces
  utils.ts                  # Formatters, CSV export, filter logic
  supabase.ts               # Supabase client
  mock-data.ts              # Sample data for demo mode
  hooks/
    use-vessels.ts          # Data fetching + Realtime subscription
    use-filters.ts          # Filter state management
    use-stats.ts            # Analytics aggregation
```

## Upcoming

- WhatsApp message scraping (via n8n WhatsApp Business API node)
- Microsoft Teams scraping (via Microsoft Graph API)
- Bunker price trend analysis
- Voyage costing calculator
