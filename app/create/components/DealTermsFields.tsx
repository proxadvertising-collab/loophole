"use client";

import {
  ASSET_CLASSES,
  structuresForClass,
  securityLabel,
  type AssetClass,
  type DealStructure,
  type PaymentFreq,
  type TitleStatus,
} from "../../props/dealTerms";

type Identity = Record<string, string>;

interface DealTermsFieldsProps {
  assetClass: AssetClass | "";
  structure: DealStructure | "";
  purchasePrice: string;
  downPayment: string;
  amountFinanced: string;
  rate: string;
  termMonths: string;
  amortMonths: string;
  payment: string;
  paymentFreq: PaymentFreq;
  balloon: string;
  existingLienBalance: string;
  existingPayment: string;
  lienholder: string;
  titleStatus: TitleStatus | "";
  arv: string;
  repairs: string;
  monthlyRent: string;
  identity: Identity;
  onAssetClass: (value: AssetClass | "") => void;
  onStructure: (value: DealStructure | "") => void;
  onChange: (field: string, value: string) => void;
  onIdentity: (field: string, value: string) => void;
}

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
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <div>
    <label className="text-xs font-medium text-zinc-500 mb-1 block">{label}</label>
    <input
      type="text"
      className={inputClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default function DealTermsFields(props: DealTermsFieldsProps) {
  const structures = props.assetClass ? structuresForClass(props.assetClass) : [];
  const rolling = props.assetClass === "auto" || props.assetClass === "motorcycle" || props.assetClass === "powersports";
  const security = securityLabel(props.assetClass || null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Asset class</p>
        <div className="flex flex-wrap gap-2">
          {ASSET_CLASSES.map((item) => {
            const selected = props.assetClass === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => props.onAssetClass(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  selected
                    ? "bg-black text-white border-black"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {props.assetClass ? (
        <>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Structure</label>
            <select
              className={inputClass}
              value={props.structure}
              onChange={(e) => props.onStructure(e.target.value as DealStructure)}
              required
            >
              <option value="">Select structure</option>
              {structures.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {security ? (
              <p className="text-xs text-zinc-500 mt-2">
                Typical security (label only, not legal advice): {security}
              </p>
            ) : null}
            {props.structure === "cash" ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
                Cash is allowed, but Loophole is a terms marketplace. Financing is the listing — cash is not the default.
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-bold text-zinc-800 mb-2 uppercase tracking-wide">Terms</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label="Purchase price" value={props.purchasePrice} placeholder="$0" onChange={(v) => props.onChange("purchasePrice", v)} />
              <Field label="Down payment" value={props.downPayment} placeholder="$0" onChange={(v) => props.onChange("downPayment", v)} />
              <Field label="Amount financed" value={props.amountFinanced} placeholder="$0" onChange={(v) => props.onChange("amountFinanced", v)} />
              <Field label="Rate" value={props.rate} placeholder="0%" onChange={(v) => props.onChange("rate", v)} />
              <Field label="Term (months)" value={props.termMonths} placeholder="360" onChange={(v) => props.onChange("termMonths", v)} />
              <Field label="Amort (months)" value={props.amortMonths} placeholder="360" onChange={(v) => props.onChange("amortMonths", v)} />
              <Field label="Payment" value={props.payment} placeholder="$0" onChange={(v) => props.onChange("payment", v)} />
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">Payment freq</label>
                <select
                  className={inputClass}
                  value={props.paymentFreq}
                  onChange={(e) => props.onChange("paymentFreq", e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <Field label="Balloon" value={props.balloon} placeholder="$0 or yes" onChange={(v) => props.onChange("balloon", v)} />
              <Field label="Existing lien balance" value={props.existingLienBalance} placeholder="$0" onChange={(v) => props.onChange("existingLienBalance", v)} />
              <Field label="Existing payment" value={props.existingPayment} placeholder="$0" onChange={(v) => props.onChange("existingPayment", v)} />
              <Field label="Lienholder" value={props.lienholder} placeholder="Servicer / bank" onChange={(v) => props.onChange("lienholder", v)} />
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1 block">Title status</label>
                <select
                  className={inputClass}
                  value={props.titleStatus}
                  onChange={(e) => props.onChange("titleStatus", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="clear">Clear</option>
                  <option value="lien">Lien</option>
                  <option value="salvage">Salvage</option>
                  <option value="rebuilt">Rebuilt</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {props.assetClass === "real_estate" && (
            <div>
              <p className="text-sm font-bold text-zinc-800 mb-2 uppercase tracking-wide">Property numbers</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="ARV" value={props.arv} placeholder="$0" onChange={(v) => props.onChange("arv", v)} />
                <Field label="Repairs" value={props.repairs} placeholder="$0" onChange={(v) => props.onChange("repairs", v)} />
                <Field label="Monthly rent" value={props.monthlyRent} placeholder="$0" onChange={(v) => props.onChange("monthlyRent", v)} />
              </div>
            </div>
          )}

          {rolling && (
            <div>
              <p className="text-sm font-bold text-zinc-800 mb-2 uppercase tracking-wide">Vehicle identity</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="VIN" value={props.identity.vin || ""} onChange={(v) => props.onIdentity("vin", v)} />
                <Field label="Year" value={props.identity.year || ""} onChange={(v) => props.onIdentity("year", v)} />
                <Field label="Make" value={props.identity.make || ""} onChange={(v) => props.onIdentity("make", v)} />
                <Field label="Model" value={props.identity.model || ""} onChange={(v) => props.onIdentity("model", v)} />
                <Field label="Mileage / hours" value={props.identity.mileage_or_hours || ""} onChange={(v) => props.onIdentity("mileage_or_hours", v)} />
                <Field label="Title state" value={props.identity.title_state || ""} onChange={(v) => props.onIdentity("title_state", v)} />
              </div>
            </div>
          )}

          {props.assetClass === "rv" && (
            <div>
              <p className="text-sm font-bold text-zinc-800 mb-2 uppercase tracking-wide">RV identity</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="VIN" value={props.identity.vin || ""} onChange={(v) => props.onIdentity("vin", v)} />
                <Field label="Year" value={props.identity.year || ""} onChange={(v) => props.onIdentity("year", v)} />
                <Field label="Make" value={props.identity.make || ""} onChange={(v) => props.onIdentity("make", v)} />
                <Field label="Model" value={props.identity.model || ""} onChange={(v) => props.onIdentity("model", v)} />
                <Field label="Mileage / hours" value={props.identity.mileage_or_hours || ""} onChange={(v) => props.onIdentity("mileage_or_hours", v)} />
                <Field label="Title state" value={props.identity.title_state || ""} onChange={(v) => props.onIdentity("title_state", v)} />
                <Field label="Generator hours" value={props.identity.gen_hours || ""} onChange={(v) => props.onIdentity("gen_hours", v)} />
                <Field label="Slides" value={props.identity.slides || ""} placeholder="yes / no" onChange={(v) => props.onIdentity("slides", v)} />
              </div>
            </div>
          )}

          {props.assetClass === "watercraft" && (
            <div>
              <p className="text-sm font-bold text-zinc-800 mb-2 uppercase tracking-wide">Watercraft identity</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="HIN" value={props.identity.hin || ""} onChange={(v) => props.onIdentity("hin", v)} />
                <Field label="Year" value={props.identity.year || ""} onChange={(v) => props.onIdentity("year", v)} />
                <Field label="Make" value={props.identity.make || ""} onChange={(v) => props.onIdentity("make", v)} />
                <Field label="Model" value={props.identity.model || ""} onChange={(v) => props.onIdentity("model", v)} />
                <Field label="Engine hours" value={props.identity.engine_hours || ""} onChange={(v) => props.onIdentity("engine_hours", v)} />
                <Field label="Trailer VIN" value={props.identity.trailer_vin || ""} onChange={(v) => props.onIdentity("trailer_vin", v)} />
              </div>
            </div>
          )}

          {props.assetClass === "business" && (
            <div>
              <p className="text-sm font-bold text-zinc-800 mb-2 uppercase tracking-wide">Business identity</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Entity name" value={props.identity.entity_name || ""} onChange={(v) => props.onIdentity("entity_name", v)} />
                <Field label="NAICS / category" value={props.identity.naics_or_category || ""} onChange={(v) => props.onIdentity("naics_or_category", v)} />
                <Field label="SDE / cash flow" value={props.identity.sde_or_cashflow || ""} onChange={(v) => props.onIdentity("sde_or_cashflow", v)} />
                <Field label="Asset vs stock" value={props.identity.asset_vs_stock || ""} onChange={(v) => props.onIdentity("asset_vs_stock", v)} />
                <Field label="Asking multiple" value={props.identity.asking_multiple || ""} onChange={(v) => props.onIdentity("asking_multiple", v)} />
                <Field label="Employees" value={props.identity.employees || ""} onChange={(v) => props.onIdentity("employees", v)} />
                <Field label="Includes real estate" value={props.identity.includes_real_estate || ""} placeholder="yes / no" onChange={(v) => props.onIdentity("includes_real_estate", v)} />
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-zinc-500">Pick an asset class to enter terms. Financing is the listing.</p>
      )}
    </div>
  );
}
