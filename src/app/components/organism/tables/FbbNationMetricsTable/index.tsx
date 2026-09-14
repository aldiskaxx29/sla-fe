import { useMemo } from "react";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import Pagination from "@/app/components/molecules/Pagination";

import type {
  FbbNationMetricRow,
  FbbOnxMeta,
} from "@/app/types/fbb/onx.types";

interface FbbNationMetricsTableProps {
  rows: FbbNationMetricRow[];
  meta?: FbbOnxMeta;
  loading?: boolean;
  error?: boolean;
  onPageChange: (page: number, perPage: number) => void;
}

const BASE_HEADERS = [
  "Metrics",
  "KPI",
  "Value",
  "Win/Lose",
  "Winner",
  "Gap to Winner",
];
const NEAREST_COMP_HEADER = "Nearest Comp";
const GAP_NEAREST_HEADER = "Gap to Nearest Comp";
const RANK_HEADER = "Rank";

const isWin = (status?: string) => String(status).toLowerCase() === "win";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const headCell =
  "h-10 bg-[#f8fafc] px-4 text-sm font-medium text-[#334155] border-b border-[#e2e8f0]";
const bodyCell = "h-8 px-4 text-sm font-normal";

export function FbbNationMetricsTable({
  rows,
  meta,
  loading = false,
  error = false,
  onPageChange,
}: FbbNationMetricsTableProps) {
  const skeletonRows = meta?.per_page ?? PAGE_SIZE_OPTIONS[0];

  const showNearestComp = rows.some((row) => Boolean(row.nearest_comp));
  const headers = [
    ...BASE_HEADERS,
    ...(showNearestComp ? [NEAREST_COMP_HEADER] : []),
    GAP_NEAREST_HEADER,
    RANK_HEADER,
  ];

  const groups = useMemo(() => {
    const result: { metrics: string; rows: FbbNationMetricRow[] }[] = [];

    rows.forEach((row) => {
      const last = result[result.length - 1];
      if (last && last.metrics === row.metrics) last.rows.push(row);
      else result.push({ metrics: row.metrics, rows: [row] });
    });

    return result;
  }, [rows]);

  return (
    <div className="flex flex-col">
      <div className="w-full overflow-x-auto rounded-lg border border-[#e2e8f0] shadow-[0px_1px_2.625px_0px_rgba(0,0,0,0.1)]">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr>
              {headers.map((label, index) => (
                <th
                  key={label}
                  className={`${headCell} ${
                    index !== headers.length - 1 ? "border-r border-[#e2e8f0]" : ""
                  } ${index > 1 ? "text-center" : ""}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-slate-100">
                  {headers.map((label) => (
                    <td key={label} className="px-4 py-3">
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              groups.map((group, groupIndex) =>
                group.rows.map((row, rowIndex) => {
                  const win = isWin(row.status);
                  const isLastRow =
                    groupIndex === groups.length - 1 &&
                    rowIndex === group.rows.length - 1;

                  return (
                    <tr
                      key={`${row.metrics}-${row.kpi}-${groupIndex}-${rowIndex}`}
                      className={`border-b border-[#e2e8f0] transition-colors hover:bg-[#f8fafc] ${
                        isLastRow ? "last:border-b-0" : ""
                      }`}
                    >
                      {rowIndex === 0 && (
                        <td
                          rowSpan={group.rows.length}
                          className={`${bodyCell} border-r border-[#e2e8f0] text-[#020617] align-middle`}
                        >
                          {group.metrics}
                        </td>
                      )}
                      <td className={`${bodyCell} border-r border-[#e2e8f0] text-[#020617]`}>
                        {row.kpi}
                      </td>
                      <td className={`${bodyCell} border-r border-[#e2e8f0] text-center text-[#020617] tabular-nums`}>
                        {row.value ?? "-"}
                      </td>
                      <td
                        className={`${bodyCell} border-r border-[#e2e8f0] text-center ${
                          win ? "text-[#21a647]" : "text-[#c23837]"
                        }`}
                      >
                        {row.status}
                      </td>
                      <td className={`${bodyCell} border-r border-[#e2e8f0] text-center text-[#020617]`}>
                        {row.winner}
                      </td>
                      <td className={`${bodyCell} border-r border-[#e2e8f0] text-center text-[#020617] tabular-nums`}>
                        {row.gap_to_winner}
                      </td>
                      {showNearestComp && (
                        <td className={`${bodyCell} border-r border-[#e2e8f0] text-center text-[#020617]`}>
                          {row.nearest_comp}
                        </td>
                      )}
                      <td className={`${bodyCell} border-r border-[#e2e8f0] text-center text-[#020617] tabular-nums`}>
                        {row.gap_to_nearest_comp}
                      </td>
                      <td className={`${bodyCell} text-center text-[#020617] tabular-nums`}>
                        {row.rank}
                      </td>
                    </tr>
                  );
                })
              )}

            {!loading && !groups.length && (
              <tr>
                <td colSpan={headers.length}>
                  <EmptyState
                    title={
                      error
                        ? "Gagal memuat ringkasan metrics."
                        : "Data belum tersedia"
                    }
                    description={
                      error ? undefined : "Tidak ada data pada filter ini."
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
        <div className="pt-2">
          <Pagination
            current={meta.current_page}
            pageSize={meta.per_page}
            total={meta.total}
            onChange={onPageChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}
