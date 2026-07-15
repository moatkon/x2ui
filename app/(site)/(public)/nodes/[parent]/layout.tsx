import { nodes } from "@/lib/mock-data";
export function generateStaticParams() { return nodes.map((node) => ({ parent: node.slug })); }
export default function NodeLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
