import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { PeHsiLatencyTrend } from "@/app/types/network/peHsi.types";

const GATEWAY_COLORS: Record<string, string> = {
  BDS: "#f97316",
  BTC: "#22c55e",
  PNK: "#d946ef",
  JT2: "#0ea5e9",
};

interface PeHsiLatencyTrendChartProps {
  trend: PeHsiLatencyTrend;
}

export function PeHsiLatencyTrendChart({ trend }: PeHsiLatencyTrendChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const maxValue = Math.max(
      0,
      ...trend.gateways.flatMap((gateway) => gateway.series),
    );

    return {
      grid: { top: 16, left: 8, right: 24, bottom: 48, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
      },
      legend: {
        bottom: 0,
        icon: "roundRect",
        itemWidth: 14,
        itemHeight: 4,
        itemGap: 20,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.categories,
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11, margin: 12 },
        splitLine: { show: true, lineStyle: { color: "#f1f5f9" } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: Math.max(20, Math.ceil((maxValue + 10) / 20) * 20),
        splitNumber: 4,
        axisLabel: { color: "#94a3b8", fontSize: 11 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: trend.gateways.map((gateway) => ({
        name: `${gateway.gateway} Latency`,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 7,
        data: gateway.series,
        lineStyle: {
          color: GATEWAY_COLORS[gateway.gateway] ?? "#0ea5e9",
          width: 2,
        },
        itemStyle: {
          color: "#ffffff",
          borderColor: GATEWAY_COLORS[gateway.gateway] ?? "#0ea5e9",
          borderWidth: 2,
        },
      })),
    };
  }, [trend]);

  if (!trend.gateways.length || !trend.categories.length) {
    return <EmptyState title="Data trend latency belum tersedia" />;
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 240, width: "100%" }}
      notMerge
    />
  );
}
