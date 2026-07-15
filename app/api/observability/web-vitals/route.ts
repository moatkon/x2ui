import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const sameOrigin = request.headers.get("origin") === request.nextUrl.origin;
  if (!sameOrigin) return Response.json({ detail: "Invalid origin" }, { status: 403 });
  const text = await request.text();
  if (text.length > 2_048) return Response.json({ detail: "Payload too large" }, { status: 413 });
  try {
    const metric = JSON.parse(text) as Record<string, unknown>;
    if (typeof metric.id !== "string" || typeof metric.name !== "string" || typeof metric.value !== "number") return Response.json({ detail: "Invalid metric" }, { status: 422 });
    if (process.env.NODE_ENV === "development") console.info("[web-vital]", metric.name, metric.value, metric.rating);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ detail: "Malformed JSON" }, { status: 400 });
  }
}
