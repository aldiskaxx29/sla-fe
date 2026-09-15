import type { ComponentType } from "react";
import {
  LuBuilding2,
  LuChartColumn,
  LuNetwork,
  LuRadio,
  LuRouter,
  LuTriangleAlert,
} from "react-icons/lu";

import { KpiNotAchievedCard } from "@/app/components/molecules/KpiNotAchievedCard";
import { SectionCard } from "@/app/components/molecules/SectionCard";

import type { HistorySlaHighlightBreakdown } from "@/app/types/first-insight/historySla.types";

interface CategoryStyle {
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  MBB: { icon: LuRadio, iconClassName: "bg-[#e3edfb] text-[#1d6fdc]" },
  FBB: { icon: LuRouter, iconClassName: "bg-[#fdebe1] text-[#e2560d]" },
  OLO: { icon: LuNetwork, iconClassName: "bg-[#f1e6fd] text-[#9333ea]" },
  EBIS: { icon: LuBuilding2, iconClassName: "bg-[#dff3e8] text-[#0f8a4f]" },
};

const DEFAULT_STYLE: CategoryStyle = {
  icon: LuChartColumn,
  iconClassName: "bg-[#f1f5f9] text-[#334155]",
};

const PLACEHOLDER_BREAKDOWN: HistorySlaHighlightBreakdown[] = Object.keys(
  CATEGORY_STYLES,
).map((category) => ({ category, not_achieved: 0, total: 0 }));

interface HistorySlaHighlightPanelProps {
  totalNotAchieved: number;
  totalKpi: number;
  breakdown: HistorySlaHighlightBreakdown[];
  loading?: boolean;
  error?: boolean;
}

export function HistorySlaHighlightPanel({
  totalNotAchieved,
  totalKpi,
  breakdown,
  loading = false,
  error = false,
}: HistorySlaHighlightPanelProps) {
  const items = breakdown.length ? breakdown : PLACEHOLDER_BREAKDOWN;

  return (
    <SectionCard className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#020617]">
          Highlight Summary
        </h2>
        {error && (
          <span className="text-xs font-medium text-[#dc2626]">
            Gagal memuat ringkasan.
          </span>
        )}
      </div>

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
          const style = CATEGORY_STYLES[item.category.toUpperCase()] ?? DEFAULT_STYLE;

          return (
            <KpiNotAchievedCard
              key={item.category}
              icon={style.icon}
              iconClassName={style.iconClassName}
              label={item.category}
              value={item.not_achieved}
              total={item.total}
              loading={loading}
            />
          );
        })}
      </div>
    </SectionCard>
  );
}
