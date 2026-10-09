"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthGuard } from "../lib/hooks/useAuthGuard";
import { useRouter } from "next/navigation";
import { Handshake, Inbox, Send, Check, X, Undo2 } from "lucide-react";
import NotLoggedIn from "../../components/globals/NotLoggedIn";

type OfferTerms = {
  price?: number | null;
  down_payment?: number | null;
  interest_rate?: number | null;
  term_months?: number | null;
  balloon?: number | null;
  monthly_payment?: number | null;
  message?: string;
  via_ai?: boolean;
};

type Offer = {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_price: number | null;
  counterparty: string;
  status: string;
  offer: OfferTerms;
  created_at: string;
};

function fmtMoney(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return "$" + Number(v).toLocaleString();
}

function OfferCard({
  offer,
  role,
  onAction,
}: {
  offer: Offer;
  role: "received" | "sent";
  onAction: (id: string, action: string) => void;
}) {
  const t = offer.offer || {};
  const pending = offer.status === "pending";
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Link
            href={`/listing/${offer.listing_id}`}
            className="font-bold text-gray-900 hover:underline"
          >
            {offer.listing_title}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">
            {role === "received" ? "From" : "To"} {offer.counterparty}
            {t.via_ai ? " · via AI" : ""} ·{" "}
            {new Date(offer.created_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
            offer.status === "pending"
              ? "bg-amber-100 text-amber-800"
              : offer.status === "accepted"
              ? "bg-green-100 text-green-800"
              : offer.status === "declined"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {offer.status}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-3">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[11px] text-gray-500">Offer price</p>
          <p className="font-semibold">{fmtMoney(t.price)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[11px] text-gray-500">Down</p>
          <p className="font-semibold">{fmtMoney(t.down_payment)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[11px] text-gray-500">Monthly</p>
          <p className="font-semibold">{fmtMoney(t.monthly_payment)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[11px] text-gray-500">Rate</p>
          <p className="font-semibold">
            {t.interest_rate !== null && t.interest_rate !== undefined
              ? `${t.interest_rate}%`
              : "—"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[11px] text-gray-500">Term</p>
          <p className="font-semibold">
            {t.term_months ? `${t.term_months} mo` : "—"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-[11px] text-gray-500">Balloon</p>
          <p className="font-semibold">{fmtMoney(t.balloon)}</p>
        </div>
      </div>

      {t.message && (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3 whitespace-pre-line">
          “{t.message}”
        </p>
      )}

      {pending && role === "received" && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAction(offer.id, "accepted")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
          >
            <Check size={15} /> Accept
          </button>
          <button
            onClick={() => onAction(offer.id, "countered")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
          >
            Counter
          </button>
          <button
            onClick={() => onAction(offer.id, "declined")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
          >
            <X size={15} /> Decline
          </button>
        </div>
      )}
      {pending && role === "sent" && (
        <button
          onClick={() => onAction(offer.id, "withdraw")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
        >
          <Undo2 size={15} /> Withdraw
        </button>
      )}
      {!pending && (
        <Link
          href="/messages"
          className="text-sm font-medium text-gray-900 underline underline-offset-2"
        >
          Continue in encrypted chat →
        </Link>
      )}
    </div>
  );
}

export default function OffersClient() {
  const { user, loading: authLoading } = useAuthGuard();
  const router = useRouter();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [received, setReceived] = useState<Offer[]>([]);
  const [sent, setSent] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/offers");
      const json = await res.json();
      if (json.success) {
        setReceived(json.received);
        setSent(json.sent);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const handleAction = async (id: string, action: string) => {
    const labels: Record<string, string> = {
      accepted: "accept",
      declined: "decline",
      countered: "mark as countered",
      withdraw: "withdraw",
    };
    if (!confirm(`Are you sure you want to ${labels[action]} this offer?`))
      return;
    try {
      const res = await fetch(`/api/ai/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) load();
      else alert(json.error || "Could not update the offer");
    } catch {
      alert("Could not update the offer");
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading…
      </div>
    );
  }
  if (!user) return <NotLoggedIn />;

  const list = tab === "received" ? received : sent;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          <Handshake size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Offers
          </h1>
          <p className="text-sm text-gray-600">
            Structured offers on your deals. Negotiation details stay in
            encrypted chat.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("received")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === "received"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Inbox size={15} /> Received ({received.length})
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
            tab === "sent"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Send size={15} /> Sent ({sent.length})
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading offers…</p>
      ) : list.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-500 text-sm">
            {tab === "received"
              ? "No offers yet. When a buyer — or their AI — makes an offer on your listing, it lands here."
              : "You haven't made any offers yet."}
          </p>
          {tab === "sent" && (
            <button
              onClick={() => router.push("/browse")}
              className="mt-4 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition"
            >
              Browse deals
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <OfferCard
              key={o.id}
              offer={o}
              role={tab}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
