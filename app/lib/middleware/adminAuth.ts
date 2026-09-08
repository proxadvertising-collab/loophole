/**
 * @deprecated Do NOT use caller-supplied userId for authorization.
 * Spoofable: any client can pass another user's id.
 * Prefer requireAdminSession() from app/lib/auth/requireAdminSession.ts
 * which authenticates from the session JWT/cookies only.
 */
export { requireAdminSession } from '../auth/requireAdminSession';

/**
 * @deprecated Use requireAdminSession(request) instead.
 * Checking a caller-provided userId is not authentication.
 */
export async function checkAdminAuth(userId: string): Promise<boolean> {
  console.warn(
    '[DEPRECATED] checkAdminAuth(userId) trusts a caller-supplied id. ' +
      'Use requireAdminSession(request) for real admin auth.'
  );
  void userId;
  return false;
}

/**
 * @deprecated Use requireAdminSession(request) instead.
 */
export function requireAdmin() {
  return async (userId: string | null): Promise<boolean> => {
    console.warn(
      '[DEPRECATED] requireAdmin()(userId) is unsafe. Use requireAdminSession(request).'
    );
    void userId;
    return false;
  };
}
