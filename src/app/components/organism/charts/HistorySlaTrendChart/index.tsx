import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Skeleton } from "@/app/components/atoms";

import type {
  HistorySlaSegment,
  HistorySlaTrendPoint,
} from "@/app/types/first-insight/historySla.types";

const LINE_COLOR = "#0ea5e9";
const SEGMENT_ORDER: HistorySlaSegment[] = ["MBB", "FBB", "OLO", "EBIS"];

const buildTooltip = (point: HistorySlaTrendPoint) => {
  const rows = SEGMENT_ORDER.map(
    (segment) => `
      <div style="display:flex;justify-content:space-between;gap:24px;font-size:11px;color:#334155;line-height:18px">
        <span>${segment}</span>
        <span style="color:#020617">${point.segments[segment]}</span>
      </div>`,
  ).join("");

  return `
    <div style="min-width:132px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px">
        <span style="font-size:12px;font-weight:600;color:#020617">${point.period}</span>
        <span style="border-radius:6px;background:#fdeeee;padding:1px 6px;font-size:11px;font-weight:600;color:#dc2626">${point.total} KPI</span>
      </div>
      ${rows}
    </div>`;
};

interface HistorySlaTrendChartProps {
  points: HistorySlaTrendPoint[];
  loading?: boolean;
}

export function HistorySlaTrendChart({
  points,
  loading = false,
}: HistorySlaTrendChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const maxValue = Math.max(0, ...points.map((point) => point.total));

    return {
      grid: { top: 20, left: 8, right: 16, bottom: 56, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { color: "#475569", width: 1 },
        },
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: [8, 10],
        extraCssText:
          "border-radius:8px;box-shadow:0px 8px 24px rgba(2,6,23,0.12);",
        formatter: (params) => {
          const [first] = Array.isArray(params) ? params : [params];
          const point = points[Number(first?.dataIndex ?? 0)];
          return point ? buildTooltip(point) : "";
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: points.map((point) => point.month),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#64748b", fontSize: 11, margin: 44 },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: Math.max(5, Math.ceil((maxValue + 1) / 5) * 5),
        minInterval: 1,
        axisLabel: { color: "#64748b", fontSize: 11 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      dataZoom: [
        {
          type: "slider",
          height: 6,
          bottom: 30,
          start: 0,
          end: 100,
          borderColor: "transparent",
          backgroundColor: "#f1f5f9",
          fillerColor: "rgba(14,165,233,0.25)",
          handleSize: 0,
          moveHandleSize: 0,
          showDetail: false,
          showDataShadow: false,
          brushSelect: false,
        },
        { type: "inside" },
      ],
      series: [
        {
          type: "line",
          smooth: true,
          data: points.map((point) => point.total),
          symbol: "circle",
          symbolSize: 7,
          lineStyle: { color: LINE_COLOR, width: 2.5 },
          itemStyle: {
            color: "#ffffff",
            borderColor: LINE_COLOR,
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "top",
            color: "#334155",
            fontSize: 11,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [points]);

  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-[19px] border border-[#e2e8f0] bg-white p-4 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
      <h2 className="text-base font-semibold text-[#020617]">
        Trend Total KPI Not Clear
      </h2>

      {loading ? (
        <div className="flex h-[250px] items-center">
          <Skeleton height={220} />
        </div>
      ) : (
        <ReactECharts option={option} style={{ height: 250, width: "100%" }} notMerge />
      )}
    </section>
  );
}
