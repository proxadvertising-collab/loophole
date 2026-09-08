-- Additive deal-terms blob. Existing description JSON remains the fallback
-- for listings created before this column. Do not drop description/category.

alter table public.listings
  add column if not exists terms jsonb not null default '{}'::jsonb;

comment on column public.listings.terms is
  'Versioned creative-finance terms (asset_class, structure, numbers, identity). Empty object for legacy rows.';
