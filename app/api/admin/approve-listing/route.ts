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

    // Parse and validate request body
    const body = await request.json();
    const { listingId } = body;

    // Input validation
    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    if (!isValidUUID(listingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid listing ID format' },
        { status: 400 }
      );
    }

    console.log('Server-side approve listing:', { listingId, adminId: auth.userId });

    // Verify listing exists before updating
    const { data: existingListing, error: listingCheckError } = await supabaseAdmin
      .from('listings')
      .select('id, status')
      .eq('id', listingId)
      .single();

    if (listingCheckError || !existingListing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Update listing status to approved
    const { error: updateError } = await supabaseAdmin
      .from('listings')
      .update({
        status: 'approved',
        denial_reason: null
      })
      .eq('id', listingId);

    if (updateError) {
      console.error('Error approving listing:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to approve listing' },
        { status: 500 }
      );
    }

    console.log('Listing approved successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exception in approve listing API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}