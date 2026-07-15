import { AccountRouteContent } from "@/app/_components/pages/account-content";
export const metadata = { title: "无权访问" };
export default function ForbiddenPage() { return <AccountRouteContent path="/403" query={{}} />; }
