import type { NextRequest } from "next/server";
import { handleMockMutation } from "@/app/_server/mock-api";
type Context = RouteContext<"/api/v1/users/me/bookmarks/[postId]">;
async function segments(context: Context) { return ["users", "me", "bookmarks", (await context.params).postId]; }
export async function PUT(request: NextRequest, context: Context) { return handleMockMutation(request, await segments(context), "PUT"); }
export async function DELETE(request: NextRequest, context: Context) { return handleMockMutation(request, await segments(context), "DELETE"); }
