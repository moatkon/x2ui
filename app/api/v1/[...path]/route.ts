import type { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/app/_server/backend-gateway";

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: Context) {
  return proxyBackendRequest(request, (await context.params).path);
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
