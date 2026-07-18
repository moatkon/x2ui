import { getJourneyOnboarding } from "@/app/_server/journey-data";
import { JourneyOnboardingForm } from "../../client/journey-preferences-form";
import { PageHeader, Panel } from "../../shared/ui";

export async function JourneyOnboardingPage() {
  const { data, etag } = await getJourneyOnboarding();
  return <><PageHeader title="旅程偏好" description="选择你愿意参与的贡献方式。" /><Panel title="参与偏好"><JourneyOnboardingForm value={data} etag={etag} /></Panel></>;
}
