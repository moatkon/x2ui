import assert from "node:assert/strict";
import test from "node:test";
import { mutationOriginAllowed, selectBrowserResponseBody } from "../lib/bff-policy.mjs";
import { accessTokenExpiresSoon } from "../lib/token-expiry.mjs";
import { resolveOriginPolicy } from "../lib/origin-policy.mjs";
import { shellAccountModel } from "../lib/shell-account.mjs";

test("unsafe methods require an exact same-origin Origin header", () => {
  const base = { requestUrl: "https://x2post.test/api/v1/posts", forwardedHost: "", forwardedProtocol: "" };
  assert.equal(mutationOriginAllowed({ ...base, method: "POST", origin: "https://x2post.test" }), true);
  assert.equal(mutationOriginAllowed({ ...base, method: "PATCH", origin: "https://evil.test" }), false);
  assert.equal(mutationOriginAllowed({ ...base, method: "DELETE", origin: null }), false);
  assert.equal(mutationOriginAllowed({ ...base, method: "GET", origin: null }), true);
});

test("forwarded origin is used behind a trusted reverse proxy", () => {
  assert.equal(mutationOriginAllowed({
    method: "PUT",
    origin: "https://community.example",
    requestUrl: "http://127.0.0.1:3000/api/v1/users/me/profile",
    forwardedHost: "community.example",
    forwardedProtocol: "https",
  }), true);
});

test("a refreshed cookie never replaces the retried business response", () => {
  const businessBody = new Uint8Array([123, 34, 111, 107, 34, 58, 116, 114, 117, 101, 125]);
  const session = {
    accessToken: "access-secret",
    accessExpiresAt: "2026-07-17T01:00:00Z",
    refreshToken: "refresh-secret",
    refreshExpiresAt: "2026-08-17T01:00:00Z",
  };
  assert.strictEqual(selectBrowserResponseBody(businessBody, session, false), businessBody);
  const loginBody = JSON.parse(selectBrowserResponseBody(businessBody, session, true));
  assert.equal(loginBody.accessToken, undefined);
  assert.equal(loginBody.refreshToken, undefined);
});

test("an expired access token with a refresh cookie is detected before page rendering", () => {
  const encode = (value) => Buffer.from(value).toString("base64url");
  const expired = `x2v1.${encode("account\nsession\n900\n999\n0")}.signature`;
  const valid = `x2v1.${encode("account\nsession\n900\n1200\n0")}.signature`;
  assert.equal(accessTokenExpiresSoon(expired, 1000), true);
  assert.equal(accessTokenExpiresSoon(valid, 1000), false);
});

test("loopback HTTP uses ordinary non-Secure cookies and does not upgrade uploads", () => {
  const policy = resolveOriginPolicy("http://127.0.0.1:3000", "http://127.0.0.1:8080", true);
  assert.equal(policy.secureCookies, false);
  assert.equal(policy.accessCookieName, "x2post_access");
  assert.equal(policy.upgradeInsecureRequests, false);
});

test("public HTTPS uses __Host cookies and upgrades only with an HTTPS backend", () => {
  const policy = resolveOriginPolicy("https://community.example", "https://api.example", true);
  assert.equal(policy.secureCookies, true);
  assert.equal(policy.accessCookieName, "__Host-x2post_access");
  assert.equal(policy.refreshCookieName, "__Host-x2post_refresh");
  assert.equal(policy.upgradeInsecureRequests, true);
  assert.equal(
    resolveOriginPolicy("https://community.example", "http://127.0.0.1:8080", true).upgradeInsecureRequests,
    false,
  );
});

test("non-loopback HTTP origins are rejected", () => {
  assert.throws(
    () => resolveOriginPolicy("http://community.example", "http://api.example", true),
    /only allowed/,
  );
});

test("anonymous shell exposes no private identity or notification state", () => {
  assert.deepEqual(shellAccountModel(null), { authenticated: false });
});

test("authenticated shell uses only the real account summary", () => {
  assert.deepEqual(shellAccountModel({
    user: { displayName: "新用户", avatarUrl: "https://api.example/avatar/u1" },
    counts: { unreadNotifications: 3 },
  }), {
    authenticated: true,
    displayName: "新用户",
    avatarUrl: "https://api.example/avatar/u1",
    unreadNotifications: 3,
  });
});
