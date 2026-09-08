"use client";

import DealWorkbench from "../../components/deals/DealWorkbench";

export default function CalculatorPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-76px)]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Tools</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 mt-1">Numbers</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
          Terms over price. Three engines — real estate, vehicles &amp; craft, business. Missing fields stay blank. We
          never invent tax, insurance, SDE, or PITI.
        </p>
        <div className="mt-8">
          <DealWorkbench />
        </div>
      </div>
    </div>
  );
}
