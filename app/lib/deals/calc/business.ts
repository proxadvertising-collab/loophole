import { amortize, isPositive, periodsPerYear } from "./engine";
import type { DealInput, DealTape } from "./types";

export function annualDebtService(input: DealInput, payment: number | null): number | null {
  if (!isPositive(payment)) return null;
  return payment * periodsPerYear(input.payment_freq || "monthly");
}

export function businessTape(input: DealInput): DealTape {
  const amort = amortize(input);
  const badges: string[] = [];
  const ads = annualDebtService(input, amort.payment);
  let coverage: number | null = null;

  if (isPositive(input.sde) && isPositive(ads)) {
    coverage = input.sde / ads;
  }

  const structure = (input.structure || "").toLowerCase();
  if (structure.includes("standby")) badges.push("Standby");
  if (structure === "cash") badges.push("Cash");

  return {
    payment: amort.payment,
    down: amort.cashIn,
    cashIn: amort.cashIn,
    coverage,
    badges,
  };
}
