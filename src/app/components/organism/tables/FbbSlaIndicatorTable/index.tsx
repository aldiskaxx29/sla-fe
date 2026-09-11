// Atoms
import Skeleton from "@/app/components/atoms/skeleton/Skeleton";

// Molecules
import { EmptyState } from "@/app/components/molecules/EmptyState";

// Types
import type { SlaWsaItem } from "@/app/types/fbb/sla.types";

// Utils
import {
  SLA_ACHIEVEMENT_THRESHOLD,
  formatAchievementLabel,
  formatDecimal,
  parseAchievement,
} from "@/app/utils/fbbSla.utils";

interface FbbSlaIndicatorTableProps {
  indicators: SlaWsaItem[];
  /** Label periode pada judul kolom Realisasi/Capaian, mis. "W35'26". */
  periodLabel: string;
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const SKELETON_ROWS = 6;
const COLUMN_COUNT = 8;

const headerCell = "px-4 py-3 text-[13px] font-semibold text-navy";
const bodyCell = "px-4 py-3 text-sm text-slate-600";

export function FbbSlaIndicatorTable({
  indicators,
  periodLabel,
  loading = false,
  errorMessage = null,
  onRetry,
}: FbbSlaIndicatorTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-50">
            <th className={`${headerCell} w-[150px] rounded-l-xl`}>Segmen</th>
            <th className={`${headerCell} min-w-[300px]`}>
              Performance Indicator
            </th>
            <th className={`${headerCell} w-[140px]`}>Layanan</th>
            <th className={`${headerCell} w-[90px]`}>Satuan</th>
            <th className={`${headerCell} w-[220px]`}>Source Data</th>
            <th className={`${headerCell} w-[100px]`}>Target</th>
            <th className={`${headerCell} w-[170px]`}>Realisasi {periodLabel}</th>
            <th className={`${headerCell} w-[170px] rounded-r-xl`}>
              Capaian {periodLabel}
            </th>
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr
                key={`skeleton-${rowIndex}`}
                className="border-b border-slate-100 last:border-b-0"
              >
                {Array.from({ length: COLUMN_COUNT }).map((__, cellIndex) => (
                  <td key={`skeleton-cell-${cellIndex}`} className="px-4 py-3">
                    <Skeleton />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            indicators.map((row, index) => {
              const achievement = parseAchievement(row.capaian);
              // Capaian yang tidak berbentuk angka dibiarkan netral.
              const isOnTarget =
                achievement === null ||
                achievement >= SLA_ACHIEVEMENT_THRESHOLD;

              return (
                <tr
                  key={`${row.performance_indicator}-${row.sumber_data}-${index}`}
                  className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3">
                    <span className="inline-block whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5 text-[13px] font-semibold text-slate-600">
                      {row.segmen}
                    </span>
                  </td>
                  <td className={`${bodyCell} font-semibold text-navy`}>
                    {row.performance_indicator}
                  </td>
                  <td className={bodyCell}>{row.layanan}</td>
                  <td className={bodyCell}>{row.satuan}</td>
                  <td className={bodyCell}>{row.sumber_data}</td>
                  <td className={`${bodyCell} tabular-nums`}>
                    {formatDecimal(row.target)}
                  </td>
                  <td className={`${bodyCell} tabular-nums`}>
                    {formatDecimal(row.value)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-bold tabular-nums ${
                      isOnTarget ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {formatAchievementLabel(row.capaian)}
                  </td>
                </tr>
              );
            })}

          {!loading && !indicators.length && (
            <tr>
              <td colSpan={COLUMN_COUNT}>
                <EmptyState
                  title={errorMessage ?? "Data indikator belum tersedia"}
                  description={
                    errorMessage
                      ? undefined
                      : "Tidak ada indikator yang cocok dengan filter ini."
                  }
                  action={
                    errorMessage && onRetry ? (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        Coba lagi
                      </button>
                    ) : null
                  }
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
