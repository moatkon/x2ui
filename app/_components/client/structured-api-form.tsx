"use client";

import type { FormEvent } from "react";
import { useApiMutation } from "./use-api-mutation";

export type StructuredField = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "number" | "datetime" | "select" | "comma-list" | "json";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  defaultValue?: string | number;
  options?: Array<{ value: string; label: string }>;
  help?: string;
  transport?: "path" | "etag";
};

export function StructuredApiForm({
  path,
  method = "POST",
  fields,
  fixedBody = {},
  ifMatch,
  idempotent = true,
  submitLabel = "提交",
  successMessage = "操作已提交。",
  confirmation,
}: {
  path: string;
  method?: "POST" | "PUT" | "PATCH";
  fields: StructuredField[];
  fixedBody?: Record<string, unknown>;
  ifMatch?: string;
  idempotent?: boolean;
  submitLabel?: string;
  successMessage?: string;
  confirmation?: string;
}) {
  const mutation = useApiMutation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmation && !window.confirm(confirmation)) return;
    const values = new FormData(event.currentTarget);
    const body: Record<string, unknown> = { ...fixedBody };
    let resolvedPath = path;
    let resolvedIfMatch = ifMatch;
    try {
      for (const field of fields) {
        const raw = String(values.get(field.name) ?? "").trim();
        if (!raw && !field.required) continue;
        const parsed = raw === "true" || raw === "false"
          ? raw === "true"
          : field.kind === "number"
          ? Number(raw)
          : field.kind === "datetime"
            ? new Date(raw).toISOString()
            : field.kind === "comma-list"
              ? raw.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
              : field.kind === "json"
                ? JSON.parse(raw)
                : raw;
        if (field.transport === "path") {
          resolvedPath = resolvedPath.replace(`:${field.name}`, encodeURIComponent(String(parsed)));
        } else if (field.transport === "etag") {
          resolvedIfMatch = `"${String(parsed).replaceAll("\"", "")}"`;
        } else {
          body[field.name] = parsed;
        }
      }
    } catch {
      event.currentTarget.querySelector<HTMLTextAreaElement>("[data-json=true]")
        ?.setCustomValidity("请输入有效的 JSON。");
      event.currentTarget.reportValidity();
      return;
    }
    await mutation.mutate({ method, path: resolvedPath, body, ifMatch: resolvedIfMatch, idempotent }, successMessage);
  }
  return <form className="space-y-4" onSubmit={submit}>
    {fields.map((field) => <label className="form-control" key={field.name}>
      <span className="label-text mb-2 font-semibold">{field.label}</span>
      <FieldControl field={field} />
      {field.help ? <span className="label-text-alt mt-1 opacity-65">{field.help}</span> : null}
    </label>)}
    {mutation.error ? <p className="alert alert-error text-sm" role="alert">{mutation.error}</p> : null}
    {mutation.success ? <p className="alert alert-success text-sm" role="status">{mutation.success}</p> : null}
    <div className="flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>{submitLabel}</button></div>
  </form>;
}

function FieldControl({ field }: { field: StructuredField }) {
  if (field.kind === "textarea" || field.kind === "json" || field.kind === "comma-list") {
    return <textarea className="textarea min-h-24 w-full" data-json={field.kind === "json" || undefined} name={field.name} required={field.required} minLength={field.minLength} maxLength={field.maxLength} defaultValue={field.defaultValue} onChange={(event) => event.currentTarget.setCustomValidity("")} />;
  }
  if (field.kind === "select") {
    return <select className="select w-full" name={field.name} required={field.required} defaultValue={field.defaultValue}><option value="" disabled>请选择</option>{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>;
  }
  return <input className="input w-full" name={field.name} type={field.kind === "number" ? "number" : field.kind === "datetime" ? "datetime-local" : "text"} required={field.required} minLength={field.minLength} maxLength={field.maxLength} min={field.min} defaultValue={field.defaultValue} />;
}
