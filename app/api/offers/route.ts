import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "../../lib/ai/serviceClient";
import { requireUserSession } from "../../lib/auth/requireUserSession";

/**
 * GET /api/offers — session-authenticated.
 * Returns offers I received (as seller) and offers I sent (as buyer),
 * with listing titles and counterparty names.
 */
export async function GET(request: NextRequest) {
  const session = await requireUserSession(request);
  if ("error" in session) return session.error;

  const supabase = getServiceClient();
  const userId = session.userId;

  const [receivedRes, sentRes] = await Promise.all([
    supabase
      .from("offers")
      .select(
        "id, listing_id, buyer_id, status, offer, created_at, listings!inner(title, price)"
      )
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("offers")
      .select(
        "id, listing_id, seller_id, status, offer, created_at, listings!inner(title, price)"
      )
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (receivedRes.error || sentRes.error) {
    return NextResponse.json(
      { success: false, error: "Could not load offers" },
      { status: 500 }
    );
  }

  // Counterparty display names.
  const ids = new Set<string>();
  (receivedRes.data || []).forEach((o: any) => ids.add(o.buyer_id));
  (sentRes.data || []).forEach((o: any) => ids.add(o.seller_id));
  const names: Record<string, string> = {};
  if (ids.size > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, display_name, email")
      .in("id", [...ids]);
    (users || []).forEach((u: any) => {
      names[u.id] =
        u.display_name || u.email?.split("@")[0] || "Unknown user";
    });
  }

  const shape = (o: any, otherId: string) => ({
    id: o.id,
    listing_id: o.listing_id,
    listing_title: o.listings?.title || "Listing",
    listing_price: o.listings?.price ?? null,
    counterparty: names[otherId] || "Unknown user",
    status: o.status,
    offer: o.offer,
    created_at: o.created_at,
  });

  return NextResponse.json({
    success: true,
    received: (receivedRes.data || []).map((o: any) => shape(o, o.buyer_id)),
    sent: (sentRes.data || []).map((o: any) => shape(o, o.seller_id)),
  });
}
