import { useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption, LineSeriesOption } from "echarts";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";
import { NotchedCard } from "@/app/components/molecules/NotchedCard";
import { MonitoringCtiPanel } from "@/app/components/organism/panels/MonitoringCtiPanel";

const chartDataMap1: Record<string, Record<string, number[]>> = {
  Latency: {
    t1: [28, 28, 30, 27, 25, 29, 27, 28, 26, 28, 27, 27],
    t2: [25, 26, 27, 24, 23, 26, 25, 25, 24, 25, 24, 25],
    t3: [22, 23, 22, 21, 20, 22, 21, 22, 20, 22, 21, 21],
    t4: [18, 19, 17, 18, 16, 17, 18, 17, 16, 17, 16, 16],
  },
  "Packet Loss": {
    t1: [1.2, 1.4, 1.1, 1.5, 1.3, 1.2, 1.4, 1.3, 1.1, 1.2, 1.3, 1.2],
    t2: [2.1, 2.3, 2.0, 2.4, 2.2, 2.1, 2.3, 2.2, 2.0, 2.1, 2.2, 2.1],
    t3: [3.5, 3.7, 3.4, 3.8, 3.6, 3.5, 3.7, 3.6, 3.4, 3.5, 3.6, 3.5],
    t4: [4.8, 5.0, 4.7, 5.1, 4.9, 4.8, 5.0, 4.9, 4.7, 4.8, 4.9, 4.8],
  },
  Jitter: {
    t1: [5, 6, 5, 7, 6, 5, 6, 5, 4, 5, 6, 5],
    t2: [8, 9, 8, 10, 9, 8, 9, 8, 7, 8, 9, 8],
    t3: [12, 13, 12, 14, 13, 12, 13, 12, 11, 12, 13, 12],
    t4: [16, 17, 16, 18, 17, 16, 17, 16, 15, 16, 17, 16],
  },
};

const chartDataMap2: Record<string, Record<string, number[]>> = {
  Latency: {
    t1: [22, 23, 25, 22, 21, 24, 23, 22, 21, 23, 22, 22],
    t2: [18, 19, 20, 18, 17, 19, 18, 18, 17, 18, 17, 18],
    t3: [26, 27, 28, 25, 24, 26, 25, 26, 24, 26, 25, 25],
    t4: [14, 15, 14, 13, 12, 14, 13, 14, 12, 14, 13, 13],
  },
  "Packet Loss": {
    t1: [1.8, 1.9, 2.2, 1.7, 1.6, 2.0, 1.9, 1.8, 1.6, 1.9, 1.8, 1.8],
    t2: [2.5, 2.7, 2.9, 2.4, 2.3, 2.6, 2.5, 2.5, 2.3, 2.5, 2.4, 2.4],
    t3: [1.1, 1.2, 1.3, 1.0, 0.9, 1.2, 1.1, 1.1, 0.9, 1.1, 1.0, 1.0],
    t4: [3.2, 3.4, 3.5, 3.1, 3.0, 3.3, 3.2, 3.2, 3.0, 3.2, 3.1, 3.1],
  },
  Jitter: {
    t1: [7, 8, 7, 9, 8, 7, 8, 7, 6, 7, 8, 7],
    t2: [5, 6, 5, 7, 6, 5, 6, 5, 4, 5, 6, 5],
    t3: [14, 15, 14, 16, 15, 14, 15, 14, 13, 14, 15, 14],
    t4: [10, 11, 10, 12, 11, 10, 11, 10, 9, 10, 11, 10],
  },
};

