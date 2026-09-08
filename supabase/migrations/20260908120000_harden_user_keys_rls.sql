-- Harden user_keys RLS so encrypted_private_key is owner-only.
-- Peers need public keys for messaging via user_public_keys (no private material).
-- Matches live columns: user_id (uuid), public_key, encrypted_private_key, created_at
-- (see 20260220232436_remote_schema.sql). KeyService.getPublicKey(s) reads the view;
-- getUserKeys still reads user_keys (own row only).
-- Captain: apply this on hosted Supabase before/with the KeyService deploy. Do not auto-apply.

DROP POLICY IF EXISTS "Allow reading user keys" ON public.user_keys;
-- In case a local/manual copy of DATABASE_MIGRATION.sql policies was applied:
DROP POLICY IF EXISTS "Anyone can read public keys" ON public.user_keys;
DROP POLICY IF EXISTS "Users can read own encrypted private key" ON public.user_keys;
DROP POLICY IF EXISTS "Users can read own keys" ON public.user_keys;

-- Full row (including encrypted_private_key) only for the owning auth user.
CREATE POLICY "Users can read own keys"
  ON public.user_keys
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Public-key-only surface for E2EE send path. Owned by postgres so the view
-- is not security_invoker (PG15): peers can read public_key without gaining
-- access to encrypted_private_key on the base table.
CREATE OR REPLACE VIEW public.user_public_keys AS
SELECT
  user_id,
  public_key,
  created_at
FROM public.user_keys;

ALTER VIEW public.user_public_keys OWNER TO postgres;
ALTER VIEW public.user_public_keys SET (security_invoker = false);

COMMENT ON VIEW public.user_public_keys IS
  'Public E2EE material only (user_id, public_key, created_at). Private ciphertext stays on user_keys with owner-only SELECT.';

GRANT SELECT ON public.user_public_keys TO authenticated;

-- INSERT/UPDATE policies from remote_schema remain unchanged
-- ("Users can insert own keys", "Users can update own keys").