import { LuLink, LuTriangleAlert } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { SectionCard } from "@/app/components/molecules/SectionCard";

import type {
  PeHsiBestPath,
  PeHsiIssueBreakdown,
} from "@/app/types/network/peHsi.types";

interface PeHsiSummaryPanelProps {
  totalLink: number;
  bestPath: PeHsiBestPath[];
  issueLink: number;
  issueBreakdown: PeHsiIssueBreakdown[];
  loading?: boolean;
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-[130px] flex-1 items-center justify-between gap-3 rounded-lg bg-[#f1f5f9] px-3 py-2">
      <span className="truncate text-sm text-[#64748b]">{label}</span>
      <span className="text-sm font-semibold text-[#0f172a] tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function PeHsiSummaryPanel({
  totalLink,
  bestPath,
  issueLink,
  issueBreakdown,
  loading = false,
}: PeHsiSummaryPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard className="flex flex-col gap-3 p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#020617]">
          <LuLink className="size-5 text-[#2563eb]" />
          Jumlah Link
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <span className="w-[120px] shrink-0 text-[32px] leading-none font-bold text-[#0f172a] tabular-nums">
            {loading ? <Skeleton width={80} height={30} /> : totalLink}
          </span>

          <div className="min-w-0 flex-1 border-l border-[#e2e8f0] pl-4">
            <p className="mb-1.5 text-xs text-[#64748b]">Best Path</p>
            <div className="flex flex-wrap gap-2">
              {bestPath.map((item) => (
                <StatChip
                  key={item.path}
                  label={item.path}
                  value={`${item.percentage}%`}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="flex flex-col gap-3 p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#020617]">
          <LuTriangleAlert className="size-5 text-[#dc2626]" />
          Issue Link
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <span className="w-[120px] shrink-0 text-[32px] leading-none font-bold text-[#dc2626] tabular-nums">
            {loading ? <Skeleton width={60} height={30} /> : issueLink}
          </span>

          <div className="min-w-0 flex-1 border-l border-[#e2e8f0] pl-4">
            <p className="mb-1.5 text-xs text-[#64748b]">Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {issueBreakdown.map((item) => (
                <StatChip
                  key={item.metric}
                  label={item.label}
                  value={item.total}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
