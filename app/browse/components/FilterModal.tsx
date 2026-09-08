import React from 'react';
import { CalendarDays, DollarSign, XCircle } from 'lucide-react';

interface FilterModalProps {
  minPriceValue: string;
  maxPriceValue: string;
  postedAfterValue: string;
  postedBeforeValue: string;
  minPriceLimit: number;
  setMinPriceValue: (v: string) => void;
  setMaxPriceValue: (v: string) => void;
  setPostedAfterValue: (v: string) => void;
  setPostedBeforeValue: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  onCancel: () => void;
  showCustomRange: boolean;
  setShowCustomRange: (value: boolean) => void;
  minDownValue?: string;
  maxDownValue?: string;
  minPaymentValue?: string;
  maxPaymentValue?: string;
  minRateValue?: string;
  maxRateValue?: string;
  minTermValue?: string;
  maxTermValue?: string;
  structureValue?: string;
  structureOptions?: { id: string; label: string }[];
  setMinDownValue?: (v: string) => void;
  setMaxDownValue?: (v: string) => void;
  setMinPaymentValue?: (v: string) => void;
  setMaxPaymentValue?: (v: string) => void;
  setMinRateValue?: (v: string) => void;
  setMaxRateValue?: (v: string) => void;
  setMinTermValue?: (v: string) => void;
  setMaxTermValue?: (v: string) => void;
  setStructureValue?: (v: string) => void;
  assetClass?: string;
  yearValue?: string;
  makeValue?: string;
  setYearValue?: (v: string) => void;
  setMakeValue?: (v: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  minPriceValue,
  maxPriceValue,
  postedAfterValue,
  postedBeforeValue,
  minPriceLimit,
  setMinPriceValue,
  setMaxPriceValue,
  setPostedAfterValue,
  setPostedBeforeValue,
  onApply,
  onClear,
  onCancel,
  showCustomRange,
  setShowCustomRange,
  minDownValue = "",
  maxDownValue = "",
  minPaymentValue = "",
  maxPaymentValue = "",
  minRateValue = "",
  maxRateValue = "",
  minTermValue = "",
  maxTermValue = "",
  structureValue = "",
  structureOptions = [],
  setMinDownValue,
  setMaxDownValue,
  setMinPaymentValue,
  setMaxPaymentValue,
  setMinRateValue,
  setMaxRateValue,
  setMinTermValue,
  setMaxTermValue,
  setStructureValue,
  assetClass = "",
  yearValue = "",
  makeValue = "",
  setYearValue,
  setMakeValue,
}) => {
  const datePresets = [
    { label: 'Any time', days: null },
    { label: '24h', days: 1 },
    { label: '7d', days: 7 },
    { label: '30d', days: 30 },
  ];

  const setDatePreset = (days: number | null) => {
    if (!days) {
      setPostedAfterValue('');
      setPostedBeforeValue('');
      return;
    }
    const after = new Date();
    after.setDate(after.getDate() - days);
    setPostedAfterValue(after.toISOString().slice(0, 10));
    setPostedBeforeValue('');
  };

  const isDatePresetActive = (days: number | null) => {
    if (!days) {
      return !postedAfterValue && !postedBeforeValue;
    }
    const expected = new Date();
    expected.setDate(expected.getDate() - days);
    return postedAfterValue === expected.toISOString().slice(0, 10) && !postedBeforeValue;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 w-full">
    <div className="flex items-center justify-between mb-3">
      <div className="text-xs font-semibold text-gray-700">Filters</div>
      <button
        className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1"
        onClick={onClear}
      >
        <XCircle size={14}/> Reset
      </button>
    </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr] items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <DollarSign size={14}/> Price
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={minPriceLimit}
              className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none"
              value={minPriceValue}
              onChange={e => setMinPriceValue(e.target.value)}
              placeholder={`Min $${minPriceLimit}`}
            />
            <input
              type="number"
              min={minPriceLimit}
              className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none"
              value={maxPriceValue}
              onChange={e => setMaxPriceValue(e.target.value)}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-gray-700">Down / payment / rate / term</div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={minDownValue} onChange={(e) => setMinDownValue?.(e.target.value)} placeholder="Min down" />
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={maxDownValue} onChange={(e) => setMaxDownValue?.(e.target.value)} placeholder="Max down" />
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={minPaymentValue} onChange={(e) => setMinPaymentValue?.(e.target.value)} placeholder="Min payment" />
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={maxPaymentValue} onChange={(e) => setMaxPaymentValue?.(e.target.value)} placeholder="Max payment" />
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={minRateValue} onChange={(e) => setMinRateValue?.(e.target.value)} placeholder="Min rate %" />
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={maxRateValue} onChange={(e) => setMaxRateValue?.(e.target.value)} placeholder="Max rate %" />
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={minTermValue} onChange={(e) => setMinTermValue?.(e.target.value)} placeholder="Min term mo" />
            <input type="number" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={maxTermValue} onChange={(e) => setMaxTermValue?.(e.target.value)} placeholder="Max term mo" />
          </div>
          <select
            className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none"
            value={structureValue}
            onChange={(e) => setStructureValue?.(e.target.value)}
          >
            <option value="">Any structure</option>
            {structureOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>

        {(assetClass === "auto" || assetClass === "motorcycle" || assetClass === "powersports" || assetClass === "rv" || assetClass === "watercraft") && (
          <div className="flex flex-col gap-2 lg:col-span-2">
            <div className="text-xs font-semibold text-gray-700">Class filters</div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={yearValue} onChange={(e) => setYearValue?.(e.target.value)} placeholder="Year" />
              <input type="text" className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none" value={makeValue} onChange={(e) => setMakeValue?.(e.target.value)} placeholder="Make" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <CalendarDays size={14}/> Date posted
          </div>
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDatePreset(preset.days)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  isDatePresetActive(preset.days)
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCustomRange(!showCustomRange)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                showCustomRange
                  ? 'bg-black text-white border-black'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Custom range
            </button>
          </div>
          {showCustomRange && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none"
                value={postedAfterValue}
                onChange={e => setPostedAfterValue(e.target.value)}
              />
              <input
                type="date"
                className="w-full border border-gray-200 rounded-full px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-black outline-none"
                value={postedBeforeValue}
                onChange={e => setPostedBeforeValue(e.target.value)}
              />
            </div>
          )}
        </div>
    </div>

    <div className="flex justify-end gap-2 mt-4">
      <button
        className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs font-semibold"
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        className="px-4 py-2 rounded-full bg-black text-white hover:bg-zinc-800 text-xs font-semibold"
        onClick={onApply}
      >
        Apply
      </button>
    </div>
  </div>
);
};

export default FilterModal; 
