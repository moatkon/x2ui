import type { NextRequest } from "next/server";
import { handleMockMutation } from "@/app/_server/mock-api";
type Context = RouteContext<"/api/v1/posts/[postId]/reactions/[reactionType]">;
async function segments(context: Context) { const { postId, reactionType } = await context.params; return ["posts", postId, "reactions", reactionType]; }
export async function PUT(request: NextRequest, context: Context) { return handleMockMutation(request, await segments(context), "PUT"); }
export async function DELETE(request: NextRequest, context: Context) { return handleMockMutation(request, await segments(context), "DELETE"); }
