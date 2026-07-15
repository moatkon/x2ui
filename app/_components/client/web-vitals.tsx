"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({ id: metric.id, name: metric.name, value: metric.value, rating: metric.rating, navigationType: metric.navigationType });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/observability/web-vitals", body);
    else void fetch("/api/observability/web-vitals", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  });
  return null;
}
