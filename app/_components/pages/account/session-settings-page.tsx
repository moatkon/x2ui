import { getSessions } from "@/app/_server/account-data";
import { ActionButton } from "../../client/action-button";
import { DataTable } from "../../shared/ui";
import { SettingsScaffold } from "./settings-scaffold";

export async function SessionSettingsPage() {
  const sessions = await getSessions();
  const rows = sessions.map((session) => [
    `${session.deviceName} · ${session.browser}`,
    session.approximateLocation ?? "位置未知",
    new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Shanghai",
    }).format(new Date(session.lastActiveAt)),
    session.current ? (
      <span className="badge badge-success" key={session.id}>当前</span>
    ) : (
      <ActionButton
        className="btn btn-sm"
        message="设备会话已撤销"
        api={{ method: "DELETE", path: `/auth/sessions/${encodeURIComponent(session.id)}` }}
        key={session.id}
      >
        撤销
      </ActionButton>
    ),
  ]);

  return (
    <SettingsScaffold active="sessions" title="设备会话">
      {rows.length ? (
        <DataTable headers={["设备", "位置", "最近活动", "操作"]} rows={rows} />
      ) : (
        <p className="opacity-65">当前没有可显示的设备会话。</p>
      )}
      <div className="mt-5">
        <ActionButton
          message="其他会话已全部撤销"
          api={{ method: "POST", path: "/auth/other-session-revocations", body: {}, idempotent: true }}
        >
          撤销其他全部会话
        </ActionButton>
      </div>
    </SettingsScaffold>
  );
}
