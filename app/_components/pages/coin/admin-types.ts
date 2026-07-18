export type NumberPage<T> = { items: T[]; page: number; pageSize: number; total: number };

export type CoinRiskCase = {
  id: string;
  type: string;
  status: string;
  amount: number;
  slaDueAt: string;
  holdIds: string[];
  journalIds: string[];
  evidence: Array<{ kind: string; summary: string; sourceRef: string }>;
  history: Array<{ state: string; at: string; actorId?: string }>;
  version: number;
};

export type CurrentBudget = {
  period: string;
  cap: number;
  used: number;
  remaining: number;
  pending: number;
  ruleVersion: string;
  version: number;
};

export type Proposal = {
  id: string;
  status: string;
  period?: string;
  rationale: string;
  version: number;
};

export type Adjustment = {
  id: string;
  incidentId: string;
  period: string;
  reason: string;
  status: string;
  proposerId: string;
  approverId?: string;
  proposedEntries: Array<{ accountCode: string; direction: string; amount: number }>;
  journalId?: string;
  version: number;
  createdAt: string;
};

export type Reconciliation = {
  id: string;
  period: string;
  scope: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  checks: Array<{ name: string; ledgerValue: number; businessValue: number; difference: number; status: string }>;
  differenceCount: number;
  version: number;
};
