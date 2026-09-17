import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Skeleton } from "@/app/components/atoms";

import { SectionCard } from "@/app/components/molecules/SectionCard";

import type { PeHsiTrendPoint } from "@/app/types/network/peHsi.types";

interface PeHsiTrendChartProps {
  points: PeHsiTrendPoint[];
  loading?: boolean;
  error?: boolean;
  onViewDetail?: () => void;
}

export function PeHsiTrendChart({
  points,
  loading = false,
  error = false,
  onViewDetail,
}: PeHsiTrendChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const maxValue = Math.max(0, ...points.map((point) => point.value));

    return {
      grid: { top: 30, left: 8, right: 24, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: points.map((point) => point.label),
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 11, margin: 12 },
        splitLine: { show: true, lineStyle: { color: "#f1f5f9" } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: Math.max(100, Math.ceil((maxValue + 20) / 100) * 100),
        splitNumber: 3,
        axisLabel: { color: "#64748b", fontSize: 11 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: points.map((point) => point.value),
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { color: "#0ea5e9", width: 2.5 },
          itemStyle: {
            color: "#ffffff",
            borderColor: "#0ea5e9",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "top",
            distance: 10,
            color: "#0f172a",
            fontSize: 11,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [points]);

  return (
    <SectionCard className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#020617]">
          Trend Summary Not Degrade
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onViewDetail}
            className="cursor-pointer rounded-lg border border-[#e2e8f0] px-4 py-1.5 text-sm font-medium text-[#2563eb] transition-colors hover:bg-[#eff6ff]"
          >
            View Detail
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[240px] items-center">
          <Skeleton height={210} />
        </div>
      ) : error || !points.length ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-[#64748b]">
          {error ? "Gagal memuat trend summary." : "Data trend belum tersedia."}
        </div>
      ) : (
        <ReactECharts
          option={option}
          style={{ height: 240, width: "100%" }}
          notMerge
        />
      )}
    </SectionCard>
  );
}
