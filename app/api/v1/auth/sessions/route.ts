import { mockGet, mockPost } from "@/app/_server/mock-route-adapter";
export const GET = mockGet(["auth", "sessions"]);
export const POST = mockPost(["auth", "sessions"]);
