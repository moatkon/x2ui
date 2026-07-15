import type { NextRequest } from "next/server";
import { handleMockMutation } from "@/app/_server/mock-api";
type Context = RouteContext<"/api/v1/comments/[commentId]/reactions/[reactionType]">;
async function segments(context: Context) { const { commentId, reactionType } = await context.params; return ["comments", commentId, "reactions", reactionType]; }
export async function PUT(request: NextRequest, context: Context) { return handleMockMutation(request, await segments(context), "PUT"); }
export async function DELETE(request: NextRequest, context: Context) { return handleMockMutation(request, await segments(context), "DELETE"); }
