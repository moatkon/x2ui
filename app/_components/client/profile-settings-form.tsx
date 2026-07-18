"use client";

import type { FormEvent } from "react";
import type { EditableProfile } from "@/app/_server/account-data";
import { useApiMutation } from "./use-api-mutation";

export function ProfileSettingsForm({
  profile,
  etag,
}: {
  profile: EditableProfile;
  etag?: string;
}) {
  const mutation = useApiMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await mutation.mutate({
      method: "PATCH",
      path: "/users/me/profile",
      ifMatch: etag ?? `"${profile.version}"`,
      body: {
        displayName: String(values.get("displayName") ?? ""),
        bio: String(values.get("bio") ?? ""),
        location: String(values.get("location") ?? ""),
      },
    }, "资料已保存。");
  }

  return <form onSubmit={submit}>
    <label className="form-control">
      <span className="label-text mb-2 font-semibold">显示名称</span>
      <input className="input w-full" name="displayName" defaultValue={profile.displayName} maxLength={40} required />
    </label>
    <label className="form-control mt-4">
      <span className="label-text mb-2 font-semibold">个人简介</span>
      <textarea className="textarea w-full" name="bio" rows={4} maxLength={160} defaultValue={profile.bio} />
      <span className="label-text-alt mt-1 opacity-60">公开展示，最多 160 字。</span>
    </label>
    <label className="form-control mt-4">
      <span className="label-text mb-2 font-semibold">所在地</span>
      <input className="input w-full" name="location" defaultValue={profile.location ?? ""} maxLength={80} />
    </label>
    <MutationFooter {...mutation} />
  </form>;
}

function MutationFooter({
  pending,
  error,
  success,
}: {
  pending: boolean;
  error: string;
  success: string;
}) {
  return <div className="mt-5">
    {error ? <p className="alert alert-error mb-3 text-sm" role="alert">{error}</p> : null}
    {success ? <p className="alert alert-success mb-3 text-sm" role="status">{success}</p> : null}
    <div className="flex justify-end">
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? <span className="loading loading-spinner loading-sm" /> : null}
        保存
      </button>
    </div>
  </div>;
}
