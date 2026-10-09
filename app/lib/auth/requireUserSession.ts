import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export type RequireUserSuccess = { userId: string };
export type RequireUserFailure = { error: NextResponse };
export type RequireUserResult = RequireUserSuccess | RequireUserFailure;

/**
 * Authenticate a user from the request session cookies.
 * Identity MUST come from the JWT/session — never from the request body.
 */
export async function requireUserSession(
  request: NextRequest
): Promise<RequireUserResult> {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      ),
    };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json(
        { success: false, error: "Not signed in" },
        { status: 401 }
      ),
    };
  }

  return { userId: user.id };
}
