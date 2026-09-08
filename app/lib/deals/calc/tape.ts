import { businessTape } from "./business";
import { amortize, engineKind } from "./engine";
import { realEstateTape } from "./realEstate";
import { rollingStockTape } from "./rollingStock";
import type { DealInput, DealTape } from "./types";

export function buildTape(input: DealInput): DealTape {
  const kind = engineKind(input.asset_class);
  if (kind === "business") return businessTape(input);
  if (kind === "rollingStock") return rollingStockTape(input);
  return realEstateTape(input);
}

export function tapeChips(input: DealInput): string[] {
  const tape = buildTape(input);
  const kind = engineKind(input.asset_class);
  const chips: string[] = [];

  const money = (n: number) =>
    `$${Math.round(n).toLocaleString("en-US")}`;

  if (tape.payment != null) chips.push(`${money(tape.payment)}/mo`);
  if (kind === "business") {
    if (tape.cashIn != null) chips.push(`${money(tape.cashIn)} cash-in`);
    if (tape.coverage != null) chips.push(`${tape.coverage.toFixed(2)}x coverage`);
  } else {
    if (tape.down != null) chips.push(`${money(tape.down)} down`);
  }

  if (kind === "realEstate") {
    if (tape.spread != null) {
      const sign = tape.spread >= 0 ? "+" : "−";
      chips.push(`${sign}${money(Math.abs(tape.spread))} spread`);
    }
    if (tape.equity != null) chips.push(`${money(tape.equity)} day-1 equity`);
  }

  if (kind === "rollingStock" && tape.balloonPct != null) {
    chips.push(`${Math.round(tape.balloonPct * 100)}% balloon`);
  }

  tape.badges.forEach((badge) => {
    if (chips.length < 4) chips.push(badge);
  });

  return chips.slice(0, 4);
}

export function workbenchAmort(input: DealInput) {
  return amortize(input);
}
