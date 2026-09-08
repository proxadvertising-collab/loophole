"use client";

import { computeDealMath, extrasFromIdentity } from "../../lib/deals/dealMath";
import type { DealInput } from "../../lib/deals/calc";

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export default function DealStrip({
  input,
  identity,
  monthlyRent,
  ioYears,
}: {
  input: DealInput;
  identity?: Record<string, unknown> | null;
  monthlyRent?: number | null;
  ioYears?: number | null;
}) {
  const extras = extrasFromIdentity(identity);
  const math = computeDealMath(input, {
    ioYears: ioYears ?? extras.ioYears,
    monthlyRent: monthlyRent ?? extras.monthlyRent,
  });

  const parts: string[] = [];
  if (math.monthlyPI != null) parts.push(`${money(math.monthlyPI)}/mo P&I`);
  if (math.balloonYear != null) parts.push(`balloon yr ${math.balloonYear}`);
  if (math.balloonBalance != null && math.balloonBalance > 0) parts.push(`${money(math.balloonBalance)} balloon`);
  if (math.wrapSpread != null) parts.push(`${money(math.wrapSpread)} wrap spread`);
  if (math.sub2CashFlow != null) parts.push(`${money(math.sub2CashFlow)} leftover`);

  if (parts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur px-4 py-3 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.3)]">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500 font-semibold mb-1.5">Live terms</p>
      <div className="flex flex-wrap gap-1.5">
        {parts.map((part) => (
          <span
            key={part}
            className="inline-flex items-center rounded-full bg-black text-white px-2.5 py-1 text-[11px] font-semibold"
          >
            {part}
          </span>
        ))}
      </div>
    </div>
  );
}
