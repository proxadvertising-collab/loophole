-- "Add Loophole to your AI": personal AI tokens + structured offers.
-- Offers are server-side transactional records (visible to both parties).
-- They are NOT part of the end-to-end encrypted chat thread.

-- ============================================================================
-- ai_tokens: personal access tokens so a user's own AI can act for them.
-- Only the SHA-256 hash is stored. The plaintext is shown once at creation.
-- ============================================================================
create table if not exists public.ai_tokens (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  name text not null default 'My AI',
  scopes text[] not null default array['offers:write']::text[],
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ai_tokens_user_id_idx on public.ai_tokens(user_id);
create index if not exists ai_tokens_hash_idx on public.ai_tokens(token_hash);

alter table public.ai_tokens enable row level security;

-- Users can read their own token metadata (never the hash via API; routes
-- use the service role and strip it). No direct insert/update/delete:
-- all writes go through the API so hashing and validation are enforced.
create policy ai_tokens_select_own on public.ai_tokens
  for select using (auth.uid() = user_id);

-- ============================================================================
-- offers: structured offers submitted on a listing (by the buyer directly or
-- through their AI). The seller sees these in /offers. Negotiation details
-- stay in the end-to-end encrypted chat.
-- ============================================================================
create table if not exists public.offers (
  id uuid primary key default extensions.uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.users(id) on delete cascade,
  seller_id uuid not null references public.users(id) on delete cascade,
  offer jsonb not null default '{}'::jsonb,
  -- offer: { price, down_payment, interest_rate, term_months, balloon,
  --          monthly_payment, message, via_ai: boolean }
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','withdrawn','countered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.offers is
  'Structured offers on listings. Server-side records visible to buyer and seller; not part of E2E encrypted chat.';
comment on column public.offers.offer is
  'Offered terms: price, down_payment, interest_rate, term_months, balloon, monthly_payment, message, via_ai.';

create index if not exists offers_listing_id_idx on public.offers(listing_id);
create index if not exists offers_buyer_id_idx on public.offers(buyer_id);
create index if not exists offers_seller_id_idx on public.offers(seller_id);
create index if not exists offers_status_idx on public.offers(status);

alter table public.offers enable row level security;

-- Buyer and seller can both read offers they are party to.
create policy offers_select_party on public.offers
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- No direct inserts/updates/deletes: all writes go through the API
-- (token validation, rate limits, notifications enforced server-side).

-- updated_at maintenance
create or replace function public.touch_offer_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists offers_touch_updated_at on public.offers;
create trigger offers_touch_updated_at
  before update on public.offers
  for each row execute function public.touch_offer_updated_at();
