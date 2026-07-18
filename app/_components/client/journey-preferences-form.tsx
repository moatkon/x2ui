"use client";

import type { FormEvent } from "react";
import type {
  JourneyOnboarding,
  JourneyPreferences,
} from "@/app/_server/journey-data";
import { useApiMutation } from "./use-api-mutation";

export function JourneyOnboardingForm({
  value,
  etag,
}: {
  value: JourneyOnboarding;
  etag?: string;
}) {
  const mutation = useApiMutation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "PATCH",
      path: "/users/me/journey-onboarding",
      ifMatch: etag ?? `"${value.version}"`,
      body: {
        completed: true,
        preferences: {
          reply: data.has("reply"),
          resource: data.has("resource"),
          care: data.has("care"),
          weeklyLight: data.has("weeklyLight"),
        },
      },
    }, "旅程偏好已保存。");
  }
  return <form onSubmit={submit}>
    <div className="space-y-4">
      {([["reply", "回应真实问题"], ["resource", "整理公开资料"], ["care", "社区照护"], ["weeklyLight", "每周轻量参与"]] as const).map(([name, label]) =>
        <label className="label justify-start gap-3" key={name}><input className="checkbox" name={name} type="checkbox" defaultChecked={value.preferences[name]} /><span>{label}</span></label>,
      )}
    </div>
    <FormFooter mutation={mutation} />
  </form>;
}

export function JourneySettingsForm({
  value,
  etag,
}: {
  value: JourneyPreferences;
  etag?: string;
}) {
  const mutation = useApiMutation();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "PATCH",
      path: "/users/me/journey-preferences",
      ifMatch: etag ?? `"${value.version}"`,
      body: {
        weeklySummary: data.has("weeklySummary"),
        questRecommendations: data.has("questRecommendations"),
        showPathMarks: data.has("showPathMarks"),
      },
    }, "旅程设置已保存。");
  }
  return <form onSubmit={submit}>
    <div className="space-y-4">
      {([["weeklySummary", "每周总结"], ["questRecommendations", "任务推荐"], ["showPathMarks", "展示成长路径标记"]] as const).map(([name, label]) =>
        <label className="flex items-center justify-between gap-4" key={name}><strong>{label}</strong><input className="toggle" name={name} type="checkbox" defaultChecked={value[name]} /></label>,
      )}
    </div>
    <FormFooter mutation={mutation} />
  </form>;
}

function FormFooter({ mutation }: { mutation: ReturnType<typeof useApiMutation> }) {
  return <div className="mt-5">
    {mutation.error ? <p className="alert alert-error mb-3 text-sm">{mutation.error}</p> : null}
    {mutation.success ? <p className="alert alert-success mb-3 text-sm">{mutation.success}</p> : null}
    <div className="flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>保存</button></div>
  </div>;
}
