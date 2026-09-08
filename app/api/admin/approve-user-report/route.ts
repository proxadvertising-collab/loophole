import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '../../../lib/auth/requireAdminSession';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ('error' in auth) {
      return auth.error;
    }
    const adminId = auth.userId;

    const body = await request.json();
    const { reportId } = body;

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }

    if (!isValidUUID(reportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID format' },
        { status: 400 }
      );
    }

    const { data: report, error: reportError } = await supabaseAdmin
      .from('user_reports')
      .select('reported_user_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    const userId = report.reported_user_id;

    if (userId === adminId) {
      return NextResponse.json(
        { success: false, error: 'Cannot ban yourself' },
        { status: 403 }
      );
    }

    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, is_banned, is_admin')
      .eq('id', userId)
      .single();

    if (userCheckError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'Reported user not found' },
        { status: 404 }
      );
    }

    if (existingUser.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Cannot ban admin users' },
        { status: 403 }
      );
    }

    if (!existingUser.is_banned) {
      const { error: banError } = await supabaseAdmin
        .from('users')
        .update({ is_banned: true })
        .eq('id', userId);

      if (banError) {
        console.error('Error banning user from report:', banError);
        return NextResponse.json(
          { success: false, error: 'Failed to ban user' },
          { status: 500 }
        );
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('user_reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Error deleting user report after ban:', deleteError);
      return NextResponse.json(
        { success: false, error: 'User banned but failed to delete report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception in approve user report API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
