import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { TicketRegionRank } from "@/app/types/ticket/ticketQuality.types";
import { formatTicketAchievement } from "@/app/utils/ticketQuality.utils";

type RankTone = "best" | "worst";

interface TicketRegionRankTableProps {
  title: string;
  tone: RankTone;
  rows: TicketRegionRank[];
  loading?: boolean;
  error?: boolean;
}

const TONE_STYLE: Record<RankTone, { icon: typeof LuTrendingUp; className: string }> =
  {
    best: { icon: LuTrendingUp, className: "text-[#16a34a]" },
    worst: { icon: LuTrendingDown, className: "text-[#dc2626]" },
  };

export function TicketRegionRankTable({
  title,
  tone,
  rows,
  loading = false,
  error = false,
}: TicketRegionRankTableProps) {
  const style = TONE_STYLE[tone];
  const Icon = style.icon;

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <header className="flex items-center gap-2 px-3 py-2.5">
        <Icon className={`size-4 shrink-0 ${style.className}`} />
        <h3 className="truncate text-sm font-bold text-[#020617]">{title}</h3>
      </header>

      {loading ? (
        <div className="p-3">
          <Skeleton height={160} />
        </div>
      ) : error || !rows.length ? (
        <EmptyState
          title={error ? "Gagal memuat data." : "Data belum tersedia"}
        />
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="h-9 border-y border-[#e2e8f0] bg-[#f8fafc] px-3 text-[11px] font-semibold text-[#64748b]">
                Region
              </th>
              <th className="h-9 border-y border-[#e2e8f0] bg-[#f8fafc] px-3 text-right text-[11px] font-semibold text-[#64748b]">
                Ach%
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.region} className="hover:bg-[#f8fafc]">
                <td className="h-9 border-b border-[#f1f5f9] px-3 text-[11px] whitespace-nowrap text-[#0f172a]">
                  {row.region}
                </td>
                <td
                  className={`h-9 border-b border-[#f1f5f9] px-3 text-right text-[11px] font-bold ${style.className}`}
                >
                  {formatTicketAchievement(row.achievement)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
