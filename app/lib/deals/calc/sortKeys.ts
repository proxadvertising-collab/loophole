import { resolvePrincipal } from "./engine";
import { buildTape } from "./tape";
import type { DealInput, DealSortKeys } from "./types";

export function sortKeys(input: DealInput): DealSortKeys {
  const tape = buildTape(input);
  const principal = resolvePrincipal(input);
  const termsComplete =
    principal != null &&
    input.rate != null &&
    Number.isFinite(input.rate) &&
    ((input.term_months != null && input.term_months > 0) ||
      (input.amort_months != null && input.amort_months > 0));

  return {
    cashIn: tape.cashIn,
    payment: tape.payment,
    coverage: tape.coverage ?? null,
    termsComplete,
  };
}
