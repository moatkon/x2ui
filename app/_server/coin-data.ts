import "server-only";

import { requireBackendApiUrl } from "@/lib/auth-cookies";
import {
  authenticatedGet,
  authenticatedGetWithMetadata,
} from "./authenticated-api";

type CursorPage<T> = { items: T[]; nextCursor?: string; hasMore: boolean };

export type CoinWallet = {
  userId: string;
  unit: string;
  balances: { available: number; pending: number; escrow: number; held: number };
  weeklyReward: { earned: number; cap: number; resetsAt: string };
  ruleVersion: string;
  updatedAt: string;
};
export type CoinJournal = {
  id: string;
  type: string;
  status: string;
  occurredAt: string;
  amount: number;
  description: string;
  ruleVersion: string;
  source: { type: string; id: string; label: string };
  entries: Array<{ id: string; accountCode: string; direction: string; amount: number; unit: string }>;
  disputable: boolean;
};
export type Bounty = {
  id: string;
  post: { id: string; displayTitle: string; title: string };
  owner: { id: string; userName: string; displayName: string; avatarUrl?: string };
  amount: number;
  unit: string;
  status: string;
  createdAt: string;
  acceptAfter: string;
  expiresAt: string;
  version: number;
  distribution: { answerer: number; sink: number };
  eligibleAnswers: Array<{ comment: { id: string; bodyMarkdown: string; author: { displayName: string } }; eligible: boolean; ineligibilityCode?: string }>;
  timeline: Array<{ state: string; at: string; journalId?: string }>;
};
export type CoinRuleSet = {
  version: string;
  pendingObservationSeconds: number;
  weeklyUserRewardCap: number;
  effectiveAt: string;
  nonMonetaryNotice: string;
};
export type EconomySummary = {
  period: string;
  openingSupply: number;
  issued: number;
  sunk: number;
  closingSupply: number;
  activeWallets: number;
  dormancyRate: number;
  reversals: number;
  ruleVersion: string;
  publishedAt: string;
};
export type CoinPreferences = {
  rewardNotifications: boolean;
  bountyNotifications: boolean;
  holdNotifications: boolean;
  showPublicContributions: boolean;
  requireReauthForHighRisk: boolean;
  version: number;
};
export type CoinDispute = {
  id: string;
  journalId: string;
  status: string;
  reasonCategory: string;
  statement: string;
  submittedAt: string;
  reviewDueAt: string;
  timeline: Array<{ state: string; at: string; publicMessage?: string }>;
};

export const getCoinWallet = () =>
  authenticatedGet<CoinWallet>("/users/me/coin-wallet");
function cursorQuery(cursor?: string) {
  const query = new URLSearchParams({ limit: "50" });
  if (cursor) query.set("cursor", cursor);
  return query;
}
export function getCoinJournals(cursor?: string) {
  return authenticatedGet<CursorPage<CoinJournal>>(`/users/me/coin-journals?${cursorQuery(cursor)}`);
}
export const getCoinJournal = (id: string) =>
  authenticatedGet<CoinJournal>(`/users/me/coin-journals/${encodeURIComponent(id)}`);
export function getBounties(cursor?: string) {
  return authenticatedGet<CursorPage<Bounty>>(`/users/me/coin-bounties?${cursorQuery(cursor)}`);
}
export const getBounty = (id: string) =>
  authenticatedGet<Bounty>(`/coin-bounties/${encodeURIComponent(id)}`);
export const getCoinDispute = (id: string) =>
  authenticatedGet<CoinDispute>(`/coin-disputes/${encodeURIComponent(id)}`);
export const getCoinPreferences = () =>
  authenticatedGetWithMetadata<CoinPreferences>("/users/me/coin-preferences");

class PublicCoinApiError extends Error {
  constructor(public readonly status: number, path: string) {
    super(`Public coin API request failed: ${path}`);
  }
}

async function publicCoinGet<T>(path: string) {
  const response = await fetch(`${requireBackendApiUrl()}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new PublicCoinApiError(response.status, path);
  return response.json() as Promise<T>;
}
export function getCoinRules(cursor?: string) {
  return publicCoinGet<CursorPage<CoinRuleSet>>(`/coin-rule-versions?${cursorQuery(cursor)}`);
}
export async function getEconomySummary(period: string) {
  try {
    return await publicCoinGet<EconomySummary>(`/coin-economy/summaries/${encodeURIComponent(period)}`);
  } catch (error) {
    if (error instanceof PublicCoinApiError && error.status === 404) return null;
    throw error;
  }
}
