import { currentUser, posts } from "@/lib/mock-data";
export function generateStaticParams() { return [...new Set([currentUser.userName, ...posts.map((post) => post.author.userName)])].map((userName) => ({ userName })); }
export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
