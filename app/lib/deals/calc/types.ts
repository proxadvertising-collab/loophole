import type { AssetClass, DealStructure, PaymentFreq } from "../../../props/dealTerms";

export type EngineKind = "realEstate" | "rollingStock" | "business";

export interface DealInput {
  asset_class?: AssetClass | string | null;
  structure?: DealStructure | string | null;
  purchase_price?: number | null;
  down_payment?: number | null;
  amount_financed?: number | null;
  rate?: number | null;
  term_months?: number | null;
  amort_months?: number | null;
  payment?: number | null;
  payment_freq?: PaymentFreq | null;
  balloon?: number | boolean | null;
  existing_lien_balance?: number | null;
  existing_payment?: number | null;
  sde?: number | null;
}

export interface ScheduleRow {
  n: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface AmortResult {
  payment: number | null;
  totalInterest: number | null;
  balloonLeftover: number | null;
  cashIn: number | null;
  principal: number | null;
  periods: number | null;
  first12: ScheduleRow[];
}

export interface DealTape {
  payment: number | null;
  down: number | null;
  cashIn: number | null;
  spread?: number | null;
  equity?: number | null;
  balloonPct?: number | null;
  coverage?: number | null;
  badges: string[];
}

export interface DealSortKeys {
  cashIn: number | null;
  payment: number | null;
  coverage: number | null;
  termsComplete: boolean;
}
