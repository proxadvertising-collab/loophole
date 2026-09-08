/** Typed deal-terms contract. Stored in listings.terms jsonb and mirrored in description JSON. */

export const MIN_TICKET = 25000;

export const ASSET_CLASSES = [
  { id: "real_estate", label: "Real Estate" },
  { id: "auto", label: "Auto" },
  { id: "motorcycle", label: "Motorcycle" },
  { id: "powersports", label: "Powersports" },
  { id: "rv", label: "RV" },
  { id: "watercraft", label: "Watercraft" },
  { id: "business", label: "Business" },
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number]["id"];

export type StructureRE =
  | "subject_to"
  | "seller_finance"
  | "wrap"
  | "lease_option"
  | "novation"
  | "hybrid"
  | "wholesale"
  | "foreclosure";

export type StructureRolling =
  | "owner_finance"
  | "title_hold"
  | "lease_purchase"
  | "assumption"
  | "wrap_existing"
  | "trade_and_carry";

export type StructureBusiness =
  | "seller_note"
  | "sba_stack"
  | "standby_note"
  | "earnout"
  | "forgivable_note"
  | "holdback"
  | "asset_sale"
  | "stock_sale"
  | "hybrid_re";

export type DealStructure = StructureRE | StructureRolling | StructureBusiness | "cash";

export const CASH_STRUCTURE = { id: "cash" as const, label: "Cash (terms preferred)" };

export function structuresForClass(assetClass: AssetClass) {
  return [...STRUCTURES_BY_CLASS[assetClass], CASH_STRUCTURE];
}

export type PaymentFreq = "monthly" | "weekly" | "biweekly";
export type TitleStatus = "clear" | "lien" | "salvage" | "rebuilt" | "unknown";

export const STRUCTURES_BY_CLASS: Record<AssetClass, { id: DealStructure; label: string }[]> = {
  real_estate: [
    { id: "subject_to", label: "Subject-To" },
    { id: "seller_finance", label: "Seller Finance" },
    { id: "wrap", label: "Wrap" },
    { id: "lease_option", label: "Lease Option" },
    { id: "novation", label: "Novation" },
    { id: "hybrid", label: "Hybrid" },
    { id: "wholesale", label: "Wholesale" },
    { id: "foreclosure", label: "Foreclosure" },
  ],
  auto: [
    { id: "owner_finance", label: "Owner Finance" },
    { id: "title_hold", label: "Title Hold" },
    { id: "lease_purchase", label: "Lease Purchase" },
    { id: "assumption", label: "Assumption" },
    { id: "wrap_existing", label: "Wrap Existing" },
    { id: "trade_and_carry", label: "Trade and Carry" },
  ],
  motorcycle: [
    { id: "owner_finance", label: "Owner Finance" },
    { id: "title_hold", label: "Title Hold" },
    { id: "lease_purchase", label: "Lease Purchase" },
    { id: "assumption", label: "Assumption" },
    { id: "wrap_existing", label: "Wrap Existing" },
    { id: "trade_and_carry", label: "Trade and Carry" },
  ],
  powersports: [
    { id: "owner_finance", label: "Owner Finance" },
    { id: "title_hold", label: "Title Hold" },
    { id: "lease_purchase", label: "Lease Purchase" },
    { id: "assumption", label: "Assumption" },
    { id: "wrap_existing", label: "Wrap Existing" },
    { id: "trade_and_carry", label: "Trade and Carry" },
  ],
  rv: [
    { id: "owner_finance", label: "Owner Finance" },
    { id: "title_hold", label: "Title Hold" },
    { id: "lease_purchase", label: "Lease Purchase" },
    { id: "assumption", label: "Assumption" },
    { id: "wrap_existing", label: "Wrap Existing" },
    { id: "trade_and_carry", label: "Trade and Carry" },
  ],
  watercraft: [
    { id: "owner_finance", label: "Owner Finance" },
    { id: "title_hold", label: "Title Hold" },
    { id: "lease_purchase", label: "Lease Purchase" },
    { id: "assumption", label: "Assumption" },
    { id: "wrap_existing", label: "Wrap Existing" },
    { id: "trade_and_carry", label: "Trade and Carry" },
  ],
  business: [
    { id: "seller_note", label: "Seller Note" },
    { id: "sba_stack", label: "SBA Stack" },
    { id: "standby_note", label: "Standby Note" },
    { id: "earnout", label: "Earnout" },
    { id: "forgivable_note", label: "Forgivable Note" },
    { id: "holdback", label: "Holdback" },
    { id: "asset_sale", label: "Asset Sale" },
    { id: "stock_sale", label: "Stock Sale" },
    { id: "hybrid_re", label: "Hybrid + Real Estate" },
  ],
};

const STRUCTURE_TO_CATEGORY: Record<string, string> = {
  subject_to: "Subto",
  seller_finance: "Seller Finance",
  owner_finance: "Seller Finance",
  seller_note: "Seller Finance",
  wrap: "Wrap",
  wrap_existing: "Wrap",
  novation: "Novation",
  wholesale: "Wholesale",
  foreclosure: "Foreclosure",
  cash: "Cash",
};

