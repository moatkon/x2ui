import type { NextRequest } from "next/server";
import { handleMockGet } from "@/app/_server/mock-api";
export async function GET(request: NextRequest, { params }: RouteContext<"/api/v1/posts/[postId]">) { return handleMockGet(request, ["posts", (await params).postId]); }
