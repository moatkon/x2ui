import { AccountRouteContent } from "@/app/_components/pages/account-content";
export const metadata = { title: "我的主页" };
export default function MePage() { return <AccountRouteContent path="/me" query={{}} />; }
