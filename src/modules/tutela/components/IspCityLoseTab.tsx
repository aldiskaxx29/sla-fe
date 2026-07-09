import React, { useMemo } from "react";
import { Table } from "antd";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IspCityLoseTabProps {
  kpi: string;
  level: "national" | "region" | "city";
  location: string;
  ispCityLoseList: any;
}

// Map the app KPI value to the series key returned by the city-lose endpoint.
const getSeriesKey = (kpiName: string) => {
  const norm = kpiName.toLowerCase();
  if (norm.includes("latency")) return "latency";
  if (norm.includes("jitter")) return "jitter";
  if (norm.includes("loss")) return "packetloss";
  if (norm.includes("download")) return "downloadSpeed";
  if (norm.includes("upload")) return "uploadSpeed";
  return "latency";
};

// Region grouping — mirrors the reference city-lose table.
const JAVA_REGIONS = [
  "INNER JABOTABEK",
  "OUTER JABOTABEK",
  "JABAR",
  "JATENG-DIY",
  "JATIM",
];
const OUTER_JAVA_REGIONS = [
  "SUMBAGUT",
  "SUMBAGTENG",
  "SUMBAGSEL",
  "BALI NUSRA",
  "KALIMANTAN",
  "SULAWESI",
  "MALUKU DAN PAPUA",
];

const TREND_COLORS = [
  "#046CDD",
  "#E42313",
  "#43936C",
  "#F0D12C",
  "#7648ba",
  "#FF9F43",
  "#00CFE8",
  "#0B8344",
  "#922A8F",
  "#F05422",
  "#00B38F",
  "#EAB308",
];

export const IspCityLoseTab: React.FC<IspCityLoseTabProps> = ({
  kpi,
  level,
  location,
  ispCityLoseList,
}) => {
  const seriesKey = getSeriesKey(kpi);
  const series: { name: string; data: number[] }[] =
    ispCityLoseList?.series?.[seriesKey] || [];
  const categories: string[] = ispCityLoseList?.categories || [];
  const weekNumber = categories.length
    ? String(categories[categories.length - 1]).slice(-2)
    : "";

  // ── Table: JAVA / OUTER JAVA / NATION grouping with last-week counts ──────
  const { tableRows, columns } = useMemo(() => {
    const lastValue = (regionName: string) => {
      const r = series.find((s) => s.name === regionName);
      if (!r || !r.data?.length) return 0;
      return r.data[r.data.length - 1] || 0;
    };

    const rows: any[] = [];
    let javaTotal = 0;
    let outerJavaTotal = 0;

    JAVA_REGIONS.forEach((region, i) => {
      const value = lastValue(region);
      javaTotal += value;
      rows.push({ key: region, no: i + 1, region, value, type: "sub" });
    });
    rows.unshift({ key: "JAVA", region: "JAVA", value: javaTotal, type: "main" });

    OUTER_JAVA_REGIONS.forEach((region, i) => {
      const value = lastValue(region);
      outerJavaTotal += value;
      rows.push({ key: region, no: i + 6, region, value, type: "sub" });
    });
    // Insert OUTER JAVA summary just before SUMBAGUT.
    const sumbagutIdx = rows.findIndex((r) => r.region === "SUMBAGUT");
    const outerSummary = {
      key: "OUTER_JAVA",
      region: "OUTER JAVA",
      value: outerJavaTotal,
      type: "main",
    };
    if (sumbagutIdx !== -1) rows.splice(sumbagutIdx, 0, outerSummary);
    else rows.push(outerSummary);

    rows.push({
      key: "NATION",
      region: "NATION",
      value: javaTotal + outerJavaTotal,
      type: "nation",
    });

    const cols = [
      {
        title: "No",
        dataIndex: "no",
        width: 50,
        align: "center" as const,
        render: (val: number, rec: any) =>
          rec.type === "sub" ? val : "",
      },
      {
        title: "Region",
        dataIndex: "region",
        render: (val: string, rec: any) => (
          <span
            className={
              rec.type === "main" || rec.type === "nation"
                ? "font-black text-slate-900"
                : ""
            }
          >
            {val}
          </span>
        ),
      },
      {
        title: `City Lose W${weekNumber}`,
        dataIndex: "value",
        align: "right" as const,
        width: 130,
        render: (val: number, rec: any) => (
          <span
            className={
              rec.type === "main" || rec.type === "nation"
                ? "font-black text-slate-900"
                : "font-semibold"
            }
          >
            {val}
          </span>
        ),
      },
    ];

    return { tableRows: rows, columns: cols };
  }, [series, weekNumber]);

  // ── Trend: NATION sum (national) or selected region line ─────────────────
  const trendData = useMemo(() => {
    const labels = categories.map((c) => {
      const s = String(c);
      return s.length === 6 ? `W${s.slice(4)}` : s;
    });

    if (series.length === 0) return { labels, datasets: [] };

    const makeDataset = (name: string, data: number[], color: string) => ({
      label: name,
      data,
      borderColor: color,
      backgroundColor: color + "1A",
      borderWidth: 2.5,
      tension: 0.3,
      pointStyle: "circle",
      pointRadius: 4,
      pointHoverRadius: 6,
      spanGaps: true,
      fill: false,
    });

    if (level === "national") {
      const total = categories.map((_, i) =>
        series.reduce((sum, r) => sum + (r.data?.[i] ?? 0), 0)
      );
      return { labels, datasets: [makeDataset("NATION", total, "#046CDD")] };
    }

    if (location) {
      const region = series.find(
        (s) => s.name.toLowerCase() === location.toLowerCase()
      );
      if (region) {
        return {
          labels,
          datasets: [makeDataset(region.name, region.data, "#046CDD")],
        };
      }
    }

    // Region level without a specific selection: show every region.
    return {
      labels,
      datasets: series.map((r, i) =>
        makeDataset(r.name, r.data, TREND_COLORS[i % TREND_COLORS.length])
      ),
    };
  }, [series, categories, level, location]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit">
        <h3 className="font-bold text-lg text-slate-900 mb-4">
          Benchmark ISP Provider Loses (By Region)
        </h3>
        <Table
          size="small"
          bordered
          dataSource={tableRows}
          columns={columns}
          rowKey="key"
          pagination={false}
          className="border border-slate-100"
          rowClassName={(rec: any) =>
            rec.type === "main"
              ? "bg-slate-100"
              : rec.type === "nation"
                ? "bg-slate-200"
                : location &&
                    rec.region.toUpperCase() === location.toUpperCase()
                  ? "bg-sky-50"
                  : ""
          }
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
        <h3 className="font-bold text-md text-slate-900 mb-4">
          Loses Trend Chart
        </h3>
        <div className="flex-1 relative min-h-[300px]">
          {ispCityLoseList ? (
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 10,
                      font: { size: 11, weight: "bold" },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context: any) {
                        let label = context.dataset.label || "";
                        if (label) label += ": ";
                        if (context.parsed.y !== null) label += context.parsed.y;
                        return label;
                      },
                    },
                  },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                  y: {
                    grid: { color: "#f1f5f9" },
                    ticks: { font: { size: 10 } },
                  },
                },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Chart data loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