export function structureToCategory(structure: string): string {
  return STRUCTURE_TO_CATEGORY[structure] || "Other";
}

export function securityLabel(assetClass?: AssetClass | string | null): string {
  if (assetClass === "real_estate") return "Mortgage / deed of trust";
  if (assetClass === "powersports") return "Lien on certificate of title, or UCC-1 if untitled";
  if (assetClass === "auto" || assetClass === "motorcycle" || assetClass === "rv" || assetClass === "watercraft") {
    return "Lien on certificate of title";
  }
  if (assetClass === "business") return "UCC blanket + optional stock pledge + personal guarantee";
  return "";
}

export interface DealTerms {
  v: 1;
  asset_class: AssetClass;
  structure: DealStructure;
  purchase_price?: number;
  down_payment?: number;
  amount_financed?: number;
  rate?: number;
  term_months?: number;
  amort_months?: number;
  payment?: number;
  payment_freq?: PaymentFreq;
  balloon?: number | boolean;
  existing_lien_balance?: number;
  existing_payment?: number;
  lienholder?: string;
  security?: string;
  title_status?: TitleStatus;
  identity?: Record<string, string | number | boolean>;
}

const isAssetClass = (value: unknown): value is AssetClass =>
  ASSET_CLASSES.some((item) => item.id === value);

const CATEGORY_TO_STRUCTURE: Record<string, DealStructure> = {
  subto: "subject_to",
  Subto: "subject_to",
  seller_finance: "seller_finance",
  "Seller Finance": "seller_finance",
  wrap: "wrap",
  Wrap: "wrap",
  cash: "cash",
  Cash: "cash",
  novation: "novation",
  Novation: "novation",
  wholesale: "wholesale",
  Wholesale: "wholesale",
  foreclosure: "foreclosure",
  Foreclosure: "foreclosure",
};

const parseLooseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return undefined;
  const num = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : undefined;
};

export function parseDealTerms(source: {
  terms?: unknown;
  description?: string | null;
  category?: string | null;
}): DealTerms | null {
  const fromColumn = source.terms;
  if (fromColumn && typeof fromColumn === "object" && isAssetClass((fromColumn as DealTerms).asset_class)) {
    return fromColumn as DealTerms;
  }
  let parsed: any = null;
  if (source.description) {
    try {
      parsed = JSON.parse(source.description);
    } catch {
      parsed = null;
    }
  }
  if (parsed?.terms && typeof parsed.terms === "object" && isAssetClass(parsed.terms.asset_class)) {
    return parsed.terms as DealTerms;
  }
  const metrics = parsed?.metrics;
  const mapped = source.category ? CATEGORY_TO_STRUCTURE[source.category] : undefined;
  if (metrics || parsed?.sellerSituation || mapped) {
    return {
      v: 1,
      asset_class: "real_estate",
      structure: mapped || "seller_finance",
      rate: parseLooseNumber(metrics?.interestRate),
      existing_lien_balance: parseLooseNumber(metrics?.remainingBalance),
      existing_payment: parseLooseNumber(metrics?.piti),
      identity: {
        ...(metrics?.arv ? { arv: metrics.arv } : {}),
        ...(metrics?.repairs ? { repairs: metrics.repairs } : {}),
        ...(metrics?.monthlyRent ? { monthlyRent: metrics.monthlyRent } : {}),
      },
    };
  }
  return null;
}

export function resolveAssetClass(source: {
  terms?: unknown;
  description?: string | null;
  category?: string | null;
}): AssetClass {
  return parseDealTerms(source)?.asset_class || "real_estate";
}

export const IDENTITY_LABELS: Record<string, string> = {
  vin: "VIN",
  year: "Year",
  make: "Make",
  model: "Model",
  mileage_or_hours: "Mileage / hours",
  title_state: "Title state",
  gen_hours: "Generator hours",
  slides: "Slides",
  hin: "HIN",
  engine_hours: "Engine hours",
  trailer_vin: "Trailer VIN",
  entity_name: "Entity",
  naics_or_category: "NAICS / category",
  sde_or_cashflow: "SDE / cash flow",
  asset_vs_stock: "Asset vs stock",
  asking_multiple: "Asking multiple",
  employees: "Employees",
  includes_real_estate: "Includes real estate",
};

export const METRIC_IDENTITY_KEYS = new Set(["arv", "repairs", "monthlyRent"]);

/** Never show a street address. If a legacy title starts with a house number, show city/suburb instead. */
export function publicHeadline(title: string, location?: string): string {
  const trimmed = (title || "").trim();
  if (!trimmed) return location || "Deal";
  if (/^\d+\s+\S+/.test(trimmed)) return location || "Deal";
  return trimmed;
}

export function formatMoney(value: number | string | undefined): string {
  if (value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
