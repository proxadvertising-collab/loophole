import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "../../../lib/ai/serviceClient";

/**
 * Public deal search for AI assistants.
 * GET /api/ai/deals?q=&asset_class=&structure=&max_payment=&max_cash_in=&crypto=1&limit=
 *
 * Only approved, live listings. Never invents data — every field comes
 * straight from the listing row.
 */

type Terms = {
  asset_class?: string;
  structure?: string;
  down_payment?: number;
  interest_rate?: number;
  term_months?: number;
  monthly_payment?: number;
  balloon?: number;
  accepts_crypto?: boolean;
  [key: string]: unknown;
};

function toNumber(v: string | null): number | null {
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().slice(0, 120);
    const assetClass = (searchParams.get("asset_class") || "").trim();
    const structure = (searchParams.get("structure") || "").trim();
    const maxPayment = toNumber(searchParams.get("max_payment"));
    const maxCashIn = toNumber(searchParams.get("max_cash_in"));
    const cryptoOnly = searchParams.get("crypto") === "1";
    const limit = Math.min(Math.max(toNumber(searchParams.get("limit")) ?? 20, 1), 50);

    const supabase = getServiceClient();

    let query = supabase
      .from("listings")
      .select(
        "id, title, description, price, category, location, images, terms, created_at"
      )
      .eq("status", "approved")
      .eq("is_draft", false)
      .eq("is_sold", false)
      .order("created_at", { ascending: false })
      .limit(200);

    if (q) {
      const safe = q.replace(/[%_]/g, "");
      query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%,location.ilike.%${safe}%`);
    }
    if (assetClass) {
      query = query.eq("terms->>asset_class", assetClass);
    }
    if (structure) {
      query = query.eq("terms->>structure", structure);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, error: "Search failed" },
        { status: 500 }
      );
    }

    let deals = (data || []).map((row: any) => {
      const terms = (row.terms || {}) as Terms;
      const images: string[] = Array.isArray(row.images) ? row.images : [];
      return {
        id: row.id,
        title: row.title,
        price: row.price,
        category: row.category,
        location: row.location,
        image: images[0] || null,
        url: `https://creativeloophole.com/listing/${row.id}`,
        terms: {
          asset_class: terms.asset_class || null,
          structure: terms.structure || null,
          down_payment: terms.down_payment ?? null,
          interest_rate: terms.interest_rate ?? null,
          term_months: terms.term_months ?? null,
          monthly_payment: terms.monthly_payment ?? null,
          balloon: terms.balloon ?? null,
          accepts_crypto: terms.accepts_crypto === true,
        },
        listed_at: row.created_at,
      };
    });

    if (maxPayment !== null) {
      deals = deals.filter(
        (d) => d.terms.monthly_payment === null || d.terms.monthly_payment <= maxPayment
      );
    }
    if (maxCashIn !== null) {
      deals = deals.filter(
        (d) => d.terms.down_payment === null || d.terms.down_payment <= maxCashIn
      );
    }
    if (cryptoOnly) {
      deals = deals.filter((d) => d.terms.accepts_crypto);
    }

    deals = deals.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: deals.length,
      deals,
      note: "Terms shown are the seller's listed terms. Loophole does not broker, fund, or guarantee deals.",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
