import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "../../../../lib/ai/serviceClient";
import { requireUserSession } from "../../../../lib/auth/requireUserSession";

/**
 * Session-authenticated offer management.
 *
 * PATCH /api/ai/offers/[id] — seller: accept | decline | counter;
 *                             buyer: withdraw.
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SELLER_ACTIONS = ["accepted", "declined", "countered"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireUserSession(request);
  if ("error" in session) return session.error;

  const offerId = params.id;
  if (!UUID_REGEX.test(offerId)) {
    return NextResponse.json(
      { success: false, error: "Invalid offer id" },
      { status: 400 }
    );
  }

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const action = body.action;
  const supabase = getServiceClient();

  const { data: offer, error } = await supabase
    .from("offers")
    .select("id, buyer_id, seller_id, status, listing_id")
    .eq("id", offerId)
    .maybeSingle();

  if (error || !offer) {
    return NextResponse.json(
      { success: false, error: "Offer not found" },
      { status: 404 }
    );
  }

  const userId = session.userId;
  const isSeller = offer.seller_id === userId;
  const isBuyer = offer.buyer_id === userId;
  if (!isSeller && !isBuyer) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (offer.status !== "pending") {
    return NextResponse.json(
      { success: false, error: `Offer is already ${offer.status}` },
      { status: 400 }
    );
  }

  let nextStatus: string | null = null;
  if (isSeller && SELLER_ACTIONS.includes(action as any)) {
    nextStatus = action as string;
  } else if (isBuyer && action === "withdraw") {
    nextStatus = "withdrawn";
  } else {
    return NextResponse.json(
      { success: false, error: "Action not allowed" },
      { status: 403 }
    );
  }

  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: nextStatus })
    .eq("id", offerId);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: "Could not update the offer" },
      { status: 500 }
    );
  }

  // Notify the other party (fire and forget).
  const notifyUserId = isSeller ? offer.buyer_id : offer.seller_id;
  supabase
    .from("user_notifications")
    .insert({
      user_id: notifyUserId,
      type: "system",
      title: `Offer ${nextStatus}`,
      message: `An offer on one of your listings was ${nextStatus}.`,
      listing_id: offer.listing_id,
      data: { offer_id: offerId },
    })
    .then(() => {});

  return NextResponse.json({ success: true, status: nextStatus });
}
