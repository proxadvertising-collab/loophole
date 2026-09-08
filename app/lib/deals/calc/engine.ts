import type { PaymentFreq } from "../../../props/dealTerms";
import type { AmortResult, DealInput, EngineKind, ScheduleRow } from "./types";

export const isFiniteNum = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isNonNegative = (value: unknown): value is number =>
  isFiniteNum(value) && value >= 0;

export const isPositive = (value: unknown): value is number =>
  isFiniteNum(value) && value > 0;

export function periodsPerYear(freq?: PaymentFreq | null): number {
  if (freq === "weekly") return 52;
  if (freq === "biweekly") return 26;
  return 12;
}

export function engineKind(assetClass?: string | null): EngineKind {
  if (assetClass === "business") return "business";
  if (
    assetClass === "auto" ||
    assetClass === "motorcycle" ||
    assetClass === "powersports" ||
    assetClass === "rv" ||
    assetClass === "watercraft"
  ) {
    return "rollingStock";
  }
  return "realEstate";
}

export function resolvePrincipal(input: DealInput): number | null {
  if (isPositive(input.amount_financed)) return input.amount_financed;
  if (isPositive(input.purchase_price)) {
    const down = isNonNegative(input.down_payment) ? input.down_payment : 0;
    const principal = input.purchase_price - down;
    return principal > 0 ? principal : null;
  }
  return null;
}

export function periodCount(months: number | null | undefined, freq?: PaymentFreq | null): number | null {
  if (!isPositive(months)) return null;
  const n = months * (periodsPerYear(freq) / 12);
  return n > 0 ? n : null;
}

export function periodicRate(annualPercent: number | null | undefined, freq?: PaymentFreq | null): number | null {
  if (!isNonNegative(annualPercent)) return null;
  return annualPercent / 100 / periodsPerYear(freq);
}

/** Standard P&I. Rate is annual nominal. freq defaults monthly. Invalid → null. */
export function paymentPI(
  principal: number | null,
  annualRatePct: number | null | undefined,
  nPeriods: number | null,
  freq?: PaymentFreq | null
): number | null {
  if (!isPositive(principal) || !isPositive(nPeriods) || !isNonNegative(annualRatePct)) return null;
  const r = periodicRate(annualRatePct, freq);
  if (r === null) return null;
  if (r === 0) return principal / nPeriods;
  const factor = (1 + r) ** nPeriods;
  if (!Number.isFinite(factor) || factor === 1) return null;
  return (principal * r * factor) / (factor - 1);
}

export function remainingBalance(
  principal: number,
  pmt: number,
  r: number,
  nPeriods: number,
  paidPeriods: number
): number | null {
  if (paidPeriods <= 0) return principal;
  if (paidPeriods >= nPeriods) return 0;
  if (r === 0) {
    const left = principal - pmt * paidPeriods;
    return left > 0 ? left : 0;
  }
  const powN = (1 + r) ** nPeriods;
  const powK = (1 + r) ** paidPeriods;
  const denom = powN - 1;
  if (denom === 0) return null;
  const balance = (principal * (powN - powK)) / denom;
  if (!Number.isFinite(balance)) return null;
  return balance > 0 ? balance : 0;
}

export function amortize(input: DealInput): AmortResult {
  const freq = input.payment_freq || "monthly";
  const principal = resolvePrincipal(input);
  const amortMonths = isPositive(input.amort_months)
    ? input.amort_months
    : isPositive(input.term_months)
      ? input.term_months
      : null;
  const termMonths = isPositive(input.term_months) ? input.term_months : amortMonths;
  const nAmort = periodCount(amortMonths, freq);
  const nTerm = periodCount(termMonths, freq);
  const computed = paymentPI(principal, input.rate, nAmort, freq);
  const payment = computed ?? (isPositive(input.payment) ? input.payment : null);
  const cashIn = isNonNegative(input.down_payment) ? input.down_payment : null;

  const empty: AmortResult = {
    payment,
    totalInterest: null,
    balloonLeftover: null,
    cashIn,
    principal,
    periods: nTerm,
    first12: [],
  };

  if (!isPositive(principal) || !isPositive(nAmort) || payment === null) return empty;

  const r = periodicRate(input.rate ?? 0, freq) ?? 0;
  const paidPeriods = isPositive(nTerm) ? Math.min(nTerm, nAmort) : nAmort;
  let balloonLeftover: number | null = remainingBalance(principal, payment, r, nAmort, paidPeriods);

  if (typeof input.balloon === "number" && isNonNegative(input.balloon)) {
    balloonLeftover = input.balloon;
  } else if (input.balloon === false) {
    balloonLeftover = balloonLeftover && balloonLeftover > 1 ? balloonLeftover : 0;
  }

  const first12: ScheduleRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  const rows = Math.min(12, Math.ceil(paidPeriods));
  for (let n = 1; n <= Math.ceil(paidPeriods); n += 1) {
    const interest = r === 0 ? 0 : balance * r;
    let principalPaid = payment - interest;
    if (principalPaid > balance) principalPaid = balance;
    if (principalPaid < 0) principalPaid = 0;
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    if (n <= rows) {
      first12.push({
        n,
        interest,
        principal: principalPaid,
        balance,
      });
    }
  }

  return {
    payment,
    totalInterest: Number.isFinite(totalInterest) ? totalInterest : null,
    balloonLeftover,
    cashIn,
    principal,
    periods: nTerm,
    first12,
  };
}
