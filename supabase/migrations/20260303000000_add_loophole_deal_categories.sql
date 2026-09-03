-- Extend listing_category enum with Loophole creative-finance deal types.
-- ALTER TYPE ... ADD VALUE IF NOT EXISTS is safe to re-run and does not
-- require dropping/recreating the enum or existing rows.

ALTER TYPE "public"."listing_category" ADD VALUE IF NOT EXISTS 'subto';
ALTER TYPE "public"."listing_category" ADD VALUE IF NOT EXISTS 'seller_finance';
ALTER TYPE "public"."listing_category" ADD VALUE IF NOT EXISTS 'wrap';
ALTER TYPE "public"."listing_category" ADD VALUE IF NOT EXISTS 'cash';
ALTER TYPE "public"."listing_category" ADD VALUE IF NOT EXISTS 'novation';
ALTER TYPE "public"."listing_category" ADD VALUE IF NOT EXISTS 'wholesale';
ALTER TYPE "public"."listing_category" ADD VALUE IF NOT EXISTS 'foreclosure';
