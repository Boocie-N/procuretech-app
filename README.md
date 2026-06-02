# ProcureTech+ — AI Procurement OS

> AI-powered procurement and tender management platform for the South African market.
> CIPS cycle · PPPFA 2017 · BBBEE · Blockchain audit trail · Claude AI

---

## Quick Start (Local)

```bash
cd procuretech-app
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open http://localhost:3000

---

## Adding Your Anthropic API Key

1. Open `.env.local`
2. Set: `ANTHROPIC_API_KEY=sk-ant-your-key-here`
3. Restart the dev server (`Ctrl+C` then `npm run dev`)

The key is used server-side only — it never reaches the browser.

---

## Multi-Device Deployment (Public URL, All Free)

### Step 1 — GitHub

```bash
git init
git add .
git commit -m "Initial ProcureTech+ commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/procuretech-app.git
git push -u origin main
```

### Step 2 — Vercel (free hosting)

1. Go to vercel.com → New Project → Import GitHub repo
2. Add environment variable: `ANTHROPIC_API_KEY = sk-ant-...`
3. Deploy → get URL like `procuretech.vercel.app`

Auto-redeploys on every `git push`.

### Step 3 — Supabase (shared database — optional but recommended)

Without Supabase each browser uses its own localStorage. With Supabase all devices share real data.

1. Create project at supabase.com (free tier)
2. SQL Editor → paste `supabase/schema.sql` → Run
3. Settings → API → copy URL and anon key
4. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Create Storage buckets: `supplier-documents` and `procurement-files` (both private)

---

## Platform Routes

| Route | Screen |
|-------|--------|
| `/login` | Role picker (Admin / Officer / Manager / CFO / Legal / Supplier) |
| `/dashboard` | KPIs, activity feed, quick actions |
| `/procurements` | All procurements pipeline |
| `/procurements/new` | 4-step new procurement wizard |
| `/procurements/[id]` | Detail — CIPS stages, bids, approvals |
| `/copilot` | AI chat — Claude-powered procurement assistant |
| `/suppliers` | Supplier directory with grades |
| `/analytics` | Spend, savings, performance charts |
| `/audit-trail` | Blockchain hash-chain audit log |
| `/approvals` | Approval workflow queue |
| `/knowledge` | Lessons learned, templates, best practices |
| `/supplier-portal/register` | Supplier self-registration wizard |

---

## Demo Personas

| Role | Name | Access |
|------|------|--------|
| Admin | Admin User | Full platform |
| Procurement Officer | Thabo Mokoena | Create, generate, AI Copilot |
| Manager | Naledi Dlamini | Approve, all procurements |
| CFO | Sipho Khumalo | Financial approval, analytics |
| Legal | Zanele Motha | Contract review, legal sign-off |
| Supplier | Johan van Wyk | Supplier portal |

## Approval Chain
```
Procurement Officer → Procurement Manager → CFO → Legal → PO / Contract
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | **Yes** | Claude API key (server-side only) |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |

---

## Adding Your Logo

1. Place logo file in `/public/logo.png`
2. In `components/layout/sidebar.tsx` — replace the `<span>P</span>` block with `<Image src="/logo.png" alt="ProcureTech+" width={32} height={32} />`
3. Same in `app/(auth)/login/page.tsx`

---

## Tech Stack (All Free)

| Tool | Role |
|------|------|
| Next.js 15 | Framework |
| Tailwind CSS + shadcn/ui | Styling & components |
| Anthropic Claude | AI (pay-per-token) |
| Supabase | Database + Auth + Storage |
| Vercel | Hosting |
| Recharts | Analytics charts |
| Lucide React | Icons |

---

*ProcureTech+ v1.0 · Built on CIPS standards · PPPFA 2017 compliant*
