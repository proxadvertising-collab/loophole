import { amortize, isPositive } from "./engine";
import type { DealInput, DealTape } from "./types";

export function rollingStockTape(input: DealInput): DealTape {
  const amort = amortize(input);
  const badges: string[] = [];
  let balloonPct: number | null = null;

  const balloonAmt =
    typeof input.balloon === "number" && isPositive(input.balloon)
      ? input.balloon
      : amort.balloonLeftover;

  if (isPositive(balloonAmt) && isPositive(input.purchase_price)) {
    balloonPct = balloonAmt / input.purchase_price;
    if (balloonPct > 0.4) badges.push("Balloon > 40%");
  }

  if ((input.structure || "").toLowerCase() === "cash") badges.push("Cash");

  return {
    payment: amort.payment,
    down: amort.cashIn,
    cashIn: amort.cashIn,
    balloonPct,
    badges,
  };
}
