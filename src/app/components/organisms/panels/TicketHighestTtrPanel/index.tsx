import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import { Skeleton } from "@/app/components/atoms";

import type { TicketHighestTtr } from "@/app/types/ticket/ticketQuality.types";
import { withTtrColors } from "@/app/utils/ticketQuality.utils";

interface TicketHighestTtrPanelProps {
  data: TicketHighestTtr;
  loading?: boolean;
  error?: boolean;
}

export function TicketHighestTtrPanel({
  data,
  loading = false,
  error = false,
}: TicketHighestTtrPanelProps) {
  const slices = useMemo(() => withTtrColors(data.slices), [data.slices]);

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: "item", confine: true },
      series: [
        {
          type: "pie",
          radius: ["62%", "88%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          padAngle: 3,
          itemStyle: { borderRadius: 8 },
          label: { show: false },
          labelLine: { show: false },
          data: slices.map((slice) => ({
            name: slice.label,
            value: slice.value,
            itemStyle: { color: slice.color },
          })),
        },
      ],
    }),
    [slices],
  );

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e8f0] px-4 py-3">
        <h3 className="text-sm font-bold text-[#020617]">Highest TTR</h3>

        <span className="rounded-full bg-[#fee2e2] px-3 py-1 text-[11px] font-semibold text-[#dc2626]">
          {data.area}
        </span>
      </header>

      {loading ? (
        <div className="p-4">
          <Skeleton height={140} />
        </div>
      ) : error ? (
        <p className="p-4 text-xs font-semibold text-[#dc2626]">
          Gagal memuat data TTR.
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
              <span className="text-[10px] text-[#64748b]">Total Ticket</span>
              <span className="text-xl font-bold text-[#020617]">
                {data.totalTicket}
              </span>
            </div>
          </div>

          <ul className="flex min-w-0 flex-1 flex-col">
            {slices.map((slice) => (
              <li
                key={slice.label}
                className="flex items-center justify-between gap-3 border-b border-[#f1f5f9] py-2 text-[11px] last:border-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate font-medium text-[#020617]">
                    {slice.label}
                  </span>
                </span>

                <span className="shrink-0 font-bold text-[#020617]">
                  {slice.value}{" "}
                  <span className="font-normal text-[#64748b]">
                    ({slice.percentage}%)
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
