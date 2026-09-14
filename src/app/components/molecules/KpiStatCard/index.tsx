import type { ComponentType } from "react";

import { Skeleton } from "@/app/components/atoms";

interface KpiStatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  valueClassName?: string;
  loading?: boolean;
}

export function KpiStatCard({
  icon: Icon,
  label,
  value,
  valueClassName = "text-[#050505]",
  loading = false,
}: KpiStatCardProps) {
  return (
    <div className="flex h-14 min-w-[200px] flex-1 items-stretch overflow-hidden rounded-xl border border-[#e2e8f0]">
      <div className="flex min-w-0 flex-1 items-center gap-2 border-r border-[#e2e8f0] px-3">
        <Icon className="size-4 shrink-0 text-[#334155]" />
        <span className="truncate text-sm font-semibold text-[#0f172a]">
          {label}
        </span>
      </div>

      <div className="flex w-20 shrink-0 items-center justify-center px-3">
        {loading ? (
          <Skeleton width={32} height={20} />
        ) : (
          <span className={`text-xl leading-none font-bold ${valueClassName}`}>
            {value}
          </span>
        )}
      </div>
    </div>
  );
}
