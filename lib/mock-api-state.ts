export type StoredMockComment = {
  id: string;
  postId: string;
  rootCommentId: string;
  parentCommentId: string | null;
  anchorKey: string;
  bodyMarkdown: string;
  author: { userName: string; displayName: string };
  createdAt: string;
  replyCount: number;
  reactionCount: number;
};

export type IdempotencyRecord = {
  fingerprint: string;
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

export type MockApiState = {
  bookmarks: Set<string>;
  postReactions: Map<string, Set<string>>;
  commentReactions: Map<string, Set<string>>;
  commentsByPost: Map<string, StoredMockComment[]>;
  idempotency: Map<string, IdempotencyRecord>;
  nextCommentNumber: number;
};

const initialComments: StoredMockComment[] = [
  {
    id: "comment-1",
    postId: "immutable-content",
    rootCommentId: "comment-1",
    parentCommentId: null,
    anchorKey: "comment-comment-1",
    bodyMarkdown: "赞同“稳定记录”的说法。是否考虑过作者发现敏感信息后怎么办？",
    author: { userName: "qingyu", displayName: "青屿" },
    createdAt: "2026-07-14T15:24:00Z",
    replyCount: 3,
    reactionCount: 0,
  },
  {
    id: "comment-2",
    postId: "immutable-content",
    rootCommentId: "comment-2",
    parentCommentId: null,
    anchorKey: "comment-comment-2",
    bodyMarkdown: "可以通过受控的合规数据处理通道解决，但不应该伪装成普通编辑能力。",
    author: { userName: "ache", displayName: "阿澈" },
    createdAt: "2026-07-14T15:30:00Z",
    replyCount: 1,
    reactionCount: 0,
  },
];

const globalMock = globalThis as typeof globalThis & {
  __x2postMockApiState?: MockApiState;
};

export function getMockApiState(): MockApiState {
  globalMock.__x2postMockApiState ??= {
    bookmarks: new Set<string>(),
    postReactions: new Map<string, Set<string>>(),
    commentReactions: new Map<string, Set<string>>(),
    commentsByPost: new Map<string, StoredMockComment[]>([["immutable-content", [...initialComments]]]),
    idempotency: new Map<string, IdempotencyRecord>(),
    nextCommentNumber: 3,
  };
  return globalMock.__x2postMockApiState;
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
import "server-only";
