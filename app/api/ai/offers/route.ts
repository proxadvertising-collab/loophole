import { NextRequest, NextResponse } from "next/server";
import {
  getServiceClient,
  getTokenOwner,
} from "../../../lib/ai/serviceClient";
import {
  extractBearerToken,
  AI_OFFER_DAILY_LIMIT,
} from "../../../lib/ai/tokens";

/**
 * AI offer endpoints (Bearer token = the user's personal AI token).
 *
 * POST /api/ai/offers — submit a structured offer on a listing.
 * GET  /api/ai/offers — list offers I have submitted.
 *
 * Offers are server-side transactional records visible to buyer and seller.
 * They are NOT part of the end-to-end encrypted chat thread — negotiation
 * details stay in Loophole's encrypted messaging.
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type OfferInput = {
  price?: number;
  down_payment?: number;
  interest_rate?: number;
  term_months?: number;
  balloon?: number;
  monthly_payment?: number;
  message?: string;
};

function cleanNumber(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
  return v;
}

async function authenticate(request: NextRequest) {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error:
            "Missing AI token. The user can create one in Loophole under Profile → Connect your AI.",
        },
        { status: 401 }
      ),
    };
  }
  const owner = await getTokenOwner(token);
  if (!owner) {
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid or revoked AI token." },
        { status: 401 }
      ),
    };
  }
  if (!owner.scopes.includes("offers:write")) {
    return {
      error: NextResponse.json(
        { success: false, error: "Token lacks the offers:write scope." },
        { status: 403 }
      ),
    };
  }
  return { owner };
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if ("error" in auth) return auth.error;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id, listing_id, status, offer, created_at, listings!inner(title, price)"
    )
    .eq("buyer_id", auth.owner.user_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Could not load offers" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    offers: (data || []).map((o: any) => ({
      id: o.id,
      listing_id: o.listing_id,
      listing_title: o.listings?.title || null,
      status: o.status,
      offer: o.offer,
      created_at: o.created_at,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if ("error" in auth) return auth.error;

  let body: { listing_id?: string; offer?: OfferInput };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const listingId = body.listing_id;
  if (!listingId || !UUID_REGEX.test(listingId)) {
    return NextResponse.json(
      { success: false, error: "listing_id must be a valid UUID" },
      { status: 400 }
    );
  }

  const input = body.offer || {};
  const message =
    typeof input.message === "string" ? input.message.slice(0, 2000) : "";
  const offer = {
    price: cleanNumber(input.price),
    down_payment: cleanNumber(input.down_payment),
    interest_rate: cleanNumber(input.interest_rate),
    term_months:
      cleanNumber(input.term_months) !== null
        ? Math.round(cleanNumber(input.term_months) as number)
        : null,
    balloon: cleanNumber(input.balloon),
    monthly_payment: cleanNumber(input.monthly_payment),
    message,
    via_ai: true,
  };

  if (
    offer.price === null &&
    offer.down_payment === null &&
    offer.monthly_payment === null &&
    !message
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "An offer needs at least a price, a down payment, a monthly payment, or a message.",
      },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // Listing must exist, be approved, live, and not the buyer's own.
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, user_id, title, status, is_draft, is_sold")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return NextResponse.json(
      { success: false, error: "Listing not found" },
      { status: 404 }
    );
  }
  if (listing.status !== "approved" || listing.is_draft || listing.is_sold) {
    return NextResponse.json(
      { success: false, error: "This listing is not open for offers" },
      { status: 400 }
    );
  }
  if (listing.user_id === auth.owner.user_id) {
    return NextResponse.json(
      { success: false, error: "You cannot make an offer on your own listing" },
      { status: 400 }
    );
  }

  // Daily rate limit per user.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", auth.owner.user_id)
    .gte("created_at", dayAgo);
  if ((count || 0) >= AI_OFFER_DAILY_LIMIT) {
    return NextResponse.json(
      {
        success: false,
        error: `Daily offer limit reached (${AI_OFFER_DAILY_LIMIT}/day). Try again tomorrow.`,
      },
      { status: 429 }
    );
  }

  const { data: created, error: insertError } = await supabase
    .from("offers")
    .insert({
      listing_id: listingId,
      buyer_id: auth.owner.user_id,
      seller_id: listing.user_id,
      offer,
      status: "pending",
    })
    .select("id, status, created_at")
    .single();

  if (insertError || !created) {
    return NextResponse.json(
      { success: false, error: "Could not submit the offer" },
      { status: 500 }
    );
  }

  // Notify the seller (fire and forget).
  const { data: buyer } = await supabase
    .from("users")
    .select("display_name, email")
    .eq("id", auth.owner.user_id)
    .maybeSingle();
  const buyerName =
    buyer?.display_name || buyer?.email?.split("@")[0] || "A buyer";
  supabase
    .from("user_notifications")
    .insert({
      user_id: listing.user_id,
      type: "system",
      title: `New offer on ${listing.title}`,
      message: `${buyerName} submitted an offer via their AI assistant. View it under Offers.`,
      actor_id: auth.owner.user_id,
      actor_name: buyerName,
      listing_id: listingId,
      data: { offer_id: created.id, via_ai: true },
    })
    .then(() => {});

  return NextResponse.json({
    success: true,
    offer: {
      id: created.id,
      listing_id: listingId,
      status: created.status,
      created_at: created.created_at,
    },
    note: "Offer sent to the seller. They can accept, decline, or counter in Loophole. Further negotiation happens in Loophole's encrypted chat.",
  });
}
