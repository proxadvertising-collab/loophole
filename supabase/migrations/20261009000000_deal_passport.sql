-- Deal Passport: verified buyer reputation layer.
-- Legal boundary: verification is document-based only. Loophole never holds
-- funds, never vouches for any person or deal, and never acts as a party to
-- a transaction. Passport data is user-provided plus admin document review.

-- 1. Passport row per user -------------------------------------------------
create table if not exists public.buyer_passports (
  user_id uuid primary key references public.users(id) on delete cascade,
  pof_status text not null default 'none'
    check (pof_status in ('none','pending','verified','rejected')),
  pof_document_url text,
  pof_submitted_at timestamptz,
  pof_verified_at timestamptz,
  pof_rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.buyer_passports is
  'Deal Passport: proof-of-funds verification status per user. Document-based only; not an endorsement of any person or deal.';

-- 2. Self-reported closed deals --------------------------------------------
create table if not exists public.passport_deals (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  asset_class text,
  structure text,
  closed_at date,
  status text not null default 'pending'
    check (status in ('pending','verified','rejected')),
  created_at timestamptz default now()
);

comment on table public.passport_deals is
  'Self-reported closed deals attached to a Deal Passport. Verified means an admin saw supporting documentation; it is not a guarantee.';

create index if not exists passport_deals_user_idx on public.passport_deals (user_id);

-- 3. Private storage bucket for POF documents -------------------------------
insert into storage.buckets (id, name, public)
values ('pof-documents', 'pof-documents', false)
on conflict (id) do nothing;

-- 4. RLS --------------------------------------------------------------------
alter table public.buyer_passports enable row level security;
alter table public.passport_deals enable row level security;

-- Passport status is public (it's a trust badge); documents stay private.
drop policy if exists "Anyone can view passports" on public.buyer_passports;
create policy "Anyone can view passports"
  on public.buyer_passports for select using (true);

drop policy if exists "Users manage own passport" on public.buyer_passports;
create policy "Users manage own passport"
  on public.buyer_passports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Anyone can view passport deals" on public.passport_deals;
create policy "Anyone can view passport deals"
  on public.passport_deals for select using (true);

drop policy if exists "Users manage own passport deals" on public.passport_deals;
create policy "Users manage own passport deals"
  on public.passport_deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- POF documents: only the owner can read their own uploads. Admins use the
-- service-role client (bypasses RLS) for review.
drop policy if exists "Users read own POF docs" on storage.objects;
create policy "Users read own POF docs"
  on storage.objects for select
  using (bucket_id = 'pof-documents' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users upload own POF docs" on storage.objects;
create policy "Users upload own POF docs"
  on storage.objects for insert
  with check (bucket_id = 'pof-documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- 5. updated_at trigger -------------------------------------------------------
drop trigger if exists trigger_buyer_passports_updated_at on public.buyer_passports;
create trigger trigger_buyer_passports_updated_at
  before update on public.buyer_passports
  for each row execute function public.update_updated_at_column();
