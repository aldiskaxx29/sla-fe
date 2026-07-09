import React, { useMemo } from "react";
import { Select, Table } from "antd";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
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

interface MobileTrendTabProps {
  category: "operator" | "location";
  view: "chart" | "table";
  setView: (val: "chart" | "table") => void;
  kpi: string;
  level: string;
  granularity: string;
  selectedOperator: string;
  selectedLocations: string[];
  selectedOperators: string[];
  trendChartDataList: any[];
}

const getOperatorConfig = (name: string) => {
  const operatorConfig: Record<string, { color: string; bg: string; text: string; label: string }> = {
    telkomsel: { color: "#EE2E50", bg: "bg-[#EE2E50]", text: "text-[#EE2E50]", label: "T" },
    indosat: { color: "#F7931A", bg: "bg-[#F7931A]", text: "text-[#F7931A]", label: "I" },
    xl: { color: "#5470DE", bg: "bg-[#5470DE]", text: "text-[#5470DE]", label: "X" },
    default: { color: "#999999", bg: "bg-slate-400", text: "text-slate-400", label: "O" },
  };
  const normalized = name?.toLowerCase() || "default";
  if (normalized.includes("telkomsel")) return operatorConfig.telkomsel;
  if (normalized.includes("indosat")) return operatorConfig.indosat;
  if (normalized.includes("xl")) return operatorConfig.xl;
  return operatorConfig.default;
};

