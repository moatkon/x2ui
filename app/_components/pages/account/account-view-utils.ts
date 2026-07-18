export function localDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function statusClass(status: string) {
  if (["RESOLVED", "CLOSED", "UPHELD", "OVERTURNED"].includes(status)) return "badge-success";
  if (["SUBMITTED", "UNDER_REVIEW", "PENDING"].includes(status)) return "badge-warning";
  return "badge-outline";
}
