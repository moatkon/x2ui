export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-x2post_session" : "x2post_session";

export type MockSession = { sessionId: string; userName: string; role: "member" | "moderator" | "controller"; issuedAt: number; expiresAt: number };

const encoder = new TextEncoder();

function secret() {
  const value = process.env.MOCK_SESSION_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "x2post-local-development-secret");
  return value.length >= 32 ? value : "";
}

function toBase64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signature(payload: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

export async function createMockSession(role: MockSession["role"] = "controller") {
  if (!secret()) throw new Error("生产环境必须配置至少 32 字符的 MOCK_SESSION_SECRET");
  const issuedAt = Date.now();
  const session: MockSession = { sessionId: crypto.randomUUID(), userName: "linmo", role, issuedAt, expiresAt: issuedAt + 1000 * 60 * 60 * 24 * 7 };
  const payload = toBase64Url(JSON.stringify(session));
  return `${payload}.${toBase64Url(await signature(payload))}`;
}

export async function verifyMockSession(token?: string | null): Promise<MockSession | null> {
  if (!token || !secret()) return null;
  try {
    const [payload, provided, extra] = token.split(".");
    if (!payload || !provided || extra) return null;
    const expected = await signature(payload);
    const actual = fromBase64Url(provided);
    if (expected.length !== actual.length) return null;
    let mismatch = 0;
    for (let index = 0; index < expected.length; index += 1) mismatch |= expected[index] ^ actual[index];
    if (mismatch !== 0) return null;
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as MockSession;
    const validRole = parsed.role === "member" || parsed.role === "moderator" || parsed.role === "controller";
    return typeof parsed.sessionId === "string" && parsed.sessionId.length > 0 && parsed.userName === "linmo" && validRole && Number.isFinite(parsed.issuedAt) && parsed.expiresAt > Date.now() ? parsed : null;
  } catch { return null; }
}