export function TrendPerformancePanel() {
  const [metric1, setMetric1] = useState("Latency");
  const [metric2, setMetric2] = useState("Latency");

  const [visibleTerritories1, setVisibleTerritories1] = useState({
    t1: true,
    t2: true,
    t3: true,
    t4: true,
  });

  const [visibleTerritories2, setVisibleTerritories2] = useState({
    t1: true,
    t2: true,
    t3: true,
    t4: true,
  });

  const weeks = [
    "W10",
    "W11",
    "W12",
    "W13",
    "W14",
    "W15",
    "W16",
    "W17",
    "W18",
    "W19",
    "W20",
    "W21",
  ];

  const getChartOption = (
    visible: typeof visibleTerritories1,
    lineData: Record<string, number[]>,
    metricName: string,
  ): EChartsOption => {
    // Tipe eksplisit: tsconfig sla-fe lebih ketat, array kosong tanpa
    // anotasi akan tersimpulkan sebagai never[].
    const series: LineSeriesOption[] = [];

    if (visible.t1) {
      series.push({
        name: "Territory 1",
        type: "line" as const,
        data: lineData.t1,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "#3B82F6" },
      });
    }
    if (visible.t2) {
      series.push({
        name: "Territory 2",
        type: "line" as const,
        data: lineData.t2,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "#10B981" },
      });
    }
    if (visible.t3) {
      series.push({
        name: "Territory 3",
        type: "line" as const,
        data: lineData.t3,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "#6366F1" },
      });
    }
    if (visible.t4) {
      series.push({
        name: "Territory 4",
        type: "line" as const,
        data: lineData.t4,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: "#EC4899" },
      });
    }

    let yMin = 10;
    let yMax = 40;
    let baselineValue = 24;

    if (metricName === "Packet Loss") {
      yMin = 0;
      yMax = 6;
      baselineValue = 3.5;
    } else if (metricName === "Jitter") {
      yMin = 0;
      yMax = 20;
      baselineValue = 12;
    }

    return {
      grid: {
        top: "10%",
        left: "3%",
        right: "3%",
        bottom: "25%",
        containLabel: true,
      },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: weeks,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#E2E8F0" } },
        axisLabel: { color: "#64748B", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        min: yMin,
        max: yMax,
        splitLine: { lineStyle: { color: "#F1F5F9" } },
        axisLabel: { color: "#64748B", fontSize: 10 },
      },
      dataZoom: [
        {
          type: "slider",
          height: 10,
          bottom: 10,
          textStyle: { color: "transparent" },
          handleSize: 8,
          fillerColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "#E2E8F0",
        },
      ],
      series: [
        ...series,
        {
          name: "Baseline",
          type: "line" as const,
          data: [],
          markLine: {
            symbol: ["none", "none"],
            data: [
              {
                yAxis: baselineValue,
                lineStyle: { type: "dashed", color: "#94A3B8", width: 1.5 },
                label: { show: false },
              },
            ],
          },
        },
      ],
    };
  };

  return (
    <NotchedCard title="Trend Performance">
      <div className="flex flex-1 flex-col gap-3 mt-1">
        <div className="flex flex-col border border-slate-200 bg-white rounded-2xl p-3 shadow-xs">
          <header className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-xs font-bold text-[#213c52]">
              Trend Quality Core
            </h3>
            <SelectMenu
              value={metric1}
              onChange={setMetric1}
              options={[
                { label: "Latency", value: "Latency" },
                { label: "Packet Loss", value: "Packet Loss" },
                { label: "Jitter", value: "Jitter" },
              ]}
              size="sm"
              className="text-xs font-semibold"
            />
          </header>

          <div className="h-36 w-full">
            <ReactECharts
              option={getChartOption(
                visibleTerritories1,
                chartDataMap1[metric1] || chartDataMap1.Latency,
                metric1,
              )}
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories1.t1}
                onChange={(e) =>
                  setVisibleTerritories1({
                    ...visibleTerritories1,
                    t1: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              <span>Territory 1</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories1.t2}
                onChange={(e) =>
                  setVisibleTerritories1({
                    ...visibleTerritories1,
                    t2: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span>Territory 2</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories1.t3}
                onChange={(e) =>
                  setVisibleTerritories1({
                    ...visibleTerritories1,
                    t3: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
              <span>Territory 3</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories1.t4}
                onChange={(e) =>
                  setVisibleTerritories1({
                    ...visibleTerritories1,
                    t4: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#EC4899]" />
              <span>Territory 4</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col border border-slate-200 bg-white rounded-xl p-3 shadow-xs">
          <header className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-xs font-bold text-[#213c52]">
              Trend Quality Core
            </h3>
            <SelectMenu
              value={metric2}
              onChange={setMetric2}
              options={[
                { label: "Latency", value: "Latency" },
                { label: "Packet Loss", value: "Packet Loss" },
                { label: "Jitter", value: "Jitter" },
              ]}
              size="sm"
              className="text-xs font-semibold"
            />
          </header>

          <div className="h-36 w-full">
            <ReactECharts
              option={getChartOption(
                visibleTerritories2,
                chartDataMap2[metric2] || chartDataMap2.Latency,
                metric2,
              )}
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories2.t1}
                onChange={(e) =>
                  setVisibleTerritories2({
                    ...visibleTerritories2,
                    t1: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              <span>Territory 1</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories2.t2}
                onChange={(e) =>
                  setVisibleTerritories2({
                    ...visibleTerritories2,
                    t2: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#10B981]" />
              <span>Territory 2</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories2.t3}
                onChange={(e) =>
                  setVisibleTerritories2({
                    ...visibleTerritories2,
                    t3: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#6366F1]" />
              <span>Territory 3</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTerritories2.t4}
                onChange={(e) =>
                  setVisibleTerritories2({
                    ...visibleTerritories2,
                    t4: e.target.checked,
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="h-2 w-2 rounded-full bg-[#EC4899]" />
              <span>Territory 4</span>
            </label>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <MonitoringCtiPanel />
      </div>
    </NotchedCard>
  );
}
