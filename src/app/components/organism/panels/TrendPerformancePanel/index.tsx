import { NotchedCard } from "@/app/components/molecules/NotchedCard";
import { MonitoringCtiPanel } from "@/app/components/organism/panels/MonitoringCtiPanel";
import { TrendChartCard } from "@/app/components/organism/panels/TrendPerformancePanel/TrendChartCard";

export function TrendPerformancePanel() {
  return (
    <NotchedCard title="Trend Performance">
      <div className="flex flex-1 flex-col gap-3 mt-4">
        <TrendChartCard title="Trend Quality Core" kind="core" />
        <TrendChartCard
          title="Trend Quality Access"
          kind="access"
          roundedClassName="rounded-xl"
        />
      </div>

      <div className="mt-4">
        <MonitoringCtiPanel />
      </div>
    </NotchedCard>
  );
}
