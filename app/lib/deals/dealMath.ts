import { amortize, isPositive, paymentPI, periodCount, resolvePrincipal } from "./calc/engine";
import { realEstateTape } from "./calc/realEstate";
import type { DealInput } from "./calc/types";

export type DealMathResult = {
  noteAmount: number | null;
  monthlyPI: number | null;
  balloonBalance: number | null;
  balloonYear: number | null;
  wrapSpread: number | null;
  sub2CashFlow: number | null;
  flags: string[];
};

const toNum = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

/** Thin V1 listing math. Reuses calc engines. Never throws. Never invents tax/PITI. */
export function computeDealMath(
  input: DealInput,
  extras?: { ioYears?: number | null; monthlyRent?: number | null }
): DealMathResult {
  const flags: string[] = [];
  const noteAmount = resolvePrincipal(input);
  const structure = (input.structure || "").toLowerCase();
  const ioYears = extras?.ioYears != null && extras.ioYears > 0 ? extras.ioYears : null;
  const ioMonths = ioYears ? ioYears * 12 : 0;

  let monthlyPI: number | null = null;
  const amortMonths = isPositive(input.amort_months)
    ? input.amort_months
    : isPositive(input.term_months)
      ? input.term_months
      : null;
  const remainingAmort = amortMonths != null ? amortMonths - ioMonths : null;

  if (ioYears && noteAmount != null && input.rate != null && input.rate >= 0) {
    flags.push(`IO ${ioYears} yr`);
    if (isPositive(remainingAmort)) {
      const n = periodCount(remainingAmort, input.payment_freq || "monthly");
      monthlyPI = paymentPI(noteAmount, input.rate, n, input.payment_freq || "monthly");
    } else {
      monthlyPI = (noteAmount * (input.rate / 100)) / 12;
    }
  } else {
    monthlyPI = amortize(input).payment;
  }

  const amort = amortize(input);
  let balloonBalance = amort.balloonLeftover;
  if (typeof input.balloon === "number" && input.balloon >= 0) balloonBalance = input.balloon;

  let balloonYear: number | null = null;
  if (isPositive(input.term_months)) {
    const years = input.term_months / 12;
    const amortY = isPositive(input.amort_months) ? input.amort_months / 12 : null;
    if (balloonBalance != null || (amortY != null && years < amortY)) {
      balloonYear = Math.round(years * 10) / 10;
    }
  }

  const tape = realEstateTape(input);
  const wrapSpread = structure.includes("wrap") ? tape.spread ?? null : null;

  let sub2CashFlow: number | null = null;
  const isSub2 = structure.includes("subject") || structure === "subto" || structure === "subject_to";
  if (isSub2) {
    if (isPositive(input.down_payment) || input.down_payment === 0) {
      flags.push("sub2 cash-to-seller");
    }
    const rent = extras?.monthlyRent ?? null;
    if (rent != null && input.existing_payment != null) {
      sub2CashFlow = rent - input.existing_payment;
    }
  }

  if (structure === "cash") flags.push("Cash");
  if (wrapSpread != null) flags.push("Wrap");
  if (balloonBalance != null && balloonBalance > 0) flags.push("Balloon");

  return {
    noteAmount,
    monthlyPI,
    balloonBalance,
    balloonYear,
    wrapSpread,
    sub2CashFlow,
    flags,
  };
}

export function extrasFromIdentity(identity?: Record<string, unknown> | null): {
  ioYears: number | null;
  monthlyRent: number | null;
} {
  return {
    ioYears: toNum(identity?.io_years),
    monthlyRent: toNum(identity?.monthlyRent ?? identity?.monthly_rent),
  };
}
