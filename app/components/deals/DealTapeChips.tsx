"use client";

import { tapeChips, type DealInput } from "../../lib/deals/calc";

export default function DealTapeChips({ input }: { input: DealInput }) {
  const chips = tapeChips(input);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-800"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
