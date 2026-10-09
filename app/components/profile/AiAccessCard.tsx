"use client";
import React, { useEffect, useState } from "react";
import { Bot, Copy, Check, Plus, Trash2, AlertTriangle } from "lucide-react";

type AiTokenMeta = {
  id: string;
  name: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
};

/**
 * "Connect your AI" — mirrors Prox's Add-to-AI flow.
 * Generates a personal AI token, shows the one-line paste for any AI
 * assistant, and lets the user revoke tokens.
 */
export default function AiAccessCard() {
  const [tokens, setTokens] = useState<AiTokenMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/tokens");
      const json = await res.json();
      if (json.success) setTokens(json.tokens);
      else setError(json.error || "Could not load AI tokens");
    } catch {
      setError("Could not load AI tokens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createToken = async () => {
    setCreating(true);
    setError(null);
    setFreshToken(null);
    try {
      const res = await fetch("/api/ai/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My AI" }),
      });
      const json = await res.json();
      if (json.success) {
        setFreshToken(json.token.plaintext);
        load();
      } else {
        setError(json.error || "Could not create token");
      }
    } catch {
      setError("Could not create token");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this AI token? Your AI will stop working with Loophole immediately.")) return;
    try {
      const res = await fetch(`/api/ai/tokens/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) load();
      else setError(json.error || "Could not revoke token");
    } catch {
      setError("Could not revoke token");
    }
  };

  const pasteLine = freshToken
    ? `Read https://creativeloophole.com/loophole.md and act as my Loophole deal finder. My Loophole AI token is: ${freshToken}`
    : "";

  const copyPasteLine = async () => {
    try {
      await navigator.clipboard.writeText(pasteLine);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed — select the text manually");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-gray-900">
            Connect your AI
          </h2>
          <p className="text-sm text-gray-600">
            Tell your AI your terms — it pulls matching deals from Loophole and
            can submit offers for you.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {freshToken && (
        <div className="mt-4 border border-amber-300 bg-amber-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-900 mb-1">
            Copy this now — it will never be shown again.
          </p>
          <p className="text-xs text-amber-800 mb-3">
            Paste the line below into any AI assistant (ChatGPT, Claude, Grok,
            Meta AI…). Anyone with this token can submit offers as you, up to
            20 per day.
          </p>
          <div className="bg-white border border-amber-200 rounded-lg p-3 text-xs text-gray-800 break-all font-mono">
            {pasteLine}
          </div>
          <button
            onClick={copyPasteLine}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy line"}
          </button>
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : tokens.length === 0 ? (
          <p className="text-sm text-gray-500">
            No AI tokens yet. Create one to connect your AI assistant.
          </p>
        ) : (
          <ul className="space-y-2">
            {tokens.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">
                    Created {new Date(t.created_at).toLocaleDateString()}
                    {t.last_used_at
                      ? ` · Last used ${new Date(t.last_used_at).toLocaleDateString()}`
                      : " · Never used"}
                  </p>
                </div>
                <button
                  onClick={() => revoke(t.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition"
                >
                  <Trash2 size={14} />
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={createToken}
        disabled={creating}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-50"
      >
        <Plus size={16} />
        {creating ? "Creating…" : "Create AI token"}
      </button>

      <p className="mt-3 text-xs text-gray-500">
        Your AI can search live deals and submit structured offers. Detailed
        negotiation stays in Loophole&apos;s end-to-end encrypted chat, which your
        AI cannot read.
      </p>
    </div>
  );
}
