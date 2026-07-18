export type PostSummary = {
  id: string;
  title: string;
  excerpt: string;
  bodyMarkdown: string;
  author: { userName: string; displayName: string; avatarUrl?: string };
  nodePath: { parentSlug: string; parentName: string; childSlug?: string; childName?: string };
  createdAt: string;
  createdLabel: string;
  commentCount: number;
  reactionCount: number;
  tags: string[];
};

export type CommunityNode = {
  id: string;
  slug: string;
  name: string;
  description: string;
  postCount: number;
  followerCount: number;
  rule: string;
  children: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    postCount: number;
    followerCount: number;
    rule: string;
  }>;
};
