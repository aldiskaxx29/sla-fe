import { Skeleton } from "@/app/components/atoms";

import { SeverityStatCard } from "@/app/components/molecules/SeverityStatCard";

import type { TicketHighlightGroup } from "@/app/types/ticket/ticketQuality.types";
import { formatMomDelta } from "@/app/utils/ticketQuality.utils";

interface TicketHighlightSummaryPanelProps {
  groups: TicketHighlightGroup[];
  loading?: boolean;
  error?: boolean;
}

/**
 * Naik itu bagus untuk "Total Ach", sebaliknya untuk "Total Not Ach" — jadi
 * arah baik/buruknya dibalik lewat `invert`.
 */
const deltaClass = (value: number, invert: boolean) =>
  (invert ? value <= 0 : value >= 0) ? "text-[#16a34a]" : "text-[#dc2626]";

function TotalStat({
  label,
  value,
  delta,
  invert = false,
}: {
  label: string;
  value: number;
  delta: number;
  invert?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5">
      <span className="text-[11px] text-[#64748b]">{label}</span>
      <span className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-[#020617]">{value}</span>
        <span className={`text-[10px] font-semibold ${deltaClass(delta, invert)}`}>
          {formatMomDelta(delta)}
        </span>
      </span>
    </div>
  );
}

export function TicketHighlightSummaryPanel({
  groups,
  loading = false,
  error = false,
}: TicketHighlightSummaryPanelProps) {
  if (error) {
    return (
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 text-sm text-[#dc2626]">
        Gagal memuat highlight summary.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#e2e8f0] bg-white p-4"
          >
            <Skeleton height={150} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <section
          key={group.group}
          className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"
        >
          <header className="border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5">
            <h3 className="text-center text-sm font-bold text-[#020617]">
              {group.label}
            </h3>
          </header>

          <div className="flex flex-col gap-3 p-3">
            <div className="grid grid-cols-2 gap-2">
              <TotalStat
                label="Total Ach"
                value={group.totalAch}
                delta={group.totalAchMom}
              />
              <TotalStat
                label="Total Not Ach"
                value={group.totalNotAch}
                delta={group.totalNotAchMom}
                invert
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {group.severities.map((stat) => (
                <SeverityStatCard key={stat.severity} stat={stat} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
