import { useEffect, useMemo, useState } from "react";

import { NotchedCard } from "@/app/components/molecules/NotchedCard";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";
import { TrendChartCard } from "@/app/components/organism/panels/TrendPerformancePanel/TrendChartCard";
import {
  METRIC_OPTIONS,
  SCOPE_OPTIONS,
  SERIES_COLORS,
  formatSeriesName,
} from "@/app/components/organism/panels/TrendPerformancePanel/trendChart.shared";
import { useTrendQualityQuery } from "@/app/hooks/query/monday/trendQuality";
import type {
  TrendMetric,
  TrendScope,
} from "@/app/types/monday/trendQuality.types";

export function TrendPerformancePanel() {
  // Metrik, level, dan legend dipakai bareng dua chart supaya kontrolnya cukup
  // sekali di kepala kartu, seperti desain.
  const [metric, setMetric] = useState<TrendMetric>("latency");
  const [scope, setScope] = useState<TrendScope>("area");
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  // Query yang sama dipakai TrendChartCard "core", jadi ini hanya baca cache.
  const { data } = useTrendQualityQuery("core", metric, scope);
  const seriesNames = useMemo(
    () => (data?.series ?? []).map((item) => item.name),
    [data],
  );

  // Nama seri berubah tiap ganti level, jadi pilihan legend direset.
  useEffect(() => {
    setHiddenSeries([]);
  }, [scope]);

  const toggleSeries = (name: string) =>
    setHiddenSeries((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );

  const headerLeft = (
    <>
      <SelectMenu
        value={metric}
        onChange={(value) => setMetric(value as TrendMetric)}
        options={METRIC_OPTIONS}
        size="sm"
        variant="gray"
        className="text-[11px] font-semibold"
      />

      <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5">
        {SCOPE_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setScope(item.value)}
            className={`cursor-pointer rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors ${
              scope === item.value
                ? "bg-[#213c52] text-white"
                : "text-slate-500 hover:text-[#213c52]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );

  const headerRight = seriesNames.length ? (
    <div className="flex max-w-full flex-nowrap items-center gap-x-2.5 overflow-x-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-2xs">
      {seriesNames.map((name, index) => {
        const color = SERIES_COLORS[index % SERIES_COLORS.length];
        const hidden = hiddenSeries.includes(name);

        return (
          <button
            key={name}
            type="button"
            onClick={() => toggleSeries(name)}
            title={hidden ? "Tampilkan seri" : "Sembunyikan seri"}
            className={`flex cursor-pointer items-center gap-1.5 text-[10px] font-bold whitespace-nowrap transition-opacity ${
              hidden ? "text-slate-400 opacity-50" : "text-slate-600"
            }`}
          >
            <span
              className="h-0.5 w-3.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{formatSeriesName(name)}</span>
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <NotchedCard
      title="Trend Performance"
      notchWidth={330}
      headerLeft={headerLeft}
      headerRight={headerRight}
    >
      <div className="mt-3 grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        <TrendChartCard
          title="Trend Quality Core"
          kind="core"
          metric={metric}
          scope={scope}
          hiddenSeries={hiddenSeries}
        />
        <TrendChartCard
          title="Trend Quality Access"
          kind="access"
          metric={metric}
          scope={scope}
          hiddenSeries={hiddenSeries}
        />
      </div>
    </NotchedCard>
  );
}
