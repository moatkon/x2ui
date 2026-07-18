import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicFeed,
  getPublicNode,
} from "@/app/_server/public-content";
import { ActionButton } from "../../client/action-button";
import { PostRows } from "../../shared/post-rows";
import {
  Breadcrumbs,
  Notice,
  PageHeader,
  Pagination,
  Panel,
} from "../../shared/ui";

export async function ParentNodePage({ slug, cursor }: { slug: string; cursor?: string }) {
  const result = await getPublicNode(slug);
  if (!result) notFound();
  const { parent } = result;
  const feed = await getPublicFeed(parent.slug, undefined, cursor);
  return (
    <>
      <Breadcrumbs
        items={[{ label: "节点", href: "/nodes" }, { label: parent.name }]}
      />
      <div className="mt-3">
        <PageHeader
          title={parent.name}
        description={parent.description}
        action={
          <ActionButton
            className="btn btn-primary"
            message={`已关注${parent.name}`}
            api={{
              method: "PUT",
              path: `/users/me/followed-nodes/${encodeURIComponent(parent.id)}`,
              body: {},
            }}
          >
              关注父节点
            </ActionButton>
          }
        />
      </div>
      <Notice>
        <p>
          关注{parent.name}
          会覆盖全部现有及未来子节点；你仍可以单独静音不感兴趣的子节点。
        </p>
      </Notice>
      <Panel
        className="mt-5"
        title="节点简介"
        footer={
          <p className="text-sm">
            <strong>通用规则：</strong>
            {parent.rule}
          </p>
        }
      >
        <p className="leading-relaxed">{parent.description}</p>
        <p className="mt-3 text-sm opacity-65">
          {parent.followerCount} 人关注 · {parent.postCount} 个聚合主题
        </p>
      </Panel>
      <Panel className="mt-5" title={`${parent.children.length} 个子节点`}>
        <ul className="list x2-list -m-5">
          {parent.children.map((item) => (
            <li className="list-row rounded-none" key={item.id}>
              <div className="list-col-grow">
                <Link
                  className="font-bold hover:underline"
                  href={`/nodes/${parent.slug}/${item.slug}`}
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm opacity-65">{item.description}</p>
              </div>
              <span className="text-sm opacity-60">
                {item.postCount} 个主题
              </span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel className="mt-5" title="父节点聚合帖子" footer={<Pagination href={`/nodes/${parent.slug}`} nextCursor={feed.nextCursor} />}>
        <div className="-m-5">
          <PostRows posts={feed.items} framed={false} />
        </div>
      </Panel>
    </>
  );
}
