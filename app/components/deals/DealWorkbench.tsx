"use client";

import { useMemo, useState } from "react";
import {
  buildTape,
  engineKind,
  workbenchAmort,
  type DealInput,
} from "../../lib/deals/calc";
import DealTapeChips from "./DealTapeChips";
import type { AssetClass, PaymentFreq } from "../../props/dealTerms";

type Tab = "realEstate" | "rollingStock" | "business";

const TABS: { id: Tab; label: string; asset: AssetClass }[] = [
  { id: "realEstate", label: "Real Estate", asset: "real_estate" },
  { id: "rollingStock", label: "Vehicles & Craft", asset: "auto" },
  { id: "business", label: "Business", asset: "business" },
];

const inputClass =
  "w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white";

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <label className="block">
    <span className="text-[11px] font-medium text-zinc-500 mb-1 block">{label}</span>
    <input className={inputClass} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </label>
);

const num = (value: string): number | null => {
  if (!value.trim()) return null;
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const money = (n: number | null | undefined) =>
  n == null || !Number.isFinite(n) ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;

const fromInput = (input?: DealInput | null): Record<string, string> => ({
  purchase_price: input?.purchase_price != null ? String(input.purchase_price) : "",
  down_payment: input?.down_payment != null ? String(input.down_payment) : "",
  amount_financed: input?.amount_financed != null ? String(input.amount_financed) : "",
  rate: input?.rate != null ? String(input.rate) : "",
  term_months: input?.term_months != null ? String(input.term_months) : "",
  amort_months: input?.amort_months != null ? String(input.amort_months) : "",
  balloon: typeof input?.balloon === "number" ? String(input.balloon) : "",
  existing_lien_balance: input?.existing_lien_balance != null ? String(input.existing_lien_balance) : "",
  existing_payment: input?.existing_payment != null ? String(input.existing_payment) : "",
  sde: input?.sde != null ? String(input.sde) : "",
  structure: input?.structure ? String(input.structure) : "",
});

export default function DealWorkbench({
  initial,
}: {
  initial?: DealInput | null;
}) {
  const startKind = engineKind(initial?.asset_class);
  const [tab, setTab] = useState<Tab>(startKind);
  const [fields, setFields] = useState(() => fromInput(initial));
  const [freq, setFreq] = useState<PaymentFreq>(initial?.payment_freq || "monthly");
  const [buyerDown, setBuyerDown] = useState("");
  const [targetPayment, setTargetPayment] = useState("");

  const setField = (key: string, value: string) => setFields((prev) => ({ ...prev, [key]: value }));

  const deal: DealInput = useMemo(() => {
    const asset = TABS.find((item) => item.id === tab)?.asset || "real_estate";
    return {
      asset_class: asset,
      structure: fields.structure || initial?.structure || null,
      purchase_price: num(fields.purchase_price),
      down_payment: num(fields.down_payment),
      amount_financed: num(fields.amount_financed),
      rate: num(fields.rate),
      term_months: num(fields.term_months),
      amort_months: num(fields.amort_months),
      balloon: num(fields.balloon),
      existing_lien_balance: num(fields.existing_lien_balance),
      existing_payment: num(fields.existing_payment),
      sde: num(fields.sde),
      payment_freq: freq,
      payment: initial?.payment ?? null,
    };
  }, [tab, fields, freq, initial?.structure, initial?.payment]);

  const tape = buildTape(deal);
  const amort = workbenchAmort(deal);
  const myDown = num(buyerDown);
  const myPmt = num(targetPayment);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur shadow-[0_12px_30px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="border-b border-zinc-100 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold">Numbers</p>
          <h2 className="text-lg font-black tracking-tight text-zinc-900">Deal workbench</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                tab === item.id ? "bg-black text-white border-black" : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] p-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Terms</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase price" value={fields.purchase_price} onChange={(v) => setField("purchase_price", v)} placeholder="0" />
            <Field label="Down" value={fields.down_payment} onChange={(v) => setField("down_payment", v)} placeholder="0" />
            <Field label="Amount financed" value={fields.amount_financed} onChange={(v) => setField("amount_financed", v)} placeholder="optional" />
            <Field label="Rate % (annual)" value={fields.rate} onChange={(v) => setField("rate", v)} placeholder="6.5" />
            <Field label="Term (months)" value={fields.term_months} onChange={(v) => setField("term_months", v)} placeholder="360" />
            <Field label="Amort (months)" value={fields.amort_months} onChange={(v) => setField("amort_months", v)} placeholder="360" />
            <Field label="Balloon $" value={fields.balloon} onChange={(v) => setField("balloon", v)} placeholder="optional" />
            <label className="block">
              <span className="text-[11px] font-medium text-zinc-500 mb-1 block">Payment freq</span>
              <select className={inputClass} value={freq} onChange={(e) => setFreq(e.target.value as PaymentFreq)}>
                <option value="monthly">Monthly</option>
                <option value="biweekly">Biweekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
            {tab === "realEstate" && (
              <>
                <Field label="Existing lien balance" value={fields.existing_lien_balance} onChange={(v) => setField("existing_lien_balance", v)} />
                <Field label="Existing payment" value={fields.existing_payment} onChange={(v) => setField("existing_payment", v)} />
              </>
            )}
            {tab === "business" && (
              <Field label="SDE / cash flow (annual)" value={fields.sde} onChange={(v) => setField("sde", v)} placeholder="only if known" />
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">My money (does not change the listing)</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="My down" value={buyerDown} onChange={setBuyerDown} placeholder="optional" />
              <Field label="Target payment / mo" value={targetPayment} onChange={setTargetPayment} placeholder="optional" />
            </div>
            {(myDown != null || myPmt != null) && (
              <p className="text-xs text-zinc-600 mt-2">
                {myDown != null && tape.cashIn != null && (
                  <span className="mr-3">Down vs tape: {money(myDown - tape.cashIn)}</span>
                )}
                {myPmt != null && tape.payment != null && (
                  <span>Payment vs tape: {money(myPmt - tape.payment)}</span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Live tape</p>
          <DealTapeChips input={deal} />
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-[11px] text-zinc-500">Payment</dt>
              <dd className="font-black text-zinc-900">{money(tape.payment)}{tape.payment != null ? "/mo" : ""}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-zinc-500">Cash-in</dt>
              <dd className="font-black text-zinc-900">{money(tape.cashIn)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-zinc-500">Total interest</dt>
              <dd className="font-black text-zinc-900">{money(amort.totalInterest)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-zinc-500">Balloon leftover</dt>
              <dd className="font-black text-zinc-900">{money(amort.balloonLeftover)}</dd>
            </div>
            {tape.spread != null && (
              <div>
                <dt className="text-[11px] text-zinc-500">Wrap spread</dt>
                <dd className="font-black text-zinc-900">{money(tape.spread)}</dd>
              </div>
            )}
            {tape.equity != null && (
              <div>
                <dt className="text-[11px] text-zinc-500">Day-1 equity</dt>
                <dd className="font-black text-zinc-900">{money(tape.equity)}</dd>
              </div>
            )}
            {tape.balloonPct != null && (
              <div>
                <dt className="text-[11px] text-zinc-500">Balloon %</dt>
                <dd className="font-black text-zinc-900">{Math.round(tape.balloonPct * 100)}%</dd>
              </div>
            )}
            {tape.coverage != null && (
              <div>
                <dt className="text-[11px] text-zinc-500">Coverage</dt>
                <dd className="font-black text-zinc-900">{tape.coverage.toFixed(2)}x</dd>
              </div>
            )}
          </dl>
          <p className="text-[11px] text-zinc-500">Missing fields are omitted. Tax, insurance, and PITI are never invented.</p>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-5 py-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">First 12 payments</p>
        {amort.first12.length === 0 ? (
          <p className="text-sm text-zinc-500">Need principal, rate, and term to build a schedule.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-zinc-500">
                <tr>
                  <th className="py-1 font-medium">#</th>
                  <th className="py-1 font-medium">Interest</th>
                  <th className="py-1 font-medium">Principal</th>
                  <th className="py-1 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {amort.first12.map((row) => (
                  <tr key={row.n} className="border-t border-zinc-100">
                    <td className="py-1">{row.n}</td>
                    <td className="py-1">{money(row.interest)}</td>
                    <td className="py-1">{money(row.principal)}</td>
                    <td className="py-1">{money(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm flex justify-between">
          <span className="text-zinc-500">Balloon row</span>
          <span className="font-black text-zinc-900">{money(amort.balloonLeftover)}</span>
        </div>
      </div>
    </div>
  );
}
