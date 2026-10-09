import { NextResponse } from "next/server";

/**
 * GET /loophole.md — instruction file for AI assistants.
 * The user pastes one line into any AI with web access:
 * "Read https://creativeloophole.com/loophole.md and ..."
 */

const MD = `# Loophole — AI Assistant Instructions

Loophole is the deal board for creative finance on real assets: real estate,
autos, motorcycles, powersports, RVs, watercraft, and businesses. Deals are
structured with seller finance, subject-to, wraps, lease options, notes, and
related arrangements. Terms matter as much as price — every listing carries
its Deal DNA: cash in, financed amount, rate, term, balloon, payment, and the
mechanics in plain English.

Base URL: https://creativeloophole.com

## 1. Finding deals

Use the public search API. No authentication needed.

GET https://creativeloophole.com/api/ai/deals

Query parameters (all optional):
- q — keyword (title, description, location). Example: q=harley
- asset_class — real_estate | auto | motorcycle | powersports | rv | watercraft | business
- structure — subject_to | seller_finance | wrap | lease_option | owner_finance | title_hold | lease_purchase | assumption | wrap_existing | trade_and_carry | seller_note | sba_stack | earnout | cash (and others; match loosely and fall back to unfiltered search)
- max_payment — max monthly payment in USD. Example: max_payment=800
- max_cash_in — max down payment / cash to close in USD. Example: max_cash_in=10000
- crypto=1 — only sellers open to crypto
- limit — results to return (default 20, max 50)

Response: { success, count, deals[] }. Each deal has id, title, price,
category, location, image, url, listed_at, and a terms object:
{ asset_class, structure, down_payment, interest_rate, term_months,
  monthly_payment, balloon, accepts_crypto }.

Rules for presenting deals:
- Report ONLY the terms the API returns. Never invent, estimate, or round
  terms that are null — say "not listed" instead.
- Link each deal with its url.
- Include this note when summarizing: "Terms shown are the seller's listed
  terms. Loophole does not broker, fund, hold money, or guarantee deals."

## 2. Matching the user's terms

When the user says "my terms are X" (e.g. "$10k down, under $900/mo,
seller finance, open to crypto"), translate to query parameters:
- "$10k down" -> max_cash_in=10000
- "under $900/mo" -> max_payment=900
- "seller finance" -> structure=seller_finance
- "open to crypto" -> crypto=1
- asset mentions ("truck", "boat", "rental house") -> q and/or asset_class

If a filter returns nothing, relax one constraint at a time (widen payment
first, then cash in) and say what you changed.

When the user asks "what's available", search broadly (no filters or just
their asset class) and present each deal's terms plainly: cash in, monthly
payment, rate, term, balloon, structure.

## 3. Submitting an offer

Offers are submitted through the API with the user's personal AI token.
Ask the user for it if they want you to submit offers: "Paste your Loophole
AI token — you can create one under Profile → Connect your AI."

POST https://creativeloophole.com/api/ai/offers
Headers: Authorization: Bearer <AI_TOKEN>, Content-Type: application/json
Body:
{
  "listing_id": "<uuid from the deal search>",
  "offer": {
    "price": 45000,          // optional: offered price in USD
    "down_payment": 8000,    // optional: cash down in USD
    "interest_rate": 7.5,    // optional: percent
    "term_months": 60,       // optional
    "balloon": 20000,        // optional: balloon amount in USD
    "monthly_payment": 650,  // optional: offered payment in USD
    "message": "Optional note to the seller (max 2000 chars)."
  }
}

At least one of price, down_payment, monthly_payment, or message is required.
Limit: 20 offers per day per user.

Response: { success, offer: { id, listing_id, status }, note }.

Before submitting, ALWAYS read the offer back to the user and get explicit
confirmation. Never submit an offer the user has not approved, and never
change their numbers.

## 4. Checking offer status

GET https://creativeloophole.com/api/ai/offers
Headers: Authorization: Bearer <AI_TOKEN>
Returns the user's submitted offers with status:
pending | accepted | declined | withdrawn | countered.

## 5. Honesty and boundaries

- Loophole is a marketplace, not a party to any transaction. It does not
  broker deals, hold funds, provide escrow or title services, or give
  legal, tax, or investment advice.
- Offers submitted through the API are structured records visible to the
  buyer and seller. Detailed negotiation happens in Loophole's own
  end-to-end encrypted chat — you cannot read or write those messages.
- Never claim a deal is verified, vetted, or endorsed by Loophole unless
  the listing itself says so.
- If the API errors or a listing disappears, say so plainly instead of
  guessing.
`;

export async function GET() {
  return new NextResponse(MD, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
