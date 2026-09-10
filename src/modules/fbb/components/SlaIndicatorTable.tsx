import { SLA_ACHIEVEMENT_THRESHOLD } from "@/modules/fbb/constants/slaFbb";
import type { SlaWsaItem } from "@/modules/fbb/types/sla.types";
import {
  formatAchievementLabel,
  formatDecimal,
  parseAchievement,
} from "@/modules/fbb/utils/sla.utils";

interface SlaIndicatorTableProps {
  indicators: SlaWsaItem[];
  periodLabel: string;
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

const SKELETON_ROWS = 6;

const SlaIndicatorTable = ({
  indicators,
  periodLabel,
  loading = false,
  errorMessage = null,
  onRetry,
}: SlaIndicatorTableProps) => {
  const headerCell = "px-4 py-4 text-[13px] font-semibold text-[#18181B]";
  const bodyCell = "px-4 py-4 text-[14px] text-[#3F3F46]";

  return (
    <div className="overflow-x-auto px-2 pb-2">
      <table className="w-full min-w-[1100px] border-collapse text-left">
        <thead>
          <tr className="bg-[#F7F7F8]">
            <th className={`${headerCell} w-[150px] rounded-l-xl`}>Segmen</th>
            <th className={`${headerCell} min-w-[300px]`}>
              Performance Indicator
            </th>
            <th className={`${headerCell} w-[140px]`}>Layanan</th>
            <th className={`${headerCell} w-[90px]`}>Satuan</th>
            <th className={`${headerCell} w-[220px]`}>Source Data</th>
            <th className={`${headerCell} w-[100px]`}>Target</th>
            <th className={`${headerCell} w-[170px]`}>
              Realisasi {periodLabel}
            </th>
            <th className={`${headerCell} w-[170px] rounded-r-xl`}>
              Capaian {periodLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <tr
                key={`skeleton-${index}`}
                className="border-b border-[#F1F1F2] last:border-b-0"
              >
                {Array.from({ length: 8 }).map((__, cellIndex) => (
                  <td key={`skeleton-cell-${cellIndex}`} className="px-4 py-4">
                    <div className="h-4 w-full animate-pulse rounded bg-[#F1F1F2]" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            indicators.map((row, index) => {
              const achievement = parseAchievement(row.capaian);
              const isOnTarget =
                achievement === null ||
                achievement >= SLA_ACHIEVEMENT_THRESHOLD;

              return (
                <tr
                  key={`${row.performance_indicator}-${row.sumber_data}-${index}`}
                  className="border-b border-[#F1F1F2] transition-colors last:border-b-0 hover:bg-[#FAFAFA]"
                >
                  <td className="px-4 py-4">
                    <span className="inline-block whitespace-nowrap rounded-lg bg-[#F4F4F5] px-3 py-1.5 text-[13px] text-[#3F3F46]">
                      {row.segmen}
                    </span>
                  </td>
                  <td className={`${bodyCell} text-[#18181B]`}>
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
                    className={`px-4 py-4 text-[14px] tabular-nums ${
                      isOnTarget
                        ? "text-[#3F3F46]"
                        : "font-medium text-[#E02424]"
                    }`}
                  >
                    {formatAchievementLabel(row.capaian)}
                  </td>
                </tr>
              );
            })}

          {!loading && !indicators.length && (
            <tr>
              <td colSpan={8} className="px-4 py-16 text-center">
                <p className="text-sm text-[#71717A]">
                  {errorMessage ??
                    "Tidak ada indikator yang cocok dengan filter ini."}
                </p>
                {errorMessage && onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm text-[#3F3F46] transition-colors hover:border-[#D4D4D8]"
                  >
                    Coba lagi
                  </button>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SlaIndicatorTable;
