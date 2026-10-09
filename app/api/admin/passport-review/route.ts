import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '../../../lib/auth/requireAdminSession';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Admin review of Deal Passport items.
 * Body: { kind: 'pof' | 'deal', id: string (userId for pof, deal id for deal),
 *         approve: boolean, reason?: string }
 * Legal boundary: approving confirms a document was reviewed — not an
 * endorsement of any person or deal.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const { kind, id, approve, reason } = body;

    if (!['pof', 'deal'].includes(kind) || typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }
    if (typeof approve !== 'boolean') {
      return NextResponse.json({ success: false, error: 'approve must be boolean' }, { status: 400 });
    }

    if (kind === 'pof') {
      const patch = approve
        ? {
            pof_status: 'verified',
            pof_verified_at: new Date().toISOString(),
            pof_rejection_reason: null,
            updated_at: new Date().toISOString(),
          }
        : {
            pof_status: 'rejected',
            pof_rejection_reason: (reason || 'Document could not be verified.').slice(0, 500),
            updated_at: new Date().toISOString(),
          };
      const { error } = await supabaseAdmin.from('buyer_passports').update(patch).eq('user_id', id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('passport_deals')
        .update({ status: approve ? 'verified' : 'rejected' })
        .eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Passport review error', error);
    return NextResponse.json({ success: false, error: 'Review failed' }, { status: 500 });
  }
}

/** Pending review queue: POF submissions + claimed deals awaiting verification. */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ('error' in auth) return auth.error;

    const { data: pofs } = await supabaseAdmin
      .from('buyer_passports')
      .select('user_id, pof_document_url, pof_submitted_at, users!inner(display_name, email)')
      .eq('pof_status', 'pending')
      .order('pof_submitted_at', { ascending: true });

    const { data: deals } = await supabaseAdmin
      .from('passport_deals')
      .select('id, user_id, title, asset_class, structure, closed_at, created_at, users!inner(display_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    return NextResponse.json({ success: true, pofs: pofs || [], deals: deals || [] });
  } catch (error) {
    console.error('Passport queue error', error);
    return NextResponse.json({ success: false, error: 'Failed to load queue' }, { status: 500 });
  }
}
