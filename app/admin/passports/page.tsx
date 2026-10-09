"use client";
import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, Clock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

interface PofItem {
  user_id: string;
  pof_document_url: string;
  pof_submitted_at: string;
  users: { display_name: string; email: string };
}

interface DealItem {
  id: string;
  user_id: string;
  title: string;
  asset_class: string | null;
  structure: string | null;
  closed_at: string | null;
  created_at: string;
  users: { display_name: string; email: string };
}

/**
 * Deal Passport review queue.
 * Legal boundary: approving confirms a document was reviewed — not an
 * endorsement of any person or deal.
 */
const AdminPassportsPage = () => {
  const { user } = useAuth();
  const [pofs, setPofs] = useState<PofItem[]>([]);
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/passport-review');
      const j = await res.json();
      if (j.success) {
        setPofs(j.pofs);
        setDeals(j.deals);
      } else {
        toast.error('Failed to load review queue');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const review = async (kind: 'pof' | 'deal', id: string, approve: boolean) => {
    const reason = rejectReason[id] || '';
    if (!approve && kind === 'pof' && !reason.trim()) {
      toast.error('Please give a rejection reason.');
      return;
    }
    try {
      const res = await fetch('/api/admin/passport-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, id, approve, reason }),
      });
      const j = await res.json();
      if (j.success) {
        toast.success(approve ? 'Approved.' : 'Rejected.');
        fetchQueue();
      } else {
        toast.error(j.error || 'Review failed.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Review failed.');
    }
  };

  if (!user) return null;

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="p-6">
        <h1 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2">
          <ShieldCheck size={24} /> Deal Passport Reviews
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Review confirms a document was seen — never an endorsement of any person or deal.
        </p>

        {loading ? (
          <p className="text-zinc-500">Loading queue…</p>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">Proof of funds ({pofs.length})</h2>
            {pofs.length === 0 ? (
              <p className="text-sm text-zinc-500 mb-8">Nothing pending.</p>
            ) : (
              <div className="space-y-3 mb-10">
                {pofs.map((p) => (
                  <div key={p.user_id} className="border border-zinc-200 rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-semibold text-sm">{p.users.display_name || p.users.email}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock size={12} /> Submitted {new Date(p.pof_submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => review('pof', p.user_id, true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={13} /> Verify
                        </button>
                        <button
                          onClick={() => review('pof', p.user_id, false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={rejectReason[p.user_id] || ''}
                      onChange={(e) => setRejectReason((prev) => ({ ...prev, [p.user_id]: e.target.value }))}
                      placeholder="Rejection reason (required to reject)"
                      className="mt-3 w-full border border-zinc-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                    />
                    <p className="text-xs text-zinc-400 mt-2">
                      Document: <code className="bg-zinc-100 px-1 rounded">{p.pof_document_url}</code>
                      <span className="ml-2">(open in the Supabase dashboard storage browser)</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            <h2 className="text-lg font-bold mb-4">Claimed closed deals ({deals.length})</h2>
            {deals.length === 0 ? (
              <p className="text-sm text-zinc-500">Nothing pending.</p>
            ) : (
              <div className="space-y-3">
                {deals.map((d) => (
                  <div key={d.id} className="border border-zinc-200 rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-semibold text-sm">{d.title}</p>
                        <p className="text-xs text-zinc-500">
                          {d.users.display_name || d.users.email}
                          {[d.structure, d.closed_at].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/profile/${d.user_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-zinc-300 text-xs font-bold hover:bg-zinc-100"
                        >
                          <ExternalLink size={13} /> Profile
                        </a>
                        <button
                          onClick={() => review('deal', d.id, true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={13} /> Verify
                        </button>
                        <button
                          onClick={() => review('deal', d.id, false)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPassportsPage;
