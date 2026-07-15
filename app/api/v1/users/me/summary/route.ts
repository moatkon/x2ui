import { mockGet } from "@/app/_server/mock-route-adapter";
export const GET = mockGet(["users", "me", "summary"]);
