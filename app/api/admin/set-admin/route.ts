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

/**
 * Promote or demote admin privileges.
 * Auth identity comes from session only. Broader policy (who may promote)
 * may need a captain decision later — this removes client-spoofable writes.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ('error' in auth) {
      return auth.error;
    }
    const adminId = auth.userId;

    const body = await request.json();
    const { userId, isAdmin } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    if (typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isAdmin boolean is required' },
        { status: 400 }
      );
    }

    if (!isAdmin && userId === adminId) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove your own admin privileges' },
        { status: 403 }
      );
    }

    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email, is_admin')
      .eq('id', userId)
      .single();

    if (userCheckError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (existingUser.is_admin === isAdmin) {
      return NextResponse.json({
        success: true,
        message: isAdmin ? 'User is already an admin' : 'User is already not an admin',
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating is_admin:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update admin privileges' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception in set-admin API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
