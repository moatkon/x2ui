export type NumberPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type CaseSummary = {
  id: string;
  target: {
    type: string;
    id: string;
    label: string;
    author?: { id: string; displayName: string };
  };
  reason: string;
  priority: string;
  status: string;
  reportCount: number;
  enteredAt: string;
  slaDueAt: string;
  version: number;
};

export type ModerationCase = {
  case: CaseSummary;
  riskSummary: string;
  contentSnapshot: { snapshotId: string; sealed: boolean; body: string };
  subjectHistory: Array<{ kind: string; at: string; summary: string }>;
  decisions: Array<{ id: string; decisionType: string; summary: string; createdAt: string }>;
  allowedCommands: {
    visibility: boolean;
    commentLock: boolean;
    userSanction: boolean;
  };
};

export type AuditEntry = {
  id: string;
  actor: { id: string; displayName: string; capability: string };
  operation: string;
  subjectType: string;
  subjectId: string;
  reason: string;
  requestId: string;
  correlationId: string;
  createdAt: string;
};
