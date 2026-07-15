import "server-only";
import type { NextRequest } from "next/server";
import { nodes } from "@/lib/mock-data";

export type FieldError = { field: string; code: string; message: string };
export type ParsedBody = { body?: Record<string, unknown>; error?: { status: number; code: string; detail: string; fieldErrors?: FieldError[] } };

const MAX_BODY_BYTES = 64 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userNamePattern = /^[a-z0-9][a-z0-9_-]*$/i;

function stringField(body: Record<string, unknown>, field: string, min: number, max: number, errors: FieldError[], options: { nullable?: boolean; pattern?: RegExp } = {}) {
  const value = body[field];
  if (options.nullable && value === null) return;
  if (typeof value !== "string" || value.length < min || value.length > max || (options.pattern && !options.pattern.test(value))) {
    errors.push({ field, code: "INVALID_VALUE", message: `${field} 必须是 ${min}–${max} 字符的有效字符串` });
  }
}

function booleanTrue(body: Record<string, unknown>, field: string, errors: FieldError[]) {
  if (body[field] !== true) errors.push({ field, code: "CONFIRMATION_REQUIRED", message: `${field} 必须确认` });
}

function rejectUnknown(body: Record<string, unknown>, allowed: readonly string[], errors: FieldError[]) {
  for (const field of Object.keys(body)) if (!allowed.includes(field)) errors.push({ field, code: "UNKNOWN_FIELD", message: "不支持的字段" });
}

export async function parseJsonBody(request: NextRequest, method: string): Promise<ParsedBody> {
  if (method === "DELETE") return { body: {} };
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) return { error: { status: 415, code: "UNSUPPORTED_MEDIA_TYPE", detail: "请求体必须使用 application/json" } };
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return { error: { status: 413, code: "PAYLOAD_TOO_LARGE", detail: "请求体不能超过 64 KiB" } };
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return { error: { status: 413, code: "PAYLOAD_TOO_LARGE", detail: "请求体不能超过 64 KiB" } };
  try {
    const parsed: unknown = text ? JSON.parse(text) : {};
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") return { error: { status: 400, code: "INVALID_JSON_OBJECT", detail: "JSON 请求体必须是对象" } };
    return { body: parsed as Record<string, unknown> };
  } catch {
    return { error: { status: 400, code: "MALFORMED_JSON", detail: "请求体不是有效 JSON" } };
  }
}

export function validateBody(path: string, method: string, body: Record<string, unknown>): FieldError[] {
  const errors: FieldError[] = [];
  if ((method === "PUT" || method === "DELETE") && (/bookmarks\//.test(path) || /reactions\//.test(path))) return errors;
  if (path === "/posts" && method === "POST") {
    rejectUnknown(body, ["title", "bodyMarkdown", "parentNodeSlug", "childNodeSlug", "tags", "attachmentUploadIds", "confirmedImmutable"], errors);
    stringField(body, "title", 1, 80, errors, { nullable: true });
    stringField(body, "bodyMarkdown", 1, 20_000, errors);
    stringField(body, "parentNodeSlug", 1, 64, errors);
    if (body.childNodeSlug !== null && body.childNodeSlug !== undefined) stringField(body, "childNodeSlug", 1, 64, errors);
    booleanTrue(body, "confirmedImmutable", errors);
    const parent = nodes.find((node) => node.slug === body.parentNodeSlug);
    if (!parent) errors.push({ field: "parentNodeSlug", code: "NODE_NOT_FOUND", message: "一级节点不存在" });
    if (body.childNodeSlug && !parent?.children.some((child) => child.slug === body.childNodeSlug)) errors.push({ field: "childNodeSlug", code: "NODE_PATH_NOT_FOUND", message: "子节点不属于所选一级节点" });
  } else if (path.endsWith("/comments") && method === "POST") {
    rejectUnknown(body, ["bodyMarkdown", "parentCommentId", "confirmedImmutable"], errors);
    stringField(body, "bodyMarkdown", 1, 2_000, errors);
    booleanTrue(body, "confirmedImmutable", errors);
  } else if (path === "/auth/sessions" && method === "POST") {
    rejectUnknown(body, ["login", "password"], errors);
    stringField(body, "login", 2, 254, errors);
    stringField(body, "password", 8, 128, errors);
  } else if (path === "/auth/registrations" && method === "POST") {
    rejectUnknown(body, ["userName", "email", "password"], errors);
    stringField(body, "userName", 3, 32, errors, { pattern: userNamePattern });
    stringField(body, "email", 5, 254, errors, { pattern: emailPattern });
    stringField(body, "password", 8, 128, errors);
  } else if (path === "/auth/email-verifications" && method === "POST") {
    rejectUnknown(body, ["token"], errors);
    stringField(body, "token", 32, 2_048, errors);
  } else if (path === "/auth/password-reset-deliveries" && method === "POST") {
    rejectUnknown(body, ["email"], errors);
    stringField(body, "email", 5, 254, errors, { pattern: emailPattern });
  } else if (path === "/auth/password-resets" && method === "POST") {
    rejectUnknown(body, ["token", "newPassword"], errors);
    stringField(body, "token", 32, 2_048, errors);
    stringField(body, "newPassword", 8, 128, errors);
  } else if (path === "/reports" && method === "POST") {
    rejectUnknown(body, ["target", "reason", "details", "evidenceUploadIds", "truthfulConfirmation"], errors);
    if (!body.target || Array.isArray(body.target) || typeof body.target !== "object") errors.push({ field: "target", code: "INVALID_VALUE", message: "target 必须是对象" });
    stringField(body, "reason", 2, 64, errors);
    if (body.details !== undefined) stringField(body, "details", 0, 1_000, errors);
    booleanTrue(body, "truthfulConfirmation", errors);
  } else if (path === "/appeals" && method === "POST") {
    rejectUnknown(body, ["enforcementId", "reason", "details", "evidenceUploadIds"], errors);
    stringField(body, "enforcementId", 1, 64, errors);
    stringField(body, "reason", 2, 64, errors);
    stringField(body, "details", 1, 2_000, errors);
  } else if (path === "/notifications/read-cursor" && method === "PUT") {
    rejectUnknown(body, ["readThrough"], errors);
    stringField(body, "readThrough", 20, 40, errors);
  } else if (method === "PATCH" && Object.keys(body).length === 0) {
    errors.push({ field: "$", code: "EMPTY_PATCH", message: "PATCH 请求至少包含一个字段" });
  }
  return errors;
}
