import { Skeleton } from "@/app/components/atoms";

import type { TicketSeverityStat } from "@/app/types/ticket/ticketQuality.types";
import {
  formatTicketPercent,
  TICKET_SEVERITY_COLOR,
} from "@/app/utils/ticketQuality.utils";

interface SeverityStatCardProps {
  stat: TicketSeverityStat;
  loading?: boolean;
}

const ROW = "flex items-center justify-between gap-2 py-1.5 text-[11px]";

export function SeverityStatCard({
  stat,
  loading = false,
}: SeverityStatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-3">
        <Skeleton height={80} />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-[#e2e8f0] bg-white px-3 py-2">
      <div className="flex items-center gap-1.5 pb-1">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: TICKET_SEVERITY_COLOR[stat.severity] }}
        />
        <span className="truncate text-[11px] font-bold tracking-wide text-[#020617] uppercase">
          {stat.severity}
        </span>
      </div>

      <div className={`${ROW} border-t border-[#f1f5f9]`}>
        <span className="text-[#64748b]">Target</span>
        <span className="font-semibold text-[#020617]">
          {formatTicketPercent(stat.target)}
        </span>
      </div>

      <div className={`${ROW} border-t border-[#f1f5f9]`}>
        <span className="text-[#64748b]">Ach (%)</span>
        <span className="font-semibold text-[#020617]">
          {formatTicketPercent(stat.achievement)}
        </span>
      </div>

      <div className={`${ROW} border-t border-[#f1f5f9]`}>
        <span className="text-[#64748b]"># Not Ach</span>
        <span className="font-semibold text-[#020617]">{stat.notAchieved}</span>
      </div>
    </div>
  );
}
