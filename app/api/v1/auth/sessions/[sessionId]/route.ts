import type { NextRequest } from "next/server";
import { handleMockMutation } from "@/app/_server/mock-api";
export async function DELETE(request: NextRequest, context: RouteContext<"/api/v1/auth/sessions/[sessionId]">) {
  const { sessionId } = await context.params;
  return handleMockMutation(request, ["auth", "sessions", sessionId], "DELETE");
}
