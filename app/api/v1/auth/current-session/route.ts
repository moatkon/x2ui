import { mockDelete } from "@/app/_server/mock-route-adapter";
export const DELETE = mockDelete(["auth", "current-session"]);
