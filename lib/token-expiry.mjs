export function accessTokenExpiresSoon(token, nowSeconds, skewSeconds = 30) {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "x2v1") return true;
    const payload = parts[1].replaceAll("-", "+").replaceAll("_", "/");
    const decoded = atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "="));
    const claims = decoded.split("\n");
    if (claims.length !== 5) return true;
    const expiresAt = Number(claims[3]);
    return !Number.isFinite(expiresAt) || expiresAt <= nowSeconds + skewSeconds;
  } catch {
    return true;
  }
}
