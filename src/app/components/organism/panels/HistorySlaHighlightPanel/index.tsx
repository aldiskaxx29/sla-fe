import type { ComponentType } from "react";
import {
  LuBuilding2,
  LuNetwork,
  LuRadio,
  LuRouter,
  LuTriangleAlert,
} from "react-icons/lu";

import { KpiNotAchievedCard } from "@/app/components/molecules/KpiNotAchievedCard";

import type {
  HistorySlaSegment,
  HistorySlaSegmentSummary,
} from "@/app/types/first-insight/historySla.types";

const SEGMENT_STYLES: Record<
  HistorySlaSegment,
  { icon: ComponentType<{ className?: string }>; iconClassName: string }
> = {
  MBB: { icon: LuRadio, iconClassName: "bg-[#e3edfb] text-[#1d6fdc]" },
  FBB: { icon: LuRouter, iconClassName: "bg-[#fdebe1] text-[#e2560d]" },
  OLO: { icon: LuNetwork, iconClassName: "bg-[#f1e6fd] text-[#9333ea]" },
  EBIS: { icon: LuBuilding2, iconClassName: "bg-[#dff3e8] text-[#0f8a4f]" },
};

const PLACEHOLDER_SEGMENTS: HistorySlaSegmentSummary[] = (
  Object.keys(SEGMENT_STYLES) as HistorySlaSegment[]
).map((segment) => ({ segment, not_achieved: 0, total: 0 }));

interface HistorySlaHighlightPanelProps {
  totalNotAchieved: number;
  totalKpi: number;
  segments: HistorySlaSegmentSummary[];
  loading?: boolean;
}

export function HistorySlaHighlightPanel({
  totalNotAchieved,
  totalKpi,
  segments,
  loading = false,
}: HistorySlaHighlightPanelProps) {
  const items = segments.length ? segments : PLACEHOLDER_SEGMENTS;

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-[19px] border border-[#e2e8f0] bg-white p-4 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
      <h2 className="text-base font-semibold text-[#020617]">
        Highlight Summary
      </h2>

      <KpiNotAchievedCard
        icon={LuTriangleAlert}
        iconClassName="bg-transparent text-[#dc2626]"
        label="Total KPI Not Achieved"
        value={totalNotAchieved}
        total={totalKpi}
        highlight
        loading={loading}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const style = SEGMENT_STYLES[item.segment];

          return (
            <KpiNotAchievedCard
              key={item.segment}
              icon={style.icon}
              iconClassName={style.iconClassName}
              label={item.segment}
              value={item.not_achieved}
              total={item.total}
              loading={loading}
            />
          );
        })}
      </div>
    </section>
  );
}
