import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Checkbox, Skeleton } from "@/app/components/atoms";

import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { TICKET_SEVERITY_OPTIONS } from "@/app/api/ticket";
import type {
  TicketSeverityFilter,
  TicketTrendPoint,
} from "@/app/types/ticket/ticketQuality.types";
import { TICKET_TREND_COLORS } from "@/app/utils/ticketQuality.utils";

export type TicketTrendSeriesKey = "jawa" | "nonJawa";

const SERIES_META: Array<{
  key: TicketTrendSeriesKey;
  label: string;
  color: string;
}> = [
  { key: "jawa", label: "Jawa", color: TICKET_TREND_COLORS.jawa },
  { key: "nonJawa", label: "Non Jawa", color: TICKET_TREND_COLORS.nonJawa },
];

interface TicketTrendAchievementChartProps {
  points: TicketTrendPoint[];
  severity: TicketSeverityFilter;
  visibleSeries: TicketTrendSeriesKey[];
  onSeverityChange: (value: TicketSeverityFilter) => void;
  onToggleSeries: (key: TicketTrendSeriesKey) => void;
  loading?: boolean;
  error?: boolean;
}

export function TicketTrendAchievementChart({
  points,
  severity,
  visibleSeries,
  onSeverityChange,
  onToggleSeries,
  loading = false,
  error = false,
}: TicketTrendAchievementChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      grid: { top: 24, left: 8, right: 16, bottom: 48, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 11 },
        valueFormatter: (value) =>
          typeof value === "number" ? `${value.toFixed(1)}%` : "-",
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: points.map((point) => point.month),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        min: 80,
        max: 100,
        interval: 5,
        axisLabel: { color: "#94a3b8", fontSize: 11 },
        splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      },
      dataZoom: [
        {
          type: "slider",
          height: 6,
          bottom: 26,
          start: 0,
          end: 100,
          borderColor: "transparent",
          backgroundColor: "#f1f5f9",
          fillerColor: "rgba(37,99,235,0.35)",
          handleSize: 14,
          showDetail: false,
          showDataShadow: false,
          brushSelect: false,
        },
        { type: "inside" },
      ],
      series: SERIES_META.filter((meta) =>
        visibleSeries.includes(meta.key),
      ).map((meta) => ({
        name: meta.label,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: points.map((point) => point[meta.key]),
        lineStyle: { color: meta.color, width: 2.5 },
        itemStyle: { color: meta.color },
        label: {
          show: true,
          position: meta.key === "jawa" ? "top" : "bottom",
          color: "#334155",
          fontSize: 10,
          fontWeight: 600,
          formatter: ({ value }: { value: number | null }) =>
            typeof value === "number" ? `${value.toFixed(1)}%` : "",
        },
      })),
    }),
    [points, visibleSeries],
  );

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] px-4 py-3">
        <h3 className="text-sm font-bold text-[#020617]">Trend Achievement</h3>

        <SelectMenu
          value={severity}
          options={[...TICKET_SEVERITY_OPTIONS]}
          onChange={(value) => onSeverityChange(value as TicketSeverityFilter)}
          className="[&_button]:h-9 [&_button]:w-[150px] [&_button]:rounded-lg [&_button]:border-[#e2e8f0] [&_button]:text-xs"
        />
      </header>

      <div className="flex flex-col gap-2 p-3">
        {loading ? (
          <Skeleton height={260} />
        ) : error || !points.length ? (
          <div className="flex h-[260px] items-center justify-center text-xs text-[#64748b]">
            {error ? "Gagal memuat trend." : "Data trend belum tersedia."}
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: 260, width: "100%" }}
            notMerge
          />
        )}

        <div className="flex flex-wrap items-center justify-center gap-5">
          {SERIES_META.map((meta) => (
            <Checkbox
              key={meta.key}
              checked={visibleSeries.includes(meta.key)}
              onChange={() => onToggleSeries(meta.key)}
            >
              <span className="flex items-center gap-1.5 text-xs text-[#334155]">
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.label}
              </span>
            </Checkbox>
          ))}
        </div>
      </div>
    </section>
  );
}
