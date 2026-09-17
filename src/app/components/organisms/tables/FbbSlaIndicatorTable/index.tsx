import { useMemo } from "react";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { SlaWsaItem } from "@/app/types/fbb/sla.types";

import {
  SLA_ACHIEVEMENT_THRESHOLD,
  formatAchievementLabel,
  formatDecimal,
  parseAchievement,
} from "@/app/utils/fbbSla.utils";

interface FbbSlaIndicatorTableProps {
  indicators: SlaWsaItem[];
  periodLabel: string;
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onAchievementClick?: (row: SlaWsaItem) => void;
}

const COLUMNS = [
  { key: "segmen", label: "Segmen", width: "w-[140px] @[1500px]:w-[200px]", align: "justify-center text-center" },
  { key: "indicator", label: "Performance Indicator", width: "w-[300px] @[1500px]:w-[360px]", align: "justify-start text-left" },
  { key: "layanan", label: "Layanan", width: "w-[120px] @[1500px]:w-[160px]", align: "justify-start text-left" },
  { key: "satuan", label: "Satuan", width: "w-[90px] @[1500px]:w-[120px]", align: "justify-center text-center" },
  { key: "source", label: "Source Data", width: "w-[150px] @[1500px]:w-[200px]", align: "justify-start text-left" },
  { key: "target", label: "Target", width: "w-[100px] @[1500px]:w-[160px]", align: "justify-center text-center" },
  { key: "realisasi", label: "Realisasi", width: "flex-1 min-w-[110px] @[1500px]:min-w-[140px]", align: "justify-center text-center" },
  { key: "capaian", label: "Capaian", width: "flex-1 min-w-[110px] @[1500px]:min-w-[140px]", align: "justify-center text-center" },
];

const SKELETON_ROWS = 6;

const cellText = "text-sm leading-[17px] font-normal text-[#020617]";
const gridBorder = "border-r border-b border-[#cbd5e1]";

export function FbbSlaIndicatorTable({
  indicators,
  periodLabel,
  loading = false,
  errorMessage = null,
  onRetry,
  onAchievementClick,
}: FbbSlaIndicatorTableProps) {
  const groups = useMemo(() => {
    const result: { segmen: string; rows: SlaWsaItem[] }[] = [];

    indicators.forEach((row) => {
      const last = result[result.length - 1];
      if (last && last.segmen === row.segmen) last.rows.push(row);
      else result.push({ segmen: row.segmen, rows: [row] });
    });

    return result;
  }, [indicators]);

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-[#cbd5e1]">
      <div className="min-w-[1130px] @[1500px]:min-w-[1500px]">
        <div className="flex min-h-12 bg-[#f8fafc]">
          {COLUMNS.map((col, index) => {
            const isFlex = col.width.startsWith("flex-1");

            return (
              <div
                key={col.key}
                className={`flex items-center gap-2.5 py-2 ${
                  index !== COLUMNS.length - 1 ? gridBorder : "border-b border-[#cbd5e1]"
                } ${isFlex ? "px-3" : "shrink-0 px-4"} ${col.width} ${col.align}`}
              >
                <span
                  className={`text-sm leading-[19px] font-medium text-[#334155] ${
                    isFlex ? "text-center" : "whitespace-nowrap"
                  }`}
                >
                  {col.label}
                  {isFlex && periodLabel ? ` ${periodLabel}` : ""}
                </span>
              </div>
            );
          })}
        </div>

        {loading &&
          Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
            <div
              key={`skeleton-${rowIndex}`}
              className="flex min-h-[48px] items-center"
            >
              {COLUMNS.map((col, colIndex) => (
                <div
                  key={col.key}
                  className={`px-4 py-2 ${
                    colIndex !== COLUMNS.length - 1
                      ? gridBorder
                      : "border-b border-[#cbd5e1]"
                  } ${col.width} ${
                    col.width.startsWith("flex-1") ? "" : "shrink-0"
                  }`}
                >
                  <Skeleton />
                </div>
              ))}
            </div>
          ))}

        {!loading &&
          groups.map((group, groupIndex) => {
            return (
              <div key={`${group.segmen}-${groupIndex}`} className="flex">
                <div
                  className={`flex w-[140px] shrink-0 items-center justify-center border-r border-b border-[#cbd5e1] px-4 py-2 text-center @[1500px]:w-[200px]`}
                >
                  <span className="text-sm leading-[17px] font-medium text-[#020617]">
                    {group.segmen}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  {group.rows.map((row, rowIndex) => {
                    const achievement = parseAchievement(row.capaian);
                    const onTarget =
                      achievement === null ||
                      achievement >= SLA_ACHIEVEMENT_THRESHOLD;

                    return (
                      <div
                        key={`${row.performance_indicator}-${rowIndex}`}
                        className="flex min-h-[48px] items-stretch"
                      >
                        <div
                          className={`flex h-full w-[300px] shrink-0 items-center ${gridBorder} px-4 py-2 @[1500px]:w-[360px]`}
                        >
                          <span className={cellText}>
                            {row.performance_indicator}
                          </span>
                        </div>
                        <div
                          className={`flex h-full w-[120px] shrink-0 items-center ${gridBorder} px-4 @[1500px]:w-[160px]`}
                        >
                          <span title={row.layanan} className={`truncate ${cellText}`}>
                            {row.layanan}
                          </span>
                        </div>
                        <div
                          className={`flex h-full w-[90px] shrink-0 items-center justify-center ${gridBorder} px-3 @[1500px]:w-[120px]`}
                        >
                          <span className={cellText}>{row.satuan}</span>
                        </div>
                        <div
                          className={`flex h-full w-[150px] shrink-0 items-center ${gridBorder} px-4 @[1500px]:w-[200px]`}
                        >
                          <span title={row.sumber_data} className={`truncate ${cellText}`}>
                            {row.sumber_data}
                          </span>
                        </div>
                        <div
                          className={`flex h-full w-[100px] shrink-0 items-center justify-center ${gridBorder} px-3 @[1500px]:w-[160px]`}
                        >
                          <span className={cellText}>
                            {formatDecimal(row.target)}
                          </span>
                        </div>
                        <div
                          className={`flex h-full min-w-[110px] flex-1 items-center justify-center ${gridBorder} px-3 @[1500px]:min-w-[140px]`}
                        >
                          <span className={cellText}>
                            {formatDecimal(row.value)}
                          </span>
                        </div>
                        <div
                          className={`flex h-full min-w-[110px] flex-1 items-center justify-center border-b border-[#cbd5e1] px-3 @[1500px]:min-w-[140px]`}
                        >
                          {onAchievementClick ? (
                            <button
                              type="button"
                              onClick={() => onAchievementClick(row)}
                              title="Lihat detail region"
                              className={`cursor-pointer text-sm leading-[16px] font-medium underline decoration-dotted underline-offset-4 transition-colors hover:opacity-80 ${
                                onTarget ? "text-[#21a647]" : "text-[#c23837]"
                              }`}
                            >
                              {formatAchievementLabel(row.capaian)}
                            </button>
                          ) : (
                            <span
                              className={`text-sm leading-[16px] font-normal ${
                                onTarget ? "text-[#21a647]" : "text-[#c23837]"
                              }`}
                            >
                              {formatAchievementLabel(row.capaian)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {!loading && !groups.length && (
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
                  className="cursor-pointer rounded-full border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc]"
                >
                  Coba lagi
                </button>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
}
