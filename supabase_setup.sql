-- ============================================================================
--  Code Connect · Hypervision — Supabase schema + security
--  Run this once in the Supabase dashboard → SQL Editor → New query → Run.
-- ============================================================================

create table if not exists public.code_connect_registrations (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  name           text        not null,
  sap_id         text        not null,
  year           smallint    not null check (year between 1 and 4),
  contact        text        not null,
  email          text        not null,
  interests      text[]      not null default '{}',
  other_interest text
);

-- Prevent a student from registering twice with the same SAP ID or email.
-- (The frontend surfaces a friendly "already registered" message on conflict.)
create unique index if not exists code_connect_sap_id_key
  on public.code_connect_registrations (sap_id);
create unique index if not exists code_connect_email_key
  on public.code_connect_registrations (lower(email));

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Enable RLS, then allow the public (anon) key to INSERT only.
-- No SELECT/UPDATE/DELETE policy exists for anon, so submissions cannot be read
-- or modified from the browser — only inserted. View responses in the dashboard
-- (Table Editor) or via the service_role key on a trusted server.
alter table public.code_connect_registrations enable row level security;

drop policy if exists "anon can insert registrations"
  on public.code_connect_registrations;

create policy "anon can insert registrations"
  on public.code_connect_registrations
  for insert
  to anon
  with check (true);
