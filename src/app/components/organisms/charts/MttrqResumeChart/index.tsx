import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import { SectionCard } from "@/app/components/molecules/SectionCard";

import type { MttrqResumeSlice } from "@/app/types/site/reportSite.types";

interface MttrqResumeChartProps {
  data: MttrqResumeSlice[];
  loading?: boolean;
  error?: boolean;
}

export function MttrqResumeChart({
  data,
  loading = false,
  error = false,
}: MttrqResumeChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: "item",
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        type: "scroll",
        bottom: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["45%", "72%"],
          center: ["50%", "42%"],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
          label: {
            show: true,
            color: "#0f172a",
            fontSize: 11,
            formatter: "{c}",
          },
          data: data.map((slice) => ({
            name: slice.label,
            value: slice.value,
            itemStyle: { color: slice.color },
          })),
        },
      ],
    }),
    [data],
  );

  return (
    <SectionCard className="flex h-full min-w-0 flex-col gap-3 p-4">
      <h2 className="text-base font-semibold text-[#020617]">Resume Issue</h2>

      {loading ? (
        <Skeleton height={280} />
      ) : !data.length ? (
        <EmptyState
          title={error ? "Gagal memuat resume issue." : "Data belum tersedia"}
        />
      ) : (
        <ReactECharts
          option={option}
          style={{ height: 320, width: "100%" }}
          notMerge
        />
      )}
    </SectionCard>
  );
}

export default MttrqResumeChart;
