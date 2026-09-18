import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

const OGP_COLOR = "#edbd41";
const CLOSE_COLOR = "#104761";

interface ResumeRcaStackedChartProps {
  labels: string[];
  ogp: number[];
  closed: number[];
  loading?: boolean;
  error?: boolean;
  /** Klik batang membuka popup site sesuai label RCA + status. */
  onBarClick: (label: string, status: string) => void;
}

export function ResumeRcaStackedChart({
  labels,
  ogp,
  closed,
  loading = false,
  error = false,
  onBarClick,
}: ResumeRcaStackedChartProps) {
  const option = useMemo<EChartsOption>(
    () => ({
      grid: { top: 28, left: 8, right: 16, bottom: 48, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
      },
      legend: {
        bottom: 0,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#475569",
          fontSize: 10,
          fontWeight: "bold",
          hideOverlap: true,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "OGP",
          type: "bar",
          stack: "rca",
          barMaxWidth: 34,
          itemStyle: { color: OGP_COLOR, borderRadius: 0 },
          label: {
            show: true,
            position: "inside",
            color: "#0f172a",
            fontSize: 10,
            fontWeight: "bold",
            formatter: (params) =>
              Number(params.value) ? String(params.value) : "",
          },
          data: ogp,
        },
        {
          name: "Close",
          type: "bar",
          stack: "rca",
          barMaxWidth: 34,
          itemStyle: { color: CLOSE_COLOR, borderRadius: [6, 6, 0, 0] as [number, number, number, number] },
          label: {
            show: true,
            position: "inside",
            color: "#ffffff",
            fontSize: 10,
            fontWeight: "bold",
            formatter: (params) =>
              Number(params.value) ? String(params.value) : "",
          },
          data: closed,
        },
      ],
    }),
    [closed, labels, ogp],
  );

  if (loading) return <Skeleton height={260} />;

  if (!labels.length) {
    return (
      <EmptyState
        title={error ? "Gagal memuat chart RCA." : "Data belum tersedia"}
      />
    );
  }

  return (
    <ReactECharts
      option={option}
      notMerge
      style={{ height: 280, width: "100%" }}
      onEvents={{
        click: (params: { name?: string; seriesName?: string }) => {
          if (!params?.name || !params?.seriesName) return;

          onBarClick(params.name, params.seriesName);
        },
      }}
    />
  );
}

export default ResumeRcaStackedChart;
