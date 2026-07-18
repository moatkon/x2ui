"use client";

import type { FormEvent } from "react";
import type {
  NotificationChannel,
  NotificationPreferences,
} from "@/app/_server/account-data";
import { useApiMutation } from "./use-api-mutation";

const editableChannels = [
  ["reply", "回复"],
  ["mention", "提及"],
  ["follow", "新关注"],
  ["reaction", "内容互动"],
  ["governance", "治理进度"],
] as const;

export function NotificationSettingsForm({
  preferences,
  etag,
}: {
  preferences: NotificationPreferences;
  etag?: string;
}) {
  const mutation = useApiMutation();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const body = Object.fromEntries(editableChannels.map(([key]) => [
      key,
      {
        inApp: values.has(`${key}.inApp`),
        emailDigest: values.has(`${key}.emailDigest`),
      },
    ]));
    await mutation.mutate({
      method: "PATCH",
      path: "/users/me/notification-preferences",
      ifMatch: etag ?? `"${preferences.version}"`,
      body,
    }, "通知设置已保存。");
  }

  return <form onSubmit={submit}>
    <div className="overflow-x-auto">
      <table className="table">
        <thead><tr><th>通知类型</th><th>站内通知</th><th>邮件摘要</th></tr></thead>
        <tbody>
          {editableChannels.map(([key, label]) =>
            <ChannelRow key={key} name={key} label={label} channel={preferences[key]} />,
          )}
          <ChannelRow name="security" label="账户安全" channel={preferences.security} disabled />
        </tbody>
      </table>
    </div>
    <p className="mt-3 text-sm opacity-65">账户安全通知由服务端强制开启，不能在这里关闭。</p>
    {mutation.error ? <p className="alert alert-error mt-5 text-sm" role="alert">{mutation.error}</p> : null}
    {mutation.success ? <p className="alert alert-success mt-5 text-sm" role="status">{mutation.success}</p> : null}
    <div className="mt-5 flex justify-end"><button className="btn btn-primary" type="submit" disabled={mutation.pending}>保存</button></div>
  </form>;
}

function ChannelRow({
  name,
  label,
  channel,
  disabled = false,
}: {
  name: string;
  label: string;
  channel: NotificationChannel;
  disabled?: boolean;
}) {
  return <tr>
    <th>{label}</th>
    <td><input className="checkbox" aria-label={`${label}站内通知`} name={`${name}.inApp`} type="checkbox" defaultChecked={channel.inApp} disabled={disabled} /></td>
    <td><input className="checkbox" aria-label={`${label}邮件摘要`} name={`${name}.emailDigest`} type="checkbox" defaultChecked={channel.emailDigest} disabled={disabled} /></td>
  </tr>;
}