export const MobileTrendTab: React.FC<MobileTrendTabProps> = ({
  category,
  view,
  setView,
  kpi,
  level,
  granularity,
  selectedOperator,
  selectedLocations,
  selectedOperators,
  trendChartDataList,
}) => {
  const lineChartData = useMemo(() => {
    const periods = Array.from(
      new Set(trendChartDataList.map((d) => String(d.yearWeek || d.date)))
    ).sort((a, b) => a.localeCompare(b));

    if (category === "operator") {
      const groupedByOperator: Record<string, Record<string, number>> = {};
      trendChartDataList.forEach((row) => {
        const op = row.operator;
        const periodKey = String(row.yearWeek || row.date);
        const val = row[kpi];
        if (op && periodKey && val !== undefined && val !== null) {
          if (!groupedByOperator[op]) groupedByOperator[op] = {};
          groupedByOperator[op][periodKey] = val;
        }
      });

      const datasets = Object.keys(groupedByOperator)
        .filter((op) =>
          selectedOperators.some((o) => o.toLowerCase() === op.toLowerCase())
        )
        .map((op) => {
          const opConf = getOperatorConfig(op);
          const dataPoints = periods.map((p) => groupedByOperator[op][p] ?? null);

          return {
            label: op,
            data: dataPoints,
            borderColor: opConf.color,
            backgroundColor: opConf.color + "1A",
            borderWidth: 2.5,
            tension: 0.4,
            pointStyle: "circle",
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true,
            fill: false,
          };
        });

      return {
        labels: periods.map((p) => (p.length === 6 ? `W${p.slice(4)}` : p)),
        datasets,
      };
    } else {
      const groupedByLocation: Record<string, Record<string, number>> = {};
      const opLower = selectedOperator.toLowerCase();

      trendChartDataList
        .filter((row) => row.operator?.toLowerCase() === opLower)
        .forEach((row) => {
          const loc = row.location || "Nation";
          const periodKey = String(row.yearWeek || row.date);
          const val = row[kpi];
          if (loc && periodKey && val !== undefined && val !== null) {
            if (!groupedByLocation[loc]) groupedByLocation[loc] = {};
            groupedByLocation[loc][periodKey] = val;
          }
        });

      const colors = [
        "#046CDD",
        "#E42313",
        "#43936C",
        "#F0D12C",
        "#7648ba",
        "#FF9F43",
        "#00CFE8",
      ];

      const datasets = Object.keys(groupedByLocation)
        .filter((loc) => {
          if (level === "national") return true;
          return selectedLocations.some((l) => l.toLowerCase() === loc.toLowerCase());
        })
        .map((loc, idx) => {
          const color = colors[idx % colors.length];
          const dataPoints = periods.map((p) => groupedByLocation[loc][p] ?? null);

          return {
            label: loc,
            data: dataPoints,
            borderColor: color,
            backgroundColor: color + "1A",
            borderWidth: 2.5,
            tension: 0.4,
            pointStyle: "circle",
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true,
            fill: false,
          };
        });

      return {
        labels: periods.map((p) => (p.length === 6 ? `W${p.slice(4)}` : p)),
        datasets,
      };
    }
  }, [
    trendChartDataList,
    kpi,
    selectedOperators,
    selectedOperator,
    selectedLocations,
    category,
    level,
  ]);

  const trendTableData = useMemo(() => {
    const isWeekly = granularity !== "daily";
    const opLower = selectedOperator.toLowerCase();

    const getSubColumns = (kpiName: string, prefix: string) => {
      const norm = kpiName.toLowerCase();
      const isSpeed = norm.includes("download") || norm.includes("upload") || norm.includes("speed");
      
      const subCols = [
        {
          title: "Overall",
          dataIndex: prefix + "_overall",
          align: "right" as const,
          width: 100,
          render: (value: number | undefined) => {
            return (value !== undefined && value !== null) ? value.toFixed(2) : "-";
          },
        }
      ];

      if (isSpeed) {
        subCols.push(
          {
            title: "Akamai",
            dataIndex: prefix + "_akamai",
            align: "right" as const,
            width: 100,
            render: (value: number | undefined) => {
              return (value !== undefined && value !== null) ? value.toFixed(2) : "-";
            },
          },
          {
            title: "Cloudfront",
            dataIndex: prefix + "_cloudfront",
            align: "right" as const,
            width: 100,
            render: (value: number | undefined) => {
              return (value !== undefined && value !== null) ? value.toFixed(2) : "-";
            },
          },
          {
            title: "Google",
            dataIndex: prefix + "_google",
            align: "right" as const,
            width: 100,
            render: (value: number | undefined) => {
              return (value !== undefined && value !== null) ? value.toFixed(2) : "-";
            },
          }
        );
      } else {
        subCols.push(
          {
            title: "Amazon",
            dataIndex: prefix + "_amazon",
            align: "right" as const,
            width: 100,
            render: (value: number | undefined) => {
              return (value !== undefined && value !== null) ? value.toFixed(2) : "-";
            },
          },
          {
            title: "Google",
            dataIndex: prefix + "_google",
            align: "right" as const,
            width: 100,
            render: (value: number | undefined) => {
              return (value !== undefined && value !== null) ? value.toFixed(2) : "-";
            },
          }
        );
      }

      return subCols;
    };

    if (category === "operator") {
      const newData: any[] = [];

      trendChartDataList.forEach((item) => {
        const operator = (item.operator?.toLowerCase() ?? "");
        const groupKey = isWeekly ? item.yearWeek : item.date;
        if (!groupKey) return;

        let index = newData.findIndex((d) => d.key === groupKey);
        if (index === -1) {
          const formatted: any = {
            key: groupKey,
            yearWeek: item.yearWeek ?? null,
            date: item.date ?? null,
            startDate: item.startDate ?? null,
            endDate: item.endDate ?? null,
          };
          newData.push(formatted);
          index = newData.length - 1;
        }

        const val = item[kpi];
        if (val !== undefined && val !== null) {
          const isPlatform = item.source === "platform";
          const platform = item.platform || item.source;
          if (!isPlatform || !platform) {
            newData[index][`${operator}_overall`] = val;
          } else {
            newData[index][`${operator}_${platform.toLowerCase()}`] = val;
          }
        }
      });

      newData.sort((a, b) => String(b.key).localeCompare(String(a.key)));

      const columns: any[] = [];
      if (isWeekly) {
        columns.push(
          {
            title: "Yearweek",
            dataIndex: "yearWeek",
            width: 120,
            fixed: "left" as const,
          },
          {
            title: "Start Date",
            dataIndex: "startDate",
            width: 120,
            render: (val: string) => val ? dayjs(val).format("YYYY-MM-DD") : "-",
          },
          {
            title: "End Date",
            dataIndex: "endDate",
            width: 120,
            render: (val: string) => val ? dayjs(val).format("YYYY-MM-DD") : "-",
          }
        );
      } else {
        columns.push({
          title: "Date",
          dataIndex: "date",
          width: 120,
          fixed: "left" as const,
          render: (val: string) => val ? dayjs(val).format("YYYY-MM-DD") : "-",
        });
      }

      selectedOperators.forEach((o) => {
        columns.push({
          title: o,
          align: "right",
          children: getSubColumns(kpi, o.toLowerCase())
        });
      });

      return { columns, dataSource: newData };
    } else {
      const newData: any[] = [];
      trendChartDataList
        .filter((d) => (d.operator ?? "").toLowerCase() === opLower)
        .forEach((item) => {
          const locationKey = (item.location?.toLowerCase() ?? "");
          const groupKey = isWeekly ? item.yearWeek : item.date;
          if (!groupKey) return;

          let index = newData.findIndex((d) => d.key === groupKey);
          if (index === -1) {
            const formatted: any = {
              key: groupKey,
              yearWeek: item.yearWeek ?? null,
              date: item.date ?? null,
              startDate: item.startDate ?? null,
              endDate: item.endDate ?? null,
            };
            newData.push(formatted);
            index = newData.length - 1;
          }

          const val = item[kpi];
          if (val !== undefined && val !== null) {
            const isPlatform = item.source === "platform";
            const platform = item.platform || item.source;
            if (!isPlatform || !platform) {
              newData[index][`${locationKey}_overall`] = val;
            } else {
              newData[index][`${locationKey}_${platform.toLowerCase()}`] = val;
            }
          }
        });

      newData.sort((a, b) => String(b.key).localeCompare(String(a.key)));

      const columns: any[] = [];
      if (isWeekly) {
        columns.push(
          {
            title: "Yearweek",
            dataIndex: "yearWeek",
            width: 120,
            fixed: "left" as const,
          },
          {
            title: "Start Date",
            dataIndex: "startDate",
            width: 120,
            render: (val: string) => val ? dayjs(val).format("YYYY-MM-DD") : "-",
          },
          {
            title: "End Date",
            dataIndex: "endDate",
            width: 120,
            render: (val: string) => val ? dayjs(val).format("YYYY-MM-DD") : "-",
          }
        );
      } else {
        columns.push({
          title: "Date",
          dataIndex: "date",
          width: 120,
          fixed: "left" as const,
          render: (val: string) => val ? dayjs(val).format("YYYY-MM-DD") : "-",
        });
      }

      selectedLocations.forEach((loc) => {
        columns.push({
          title: loc,
          align: "right",
          children: getSubColumns(kpi, loc.toLowerCase())
        });
      });

      return { columns, dataSource: newData };
    }
  }, [
    trendChartDataList,
    selectedOperators,
    selectedOperator,
    selectedLocations,
    category,
    kpi,
    granularity,
    level,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-md text-slate-900 uppercase">
            {category === "operator" ? "Operator" : "Location"} Trend {view === "chart" ? "Line Chart" : "Table"} ({kpi})
          </h3>
          <Select
            value={view}
            onChange={(val) => setView(val)}
            className="w-32"
            options={[
              { label: "Chart", value: "chart" },
              { label: "Table", value: "table" },
            ]}
          />
        </div>
        <div className="flex-1 relative min-h-[300px] overflow-x-auto">
          {trendChartDataList.length > 0 ? (
            view === "chart" ? (
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index",
                    intersect: false,
                  },
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
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(2);
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 10 } },
                    },
                    y: {
                      grid: { color: "#f1f5f9" },
                      ticks: { font: { size: 10 } },
                    },
                  },
                }}
              />
            ) : (
              <Table
                dataSource={trendTableData.dataSource}
                columns={trendTableData.columns}
                rowKey="key"
                pagination={false}
                className="border border-slate-100"
                scroll={{ x: "max-content" }}
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Select time range and locations to plot trend chart.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
