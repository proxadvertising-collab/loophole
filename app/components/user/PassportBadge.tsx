"use client";
import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface PassportSummaryData {
  pof_status: string;
  deals_closed: number;
  response_rate: number | null;
}

/**
 * Deal Passport badge. Shows verification state at a glance.
 * Legal boundary: "verified" means a document was reviewed — it is not an
 * endorsement of any person or deal by Loophole.
 */
export const PassportBadge: React.FC<{ userId: string; compact?: boolean }> = ({
  userId,
  compact = false,
}) => {
  const [data, setData] = useState<PassportSummaryData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/passport/${userId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j.success) {
          setData({
            pof_status: j.pof_status,
            deals_closed: j.deals_closed,
            response_rate: j.response_rate,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!data) return null;
  const verified = data.pof_status === "verified";

  if (compact) {
    if (!verified && data.deals_closed === 0) return null;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600">
        {verified && (
          <span className="inline-flex items-center gap-0.5 text-emerald-700">
            <ShieldCheck size={13} /> Verified
          </span>
        )}
        {data.deals_closed > 0 && (
          <span className="text-zinc-500">
            · {data.deals_closed} deal{data.deals_closed === 1 ? "" : "s"} closed
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          verified ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-500"
        }`}
        title={
          verified
            ? "Proof of funds reviewed by Loophole. This is document verification only — not an endorsement of any person or deal."
            : "No verified proof of funds on file."
        }
      >
        <ShieldCheck size={14} />
        {verified ? "Verified Buyer" : "Unverified"}
      </span>
      {data.deals_closed > 0 && (
        <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
          {data.deals_closed} closed
        </span>
      )}
      {data.response_rate !== null && (
        <span className="text-xs font-medium text-zinc-500">
          Responds {Math.round(data.response_rate * 100)}% of the time
        </span>
      )}
    </div>
  );
};

export default PassportBadge;
