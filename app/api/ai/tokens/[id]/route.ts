import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "../../../../lib/ai/serviceClient";
import { requireUserSession } from "../../../../lib/auth/requireUserSession";

/** DELETE /api/ai/tokens/[id] — revoke one of my tokens. */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireUserSession(request);
  if ("error" in session) return session.error;

  if (!UUID_REGEX.test(params.id)) {
    return NextResponse.json(
      { success: false, error: "Invalid token id" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("ai_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("user_id", session.userId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "Token not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
