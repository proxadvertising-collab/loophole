/**
 * Personal AI token helpers (server-only).
 *
 * Tokens look like: lh_ai_<64 hex chars>. Only the SHA-256 hash is stored.
 * The plaintext is shown to the user exactly once at creation.
 */
import { createHash, randomBytes } from "crypto";

const TOKEN_PREFIX = "lh_ai_";

export function generateAiToken(): { plaintext: string; hash: string } {
  const secret = randomBytes(32).toString("hex");
  const plaintext = `${TOKEN_PREFIX}${secret}`;
  const hash = hashAiToken(plaintext);
  return { plaintext, hash };
}

export function hashAiToken(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return token.startsWith(TOKEN_PREFIX) ? token : null;
}

export const AI_TOKEN_SCOPES = ["offers:write"] as const;
export type AiTokenScope = (typeof AI_TOKEN_SCOPES)[number];

/** Max structured offers one token owner may submit per 24h. */
export const AI_OFFER_DAILY_LIMIT = 20;
