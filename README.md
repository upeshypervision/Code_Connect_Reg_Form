# Code Connect · Hypervision — Registration Form

A frontend-only (React + Vite + TypeScript) registration form for **Hypervision → Code Connect**, styled to match [recruitment.upeshypervision.in](https://recruitment.upeshypervision.in). Submissions are written directly to **Supabase** from the browser — no backend server — so it deploys as a static site on **Vercel**.

## Fields (all required)

| Field | Rule |
|-------|------|
| Full Name | letters only, min 2 chars |
| SAP ID | exactly 9 digits (`5900XXXXX`) |
| Year | dropdown — 1 / 2 / 3 / 4 |
| Contact Number | 10-digit Indian mobile (`[6-9]XXXXXXXXX`) |
| College Email | `name.xxxxx@stu.upes.ac.in` (roll number must match the last 5 digits of the SAP ID) |
| Project interests | multi-select dropdown, ≥ 1; "Other" reveals a text box |

## 1. Configure Supabase env vars

Create a `.env.local` file in the project root (it is git-ignored — never commit it):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Get both from your Supabase project → **Settings → API**. The URL and key must belong to the **same** project. These are *publishable* (public) keys — safe in the frontend — and the database is protected by Row Level Security.

## 2. Set up the database (once)

1. Open your project → **SQL Editor** → **New query**.
2. Paste the contents of [`supabase_setup.sql`](./supabase_setup.sql) and click **Run**.

This creates the `code_connect_registrations` table and enables Row Level Security so the public key can **insert only** (nobody can read or edit rows from the browser). View responses in **Table Editor**.

## 3. Run locally

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## 4. Deploy to Vercel

1. Import this repo in Vercel (or run `vercel` from the CLI).
2. Vercel auto-detects **Vite**:
   - Build command: `npm run build`
   - Output directory: `dist`
3. In **Project → Settings → Environment Variables**, add your own `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (because `.env.local` is git-ignored and not part of the repo).
4. Deploy — pure static frontend, form writes straight to Supabase.

## Project structure

```
src/
  App.tsx                     form, validation, submit
  components/MultiSelect.tsx  multi-select dropdown
  lib/supabase.ts             Supabase browser client (safe when unconfigured)
  index.css                   Hypervision theme
supabase_setup.sql            table + RLS policy
```

## Customizing

- **Colors / theme** — CSS variables at the top of `src/index.css`.
- **Interest options** — `INTEREST_OPTIONS` in `src/App.tsx`.
- **Validation** — `validate()` in `src/App.tsx`.
- **Table name** — `REGISTRATIONS_TABLE` in `src/lib/supabase.ts` (keep it in sync with the SQL).
