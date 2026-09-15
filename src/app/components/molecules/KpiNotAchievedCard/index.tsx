import type { ComponentType } from "react";

import { Skeleton } from "@/app/components/atoms";

interface KpiNotAchievedCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  total: number;
  iconClassName?: string;
  highlight?: boolean;
  loading?: boolean;
}

export function KpiNotAchievedCard({
  icon: Icon,
  label,
  value,
  total,
  iconClassName = "bg-[#f1f5f9] text-[#334155]",
  highlight = false,
  loading = false,
}: KpiNotAchievedCardProps) {
  return (
    <div
      className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border px-4 ${
        highlight
          ? "h-[68px] border-[#fde2e2] bg-[#fdeeee]"
          : "h-[64px] border-[#e2e8f0] bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="size-4" />
        </span>
        <span
          className={`truncate text-[#0f172a] ${
            highlight ? "text-[15px] font-semibold" : "text-[15px] font-medium"
          }`}
        >
          {label}
        </span>
      </div>

      {loading ? (
        <Skeleton width={56} height={24} />
      ) : (
        <span className="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
          <span
            className={`leading-none font-semibold text-[#dc2626] tabular-nums ${
              highlight ? "text-[28px]" : "text-[22px]"
            }`}
          >
            {value}
          </span>
          <span className="text-sm text-[#64748b]">of {total}</span>
        </span>
      )}
    </div>
  );
}
