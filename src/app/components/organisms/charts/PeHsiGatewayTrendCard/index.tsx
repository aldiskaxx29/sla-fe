import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import type { PeHsiVerifierTrend } from "@/app/types/network/peHsi.types";

interface PeHsiGatewayTrendCardProps {
  trend: PeHsiVerifierTrend;
  totalPe?: number;
}

export function PeHsiGatewayTrendCard({
  trend,
  totalPe,
}: PeHsiGatewayTrendCardProps) {
  const option = useMemo<EChartsOption>(() => {
    const maxValue = Math.max(0, ...trend.series);

    return {
      grid: { top: 24, left: 4, right: 12, bottom: 4, containLabel: true },
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
        data: trend.categories,
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 10, margin: 10 },
        splitLine: { show: true, lineStyle: { color: "#f1f5f9" } },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: Math.max(20, Math.ceil((maxValue + 5) / 20) * 20),
        splitNumber: 4,
        axisLabel: { color: "#94a3b8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: trend.series,
          symbol: "circle",
          symbolSize: 7,
          lineStyle: { color: "#0ea5e9", width: 2.5 },
          itemStyle: {
            color: "#ffffff",
            borderColor: "#0ea5e9",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "top",
            distance: 8,
            color: "#0f172a",
            fontSize: 10,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [trend]);

  return (
    <section className="rounded-xl border border-[#e2e8f0] bg-white p-4">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#0f172a]">
          {trend.verifier_name}
        </h3>
        <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#2563eb]">
          {trend.current_count}
          {totalPe ? `/${totalPe}` : ""} Not Degrade
        </span>
      </header>

      <ReactECharts
        option={option}
        style={{ height: 180, width: "100%" }}
        notMerge
      />
    </section>
  );
}
