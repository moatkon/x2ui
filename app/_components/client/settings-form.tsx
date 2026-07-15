"use client";

import type { FormEvent, ReactNode } from "react";
import { useFeedback } from "./feedback-provider";

export function SettingsForm({ children, message = "设置已保存" }: { children: ReactNode; message?: string }) {
  const { notify } = useFeedback();
  return <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); notify(message); }}>{children}<div className="mt-5 flex justify-end"><button className="btn btn-primary">保存设置</button></div></form>;
}
