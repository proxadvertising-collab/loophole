import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '../../../lib/auth/requireAdminSession';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side admin client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// UUID validation regex
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

    // Parse and validate request body
    const body = await request.json();
    const { userId } = body;

    // Input validation
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

    console.log('Server-side ban user:', { userId, adminId });

    // Verify user exists and get current ban status
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email, is_banned, is_admin')
      .eq('id', userId)
      .single();

    if (userCheckError || !existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent banning admins
    if (existingUser.is_admin) {
      return NextResponse.json(
        { success: false, error: 'Cannot ban admin users' },
        { status: 403 }
      );
    }

    // Prevent banning self
    if (userId === adminId) {
      return NextResponse.json(
        { success: false, error: 'Cannot ban yourself' },
        { status: 403 }
      );
    }

    // Check if user is already banned
    if (existingUser.is_banned) {
      return NextResponse.json(
        { success: false, error: 'User is already banned' },
        { status: 400 }
      );
    }

    // Update user to banned status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ is_banned: true })
      .eq('id', userId);

    if (updateError) {
      console.error('Error banning user:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to ban user' },
        { status: 500 }
      );
    }

    console.log('User banned successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception in ban user API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}