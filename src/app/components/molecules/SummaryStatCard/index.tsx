// React
import type { ReactNode } from "react";

// Atoms
import Skeleton from "@/app/components/atoms/skeleton/Skeleton";

interface SummaryStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
}

/** Kartu ringkasan satu angka: ikon, label, dan nilainya sebagai pil. */
export function SummaryStatCard({
  icon,
  label,
  value,
  loading = false,
}: SummaryStatCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#DBDBDB] bg-white px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-lg text-navy">{icon}</span>
        <span className="truncate text-sm font-semibold text-navy">
          {label}
        </span>
      </div>

      {loading ? (
        <Skeleton width={40} height={24} className="shrink-0 rounded-full" />
      ) : (
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
          {value}
        </span>
      )}
    </div>
  );
}
