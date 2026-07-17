const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function mutationOriginAllowed({ method, origin, requestUrl, forwardedHost, forwardedProtocol }) {
  if (safeMethods.has(method.toUpperCase())) return true;
  if (!origin) return false;
  try {
    const incoming = new URL(requestUrl);
    const expectedHost = forwardedHost || incoming.host;
    const expectedProtocol = forwardedProtocol || incoming.protocol.replace(":", "");
    return new URL(origin).origin === `${expectedProtocol}://${expectedHost}`;
  } catch {
    return false;
  }
}

export function selectBrowserResponseBody(backendBody, session, sanitizeSessionResponse) {
  if (!session || !sanitizeSessionResponse) return backendBody;
  const safe = { ...session };
  delete safe.accessToken;
  delete safe.refreshToken;
  return JSON.stringify(safe);
}
