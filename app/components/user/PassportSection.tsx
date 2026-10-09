"use client";
import React, { useEffect, useState, useRef } from "react";
import { ShieldCheck, Upload, Plus, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { PassportService, PassportSummary, PassportDeal } from "../../lib/database/PassportService";
import { PassportBadge } from "./PassportBadge";

const STATUS_COPY: Record<string, { label: string; className: string }> = {
  none: { label: "Not submitted", className: "bg-zinc-100 text-zinc-500" },
  pending: { label: "Under review", className: "bg-amber-100 text-amber-800" },
  verified: { label: "Verified", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Not verified", className: "bg-red-100 text-red-700" },
};

/**
 * Deal Passport section for profile pages.
 * - editable=true (own profile): POF upload, deal tracking, status.
 * - editable=false (public profile): read-only reputation view.
 */
export const PassportSection: React.FC<{ userId: string; editable: boolean }> = ({
  userId,
  editable,
}) => {
  const [summary, setSummary] = useState<PassportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealStructure, setDealStructure] = useState("");
  const [dealClosedAt, setDealClosedAt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const s = await PassportService.getPassport(userId);
    setSummary(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await PassportService.submitPOF(userId, file);
    setUploading(false);
    if (res.success) {
      toast.success("Proof of funds submitted for review.");
      load();
    } else {
      toast.error(res.error || "Upload failed.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAddDeal = async () => {
    const res = await PassportService.addDeal(userId, {
      title: dealTitle,
      structure: dealStructure || undefined,
      closed_at: dealClosedAt || undefined,
    });
    if (res.success) {
      toast.success("Deal added — pending verification.");
      setDealTitle("");
      setDealStructure("");
      setDealClosedAt("");
      setShowDealForm(false);
      load();
    } else {
      toast.error(res.error || "Could not save.");
    }
  };

  const handleRemoveDeal = async (dealId: string) => {
    if (await PassportService.removeDeal(userId, dealId)) {
      toast.success("Deal removed.");
      load();
    } else {
      toast.error("Could not remove.");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  const pofStatus = summary?.passport?.pof_status || "none";
  const status = STATUS_COPY[pofStatus];
  const deals: PassportDeal[] = summary?.deals || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
          <ShieldCheck size={20} />
          Deal Passport
        </h2>
        <PassportBadge userId={userId} />
      </div>

      <p className="text-xs text-zinc-500 mb-6">
        Document-based buyer reputation. Verification confirms a proof-of-funds document was reviewed —
        it is not an endorsement of any person or deal, and Loophole is never a party to a transaction.
      </p>

      {/* Proof of funds */}
      <div className="border border-zinc-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900">Proof of funds</h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.className}`}>
            {status.label}
          </span>
        </div>
        {pofStatus === "rejected" && summary?.passport?.pof_rejection_reason && (
          <p className="text-xs text-red-600 mb-2">{summary.passport.pof_rejection_reason}</p>
        )}
        {pofStatus === "verified" && summary?.passport?.pof_verified_at && (
          <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Verified {new Date(summary.passport.pof_verified_at).toLocaleDateString()}
          </p>
        )}
        {editable && pofStatus !== "pending" && (
          <div>
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? "Uploading…" : pofStatus === "none" ? "Upload proof of funds" : "Re-upload proof of funds"}
            </button>
            <p className="text-xs text-zinc-500 mt-2">
              Bank statement, POF letter, or brokerage screenshot. PDF or image, under 10&nbsp;MB. Only you and Loophole admins can see it.
            </p>
          </div>
        )}
        {editable && pofStatus === "pending" && (
          <p className="text-xs text-amber-700 flex items-center gap-1">
            <Clock size={13} /> Under review — usually within 48 hours.
          </p>
        )}
      </div>

      {/* Closed deals */}
      <div className="border border-zinc-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">
            Closed deals {deals.length > 0 && <span className="text-zinc-500 font-medium">({deals.length})</span>}
          </h3>
          {editable && (
            <button
              onClick={() => setShowDealForm(!showDealForm)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-black"
            >
              <Plus size={14} /> Add a closed deal
            </button>
          )}
        </div>

        {editable && showDealForm && (
          <div className="grid gap-2 sm:grid-cols-2 mb-4 p-3 bg-zinc-50 rounded-xl">
            <input
              type="text"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              placeholder="e.g. Subto 3/2 — Phoenix"
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              value={dealStructure}
              onChange={(e) => setDealStructure(e.target.value)}
              placeholder="Structure (optional)"
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <input
              type="date"
              value={dealClosedAt}
              onChange={(e) => setDealClosedAt(e.target.value)}
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={handleAddDeal}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition"
            >
              Save deal
            </button>
          </div>
        )}

        {deals.length === 0 ? (
          <p className="text-xs text-zinc-500">
            {editable ? "No closed deals tracked yet. Add the deals you've closed — verified ones build your reputation." : "No tracked closed deals yet."}
          </p>
        ) : (
          <ul className="space-y-2">
            {deals.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-zinc-900 truncate block">{d.title}</span>
                  <span className="text-xs text-zinc-500">
                    {[d.structure, d.closed_at ? new Date(d.closed_at).toLocaleDateString() : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.status === "verified" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  ) : d.status === "rejected" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                      <XCircle size={13} /> Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                      <Clock size={13} /> Pending
                    </span>
                  )}
                  {editable && (
                    <button
                      onClick={() => handleRemoveDeal(d.id)}
                      className="text-zinc-400 hover:text-red-600 transition"
                      aria-label="Remove deal"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {summary?.responseRate !== null && summary?.responseRate !== undefined && (
        <p className="text-xs text-zinc-500 mt-4">
          Responds to {Math.round(summary.responseRate * 100)}% of inbound messages.
        </p>
      )}
    </div>
  );
};

export default PassportSection;
