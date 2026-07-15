import { nodes } from "@/lib/mock-data";
export function generateStaticParams({ params }: { params: { parent: string } }) { return nodes.find((node) => node.slug === params.parent)?.children.map((child) => ({ child: child.slug })) ?? []; }
export default function ChildNodeLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
