import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { SectionCard } from "@/app/components/molecules/SectionCard";

import type { MsaTrendData } from "@/app/types/msa/msa.types";
import { MONTH_SHORT_LABELS } from "@/app/utils/msa.utils";

const TARGET_COLOR = "#ef4444";
const ACTUAL_COLOR = "#0ea5e9";

/** Label sumbu X dari kunci `ach_<bulan>_<minggu>` menjadi "Jan W1". */
const toWeekLabel = (week: string) => {
  const match = week.match(/ach_(\d+)_(\d+)/);

  if (!match) return week;

  return `${MONTH_SHORT_LABELS[Number(match[1])] ?? match[1]} W${match[2]}`;
};

const toTitleCase = (value: string) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

interface MsaTrendChartProps {
  title: string;
  /** "Lower Better" atau "Higher Better" sesuai karakter KPI. */
  description: string;
  data: MsaTrendData;
}

export function MsaTrendChart({
  title,
  description,
  data,
}: MsaTrendChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const labels = data.week.map(toWeekLabel);
    const values = data.data.flatMap((series) =>
      series.data.map((value) => Number(value)).filter(Number.isFinite),
    );

    const lowest = values.length ? Math.min(...values) : 0;
    const highest = values.length ? Math.max(...values) : 1;

    return {
      /** Bawah dilebihkan supaya legend TREG/territory tidak menempel plot. */
      grid: { top: 16, left: 8, right: 24, bottom: 78, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
      },
      legend: {
        type: "scroll",
        bottom: 28,
        padding: [6, 8],
        icon: "roundRect",
        itemWidth: 14,
        itemHeight: 4,
        itemGap: 20,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      dataZoom: [
        { type: "inside", filterMode: "none" },
        { type: "slider", height: 16, bottom: 0, brushSelect: false },
      ],
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 10, hideOverlap: true },
        splitLine: { show: true, lineStyle: { color: "#f1f5f9" } },
      },
      yAxis: {
        type: "value",
        min: lowest - Math.abs(lowest) * 0.01,
        max: highest + Math.abs(highest) * 0.01,
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: data.data.map((series) => {
        const isTarget = series.name.toLowerCase().includes("target");

        return {
          name: toTitleCase(series.name),
          type: "line" as const,
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: series.data.map((value) => Number(value)),
          lineStyle: {
            color: isTarget ? TARGET_COLOR : ACTUAL_COLOR,
            width: 2,
            type: isTarget ? ("dashed" as const) : ("solid" as const),
          },
          itemStyle: {
            color: "#ffffff",
            borderColor: isTarget ? TARGET_COLOR : ACTUAL_COLOR,
            borderWidth: 2,
          },
        };
      }),
    };
  }, [data]);

  const isLowerBetter = description.includes("Lower");

  return (
    <SectionCard className="flex flex-col gap-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>

        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
            isLowerBetter
              ? "bg-[#ffe7ba] text-[#92400e]"
              : "bg-[#bae7ff] text-[#075985]"
          }`}
        >
          {description}
        </span>
      </div>

      <ReactECharts
        option={option}
        style={{ height: 260, width: "100%" }}
        notMerge
      />
    </SectionCard>
  );
}
