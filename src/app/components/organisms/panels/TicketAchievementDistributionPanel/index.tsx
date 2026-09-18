import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Skeleton } from "@/app/components/atoms";

import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { TICKET_SEVERITY_OPTIONS } from "@/app/api/ticket";
import type {
  TicketAchievementDistribution,
  TicketSeverityFilter,
} from "@/app/types/ticket/ticketQuality.types";

const ACHIEVED_COLOR = "#16a34a";
const NOT_ACHIEVED_COLOR = "#ef4444";

interface TicketAchievementDistributionPanelProps {
  data: TicketAchievementDistribution;
  severity: TicketSeverityFilter;
  onSeverityChange: (value: TicketSeverityFilter) => void;
  loading?: boolean;
  error?: boolean;
}

export function TicketAchievementDistributionPanel({
  data,
  severity,
  onSeverityChange,
  loading = false,
  error = false,
}: TicketAchievementDistributionPanelProps) {
  const total = data.totalAchieved + data.totalNotAchieved;

  const percentOf = (value: number) =>
    total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: "item", confine: true },
      series: [
        {
          type: "pie",
          radius: ["68%", "90%"],
          center: ["50%", "50%"],
          padAngle: 3,
          itemStyle: { borderRadius: 8 },
          label: { show: false },
          labelLine: { show: false },
          data: [
            {
              name: "Total Achieve",
              value: data.totalAchieved,
              itemStyle: { color: ACHIEVED_COLOR },
            },
            {
              name: "Total Not Achieve",
              value: data.totalNotAchieved,
              itemStyle: { color: NOT_ACHIEVED_COLOR },
            },
          ],
        },
      ],
    }),
    [data],
  );

  const legend = [
    {
      label: "TOTAL ACHIEVE",
      value: data.totalAchieved,
      color: ACHIEVED_COLOR,
    },
    {
      label: "TOTAL NOT ACHIEVE",
      value: data.totalNotAchieved,
      color: NOT_ACHIEVED_COLOR,
    },
  ];

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] px-4 py-3">
        <h3 className="text-sm font-bold text-[#020617]">
          Achievement Distribution
        </h3>

        <SelectMenu
          value={severity}
          options={[...TICKET_SEVERITY_OPTIONS]}
          onChange={(value) => onSeverityChange(value as TicketSeverityFilter)}
          className="[&_button]:h-9 [&_button]:w-[150px] [&_button]:rounded-lg [&_button]:border-[#e2e8f0] [&_button]:text-xs"
        />
      </header>

      {loading ? (
        <div className="p-4">
          <Skeleton height={140} />
        </div>
      ) : error ? (
        <p className="p-4 text-xs font-semibold text-[#dc2626]">
          Gagal memuat distribusi achievement.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4 p-4">
          <div className="relative size-[132px] shrink-0">
            <ReactECharts
              option={option}
              style={{ height: 132, width: 132 }}
              notMerge
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-[#64748b]">Total Achieve</span>
              <span className="text-xl font-bold text-[#020617]">
                {data.totalAchieved}
              </span>
            </div>
          </div>

          <ul className="flex min-w-0 flex-1 flex-col">
            {legend.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 border-b border-[#f1f5f9] py-2 text-[11px] last:border-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate font-medium text-[#020617]">
                    {item.label}
                  </span>
                </span>

                <span className="shrink-0 font-bold text-[#020617]">
                  {item.value}{" "}
                  <span className="font-normal text-[#64748b]">
                    ({percentOf(item.value)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
