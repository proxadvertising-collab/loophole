import { NextRequest, NextResponse } from "next/server";
import {
  getServiceClient,
  publicToken,
} from "../../../lib/ai/serviceClient";
import { generateAiToken, AI_TOKEN_SCOPES } from "../../../lib/ai/tokens";
import { requireUserSession } from "../../../lib/auth/requireUserSession";

/**
 * Session-authenticated token management.
 *
 * GET  /api/ai/tokens — list my tokens (metadata only, never hashes).
 * POST /api/ai/tokens — create a token. Returns the plaintext ONCE.
 */
export async function GET(request: NextRequest) {
  const session = await requireUserSession(request);
  if ("error" in session) return session.error;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ai_tokens")
    .select("id, user_id, name, scopes, last_used_at, revoked_at, created_at")
    .eq("user_id", session.userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: "Could not load tokens" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    tokens: (data || []).map(publicToken),
  });
}

export async function POST(request: NextRequest) {
  const session = await requireUserSession(request);
  if ("error" in session) return session.error;

  let body: { name?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Name is optional; empty body is fine.
  }
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 60)
      : "My AI";

  const supabase = getServiceClient();

  // Cap active tokens per user.
  const { count } = await supabase
    .from("ai_tokens")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.userId)
    .is("revoked_at", null);
  if ((count || 0) >= 5) {
    return NextResponse.json(
      {
        success: false,
        error: "You already have 5 active AI tokens. Revoke one first.",
      },
      { status: 400 }
    );
  }

  const { plaintext, hash } = generateAiToken();
  const { data, error } = await supabase
    .from("ai_tokens")
    .insert({
      user_id: session.userId,
      token_hash: hash,
      name,
      scopes: [...AI_TOKEN_SCOPES],
    })
    .select("id, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "Could not create token" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    token: {
      id: data.id,
      name,
      created_at: data.created_at,
      // Shown exactly once. We never store or return it again.
      plaintext,
    },
    warning:
      "Copy this token now — it will never be shown again. Anyone with it can submit offers as you (up to 20/day).",
  });
}
