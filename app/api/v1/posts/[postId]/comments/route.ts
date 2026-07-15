import type { NextRequest } from "next/server";
import { handleMockGet, handleMockMutation } from "@/app/_server/mock-api";
type Context = RouteContext<"/api/v1/posts/[postId]/comments">;
export async function GET(request: NextRequest, { params }: Context) { return handleMockGet(request, ["posts", (await params).postId, "comments"]); }
export async function POST(request: NextRequest, { params }: Context) { return handleMockMutation(request, ["posts", (await params).postId, "comments"], "POST"); }
