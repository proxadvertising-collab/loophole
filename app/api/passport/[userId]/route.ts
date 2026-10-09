import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
 * Public Deal Passport summary for badges.
 * Exposes only: POF status, deal counts, response rate. Never document URLs.
 * Legal boundary: verification is document-based; not an endorsement of any
 * person or deal.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const { data: passport } = await supabaseAdmin
      .from('buyer_passports')
      .select('pof_status, pof_verified_at')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: deals } = await supabaseAdmin
      .from('passport_deals')
      .select('id,status')
      .eq('user_id', userId);

    const { data: inbound } = await supabaseAdmin
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', userId)
      .limit(2000);

    let responseRate: number | null = null;
    const senders = [...new Set(((inbound as { sender_id: string }[]) || []).map((m) => m.sender_id))];
    if (senders.length > 0) {
      const { data: outbound } = await supabaseAdmin
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', userId)
        .in('receiver_id', senders);
      const repliedTo = new Set(((outbound as { receiver_id: string }[]) || []).map((m) => m.receiver_id));
      responseRate = senders.filter((s) => repliedTo.has(s)).length / senders.length;
    }

    return NextResponse.json({
      success: true,
      pof_status: (passport as { pof_status: string } | null)?.pof_status || 'none',
      pof_verified_at: (passport as { pof_verified_at: string } | null)?.pof_verified_at || null,
      deals_closed: ((deals as { status: string }[]) || []).filter((d) => d.status === 'verified').length,
      deals_claimed: ((deals as { status: string }[]) || []).length,
      response_rate: responseRate,
    });
  } catch (error) {
    console.error('Passport summary error', error);
    return NextResponse.json({ success: false, error: 'Failed to load passport' }, { status: 500 });
  }
}
