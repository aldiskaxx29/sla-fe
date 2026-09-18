import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import { SectionCard } from "@/app/components/molecules/SectionCard";

import { RCA_NOT_CLEAR_CHART_LABELS } from "@/app/utils/resumeRca.utils";

const BAR_COLOR = "#144c6a";

interface RcaNotClearChartProps {
  data: number[];
  loading?: boolean;
  error?: boolean;
}

export function RcaNotClearChart({
  data,
  loading = false,
  error = false,
}: RcaNotClearChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      grid: { top: 28, left: 8, right: 16, bottom: 16, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
      },
      xAxis: {
        type: "category",
        data: [...RCA_NOT_CLEAR_CHART_LABELS],
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#475569",
          fontSize: 9,
          interval: 0,
          rotate: 28,
        },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 32,
          itemStyle: { color: BAR_COLOR, borderRadius: [6, 6, 0, 0] as [number, number, number, number] },
          label: {
            show: true,
            position: "top",
            color: "#0f172a",
            fontSize: 10,
            fontWeight: "bold",
            formatter: (params) =>
              Number(params.value) ? String(params.value) : "",
          },
          data,
        },
      ],
    }),
    [data],
  );

  return (
    <SectionCard className="flex h-full min-w-0 flex-col gap-3 p-4">
      <h2 className="text-base font-semibold text-[#020617]">
        RCA Ticket Not Clear
      </h2>

      {loading ? (
        <Skeleton height={240} />
      ) : !data.length ? (
        <EmptyState
          title={error ? "Gagal memuat chart RCA." : "Data belum tersedia"}
        />
      ) : (
        <ReactECharts
          option={option}
          notMerge
          style={{ height: 260, width: "100%" }}
        />
      )}
    </SectionCard>
  );
}

export default RcaNotClearChart;
