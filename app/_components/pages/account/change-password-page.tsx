import { PasswordForm } from "../../client/password-form";
import { Breadcrumbs, PageHeader, Panel } from "../../shared/ui";

export function ChangePasswordPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "账户安全", href: "/settings/security" }, { label: "修改密码" }]} />
      <div className="mt-3">
        <PageHeader title="修改密码" description="更新成功后可以选择撤销其他设备会话。" />
      </div>
      <Panel title="设置新密码"><PasswordForm /></Panel>
    </>
  );
}
