import { amortize, isNonNegative, isPositive } from "./engine";
import type { DealInput, DealTape } from "./types";

export function realEstateTape(input: DealInput): DealTape {
  const amort = amortize(input);
  const structure = (input.structure || "").toLowerCase();
  const badges: string[] = [];
  let spread: number | null | undefined;
  let equity: number | null | undefined;

  if (structure.includes("wrap") && amort.payment != null && isPositive(input.existing_payment)) {
    spread = amort.payment - input.existing_payment;
  }

  if (
    (structure.includes("subject") || structure === "subto" || structure === "subject_to") &&
    isPositive(input.purchase_price) &&
    isNonNegative(input.existing_lien_balance)
  ) {
    equity = input.purchase_price - input.existing_lien_balance;
  }

  if (structure === "cash") badges.push("Cash");

  return {
    payment: amort.payment,
    down: amort.cashIn,
    cashIn: amort.cashIn,
    spread: spread ?? null,
    equity: equity ?? null,
    badges,
  };
}
