import type { NextRequest } from "next/server";
import { handleMockGet } from "@/app/_server/mock-api";
export async function GET(request: NextRequest, { params }: RouteContext<"/api/v1/coin-economy/summaries/[period]">) { return handleMockGet(request, ["coin-economy", "summaries", (await params).period]); }
