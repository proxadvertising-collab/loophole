import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { hashAiToken } from "./tokens";

let cached: SupabaseClient | null = null;

/** Service-role client for AI routes. Bypasses RLS; every route validates. */
export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

export type AiTokenRow = {
  id: string;
  user_id: string;
  name: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

/** Look up a live (unrevoked) token by its plaintext value. */
export async function getTokenOwner(
  plaintext: string
): Promise<AiTokenRow | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ai_tokens")
    .select("id, user_id, name, scopes, last_used_at, revoked_at, created_at")
    .eq("token_hash", hashAiToken(plaintext))
    .is("revoked_at", null)
    .maybeSingle();
  if (error || !data) return null;

  // Touch last_used_at (fire and forget).
  supabase
    .from("ai_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {});
  return data as AiTokenRow;
}

/** Strip internal fields before returning token metadata to the owner. */
export function publicToken(row: AiTokenRow) {
  return {
    id: row.id,
    name: row.name,
    scopes: row.scopes,
    last_used_at: row.last_used_at,
    created_at: row.created_at,
  };
}
