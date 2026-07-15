export const SESSION_COOKIE = "x2post_session";

export type MockSession = { userName: string; role: "member" | "moderator" | "controller"; expiresAt: number };

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
  const session: MockSession = { userName: "linmo", role, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  const payload = toBase64Url(JSON.stringify(session));
  return `${payload}.${toBase64Url(await signature(payload))}`;
}

export async function verifyMockSession(token?: string | null): Promise<MockSession | null> {
  if (!token || !secret()) return null;
  const [payload, provided] = token.split(".");
  if (!payload || !provided) return null;
  const expected = await signature(payload);
  const actual = fromBase64Url(provided);
  if (expected.length !== actual.length) return null;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) mismatch |= expected[index] ^ actual[index];
  if (mismatch !== 0) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as MockSession;
    return parsed.expiresAt > Date.now() ? parsed : null;
  } catch { return null; }
}
