import { Fragment, useMemo } from "react";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { MsaRow } from "@/app/types/msa/msa.types";
import { formatMsaNumber } from "@/app/utils/msa.utils";

const SKELETON_ROWS = 8;

const QUARTER_NUMBERS: Record<string, number> = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,
};

const headCell =
  "h-10 border-b border-r border-[#e2e8f0] bg-[#eef6ff] px-3 text-xs font-semibold whitespace-nowrap text-[#0f172a]";
const targetHeadCell =
  "h-10 border-b border-r border-[#e2e8f0] bg-[#e2e8f0] px-3 text-xs font-semibold whitespace-nowrap text-[#0f172a]";
const bodyCell =
  "h-10 border-b border-r border-[#e2e8f0] px-3 text-sm whitespace-nowrap";

interface WeekColumn {
  key: string;
  week: number;
  quarter: number;
}

/**
 * Kolom minggu dikirim sebagai `real_week_<minggu>_month_<bulan>`; format lama
 * tanpa bulan masih didukung dengan menebak kuartal dari nomor minggunya.
 */
const collectWeekColumns = (sample: MsaRow): WeekColumn[] => {
  const columns: WeekColumn[] = [];

  Object.keys(sample).forEach((key) => {
    const match = key.match(/^real_week_(\d+)(?:_month_(\d+))?$/);

    if (!match) return;

    const week = Number(match[1]);
    const month = match[2] ? Number(match[2]) : null;

    columns.push({
      key,
      week,
      quarter: month ? Math.ceil(month / 3) : Math.ceil(week / 13),
    });
  });

  return columns.sort((a, b) => a.week - b.week);
};

interface MsaHistoryWeeklyTableProps {
  rows: MsaRow[];
  loading?: boolean;
  error?: boolean;
}

/** Tabel WEEKLY DATA SLA: target per kuartal diikuti realisasi per minggu. */
export function MsaHistoryWeeklyTable({
  rows,
  loading = false,
  error = false,
}: MsaHistoryWeeklyTableProps) {
  const quarters = useMemo(() => {
    const sample = rows[0];

    if (!sample) return [];

    const weekColumns = collectWeekColumns(sample);

    return Object.entries(QUARTER_NUMBERS)
      .map(([label, quarterNum]) => ({
        label,
        targetKey: `target_${label.toLowerCase()}`,
        weeks: weekColumns.filter((column) => column.quarter === quarterNum),
      }))
      .filter(
        (quarter) => quarter.targetKey in sample || quarter.weeks.length > 0,
      );
  }, [rows]);

  const leafCount =
    2 + quarters.reduce((total, quarter) => total + 1 + quarter.weeks.length, 0);

  if (!loading && !rows.length) {
    return (
      <EmptyState
        title={
          error ? "Gagal memuat data weekly SLA." : "Data belum tersedia"
        }
      />
    );
  }

  const renderWeekValue = (row: MsaRow, weekKey: string, targetKey: string) => {
    const value = row[weekKey];

    if (value === null || value === undefined || value === "") {
      return <span className="text-[#94a3b8]">-</span>;
    }

    /** KPI weekly dilaporkan sebagai packetloss: makin kecil makin baik. */
    const isGood = Number(value) <= Number(row[targetKey]);

    return (
      <span
        className={`rounded-sm px-1 font-medium ${
          isGood ? "text-[#16a34a] bg-[#f0fdf4]" : "text-[#dc2626] bg-[#fef2f2]"
        }`}
      >
        {formatMsaNumber(value)}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className={`${headCell} w-14 text-center`}>No.</th>
            <th className={`${headCell} w-[200px]`}>Region</th>

            {quarters.map((quarter) => (
              <Fragment key={quarter.label}>
                <th className={`${targetHeadCell} text-center`}>
                  {quarter.label}
                </th>
                {quarter.weeks.map((week) => (
                  <th
                    key={week.key}
                    className={`${headCell} text-center`}
                  >
                    W{week.week}
                  </th>
                ))}
              </Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {Array.from({ length: leafCount }).map((_, cellIndex) => (
                  <td key={cellIndex} className={bodyCell}>
                    <Skeleton height={14} />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows.map((row, index) => (
              <tr
                key={String(row.identIndex ?? row.region_tsel ?? index)}
                className="hover:bg-[#f8fafc]"
              >
                <td className={`${bodyCell} text-center text-[#475569]`}>
                  {index + 1}
                </td>
                <td className={`${bodyCell} text-[#0f172a]`}>
                  {String(row.region_tsel ?? "-")}
                </td>

                {quarters.flatMap((quarter) => [
                  <td
                    key={`${index}-${quarter.targetKey}`}
                    className={`${bodyCell} text-center text-[#475569]`}
                  >
                    {(row[quarter.targetKey] as string) ?? "-"}
                  </td>,
                  ...quarter.weeks.map((week) => (
                    <td
                      key={`${index}-${week.key}`}
                      className={`${bodyCell} text-center`}
                    >
                      {renderWeekValue(row, week.key, quarter.targetKey)}
                    </td>
                  )),
                ])}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
