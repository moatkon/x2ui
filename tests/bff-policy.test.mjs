import assert from "node:assert/strict";
import test from "node:test";
import { mutationOriginAllowed, selectBrowserResponseBody } from "../lib/bff-policy.mjs";

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
