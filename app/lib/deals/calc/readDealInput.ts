import { parseDealTerms } from "../../../props/dealTerms";
import type { DealInput } from "./types";

const toNum = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const num = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : null;
};

/** Parse known listing keys into DealInput. Never invent tax/insurance/SDE/PITI. */
export function readDealInput(source: {
  terms?: unknown;
  description?: string | null;
  category?: string | null;
}): DealInput {
  const terms = parseDealTerms(source);
  const sde = toNum(terms?.identity?.sde_or_cashflow);

  return {
    asset_class: terms?.asset_class || "real_estate",
    structure: terms?.structure || null,
    purchase_price: terms?.purchase_price ?? null,
    down_payment: terms?.down_payment ?? null,
    amount_financed: terms?.amount_financed ?? null,
    rate: terms?.rate ?? null,
    term_months: terms?.term_months ?? null,
    amort_months: terms?.amort_months ?? null,
    payment: terms?.payment ?? null,
    payment_freq: terms?.payment_freq || "monthly",
    balloon: terms?.balloon ?? null,
    existing_lien_balance: terms?.existing_lien_balance ?? null,
    existing_payment: terms?.existing_payment ?? null,
    sde,
  };
}
