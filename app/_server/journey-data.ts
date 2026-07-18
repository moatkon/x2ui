import "server-only";

import {
  authenticatedGet,
  authenticatedGetWithMetadata,
} from "./authenticated-api";

type CursorPage<T> = { items: T[]; nextCursor?: string; hasMore: boolean };
type NodeSummary = { id: string; slug: string; name: string };

export type Quest = {
  id: string;
  title: string;
  description: string;
  node: NodeSummary;
  type: string;
  estimatedMinutes: number;
  steps: Array<{ id: string; label: string; completionSource: string; completed: boolean }>;
  rewardExplanation: string;
  cxpPotential: number;
  status: "AVAILABLE" | "ACTIVE" | "UNAVAILABLE";
  unavailableReason?: string;
  sourceOptions: Array<{ type: "POST" | "NODE_PROJECT"; id: string; label: string }>;
};

export type Enrollment = {
  id: string;
  questId: string;
  source: { type: string; id: string; title: string };
  status: string;
  startedAt: string;
  pausedAt?: string;
  completedAt?: string;
  progress: { completedSteps: number; totalSteps: number };
  version: number;
};

export type JourneySummary = {
  weekStart: string;
  weekEnd: string;
  completedContributions: number;
  targetContributions: number;
  coveredNodes: number;
  cxp: { confirmed: number; pending: number };
  role: { current: string; next?: string };
  currentEnrollment?: Enrollment;
  recommendedQuests: Quest[];
};

export type Contribution = {
  id: string;
  type: string;
  node: NodeSummary;
  impact: string;
  source: { type: string; id: string; title: string };
  occurredAt: string;
  qualityState: string;
  cxpState: string;
  ncpState: string;
  coinCandidateState: string;
};

export type CollectionItem = {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  sourceContributionId: string;
  displayed: boolean;
  iconKey: string;
};

export type NodeProject = {
  id: string;
  node: NodeSummary;
  title: string;
  goal: string;
  status: "OPEN" | "ARCHIVED";
  memberCount: number;
  memberLimit: number;
  progress: { accepted: number; target: number };
  openTaskCount: number;
  participant: boolean;
  displayNamePublic?: boolean;
};

export type JourneyOnboarding = {
  completed: boolean;
  preferences: {
    reply: boolean;
    resource: boolean;
    care: boolean;
    weeklyLight: boolean;
  };
  version: number;
};

export type JourneyPreferences = {
  weeklySummary: boolean;
  questRecommendations: boolean;
  showPathMarks: boolean;
  version: number;
};

export const getJourneySummary = () =>
  authenticatedGet<JourneySummary>("/journey/summary");

function cursorQuery(cursor?: string, entries: Record<string, string> = {}) {
  const query = new URLSearchParams({ ...entries, limit: "50" });
  if (cursor) query.set("cursor", cursor);
  return query;
}

export function getQuests(cursor?: string) {
  return authenticatedGet<CursorPage<Quest>>(`/quests?${cursorQuery(cursor, { status: "ALL" })}`);
}

export const getQuest = (id: string) =>
  authenticatedGet<{ quest: Quest; enrollment?: Enrollment }>(`/quests/${encodeURIComponent(id)}`);

export const getJourneyProgress = () =>
  authenticatedGet<{
    path: Array<{ role: string; description: string; completed: boolean; current: number; target: number }>;
    weeklyReview?: { weekStart: string; weekEnd: string; summary: string };
  }>("/users/me/journey-progress");

export function getContributions(cursor?: string) {
  return authenticatedGet<CursorPage<Contribution>>(`/users/me/contributions?${cursorQuery(cursor)}`);
}

export function getCollections(cursor?: string) {
  return authenticatedGet<CursorPage<CollectionItem>>(`/users/me/collections?${cursorQuery(cursor)}`);
}

export function getNodeProjects(cursor?: string) {
  return authenticatedGet<CursorPage<NodeProject>>(`/node-projects?${cursorQuery(cursor, { status: "OPEN" })}`);
}

export const getJourneyOnboarding = () =>
  authenticatedGetWithMetadata<JourneyOnboarding>("/users/me/journey-onboarding");

export const getJourneyPreferences = () =>
  authenticatedGetWithMetadata<JourneyPreferences>("/users/me/journey-preferences");
