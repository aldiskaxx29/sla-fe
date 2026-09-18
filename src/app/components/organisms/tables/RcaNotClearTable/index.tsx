import { Fragment } from "react";

import { Skeleton } from "@/app/components/atoms";

import { SectionCard } from "@/app/components/molecules/SectionCard";

import type { RcaNotClearTableData } from "@/app/types/resume-rca/resumeRca.types";
import {
  RCA_MTTR_REGIONS,
  RCA_NOT_CLEAR_COLUMNS,
} from "@/app/utils/resumeRca.utils";

const headCell =
  "border-b border-[#e2e8f0] px-2 py-2 text-[11px] font-semibold whitespace-nowrap text-white";
const bodyCell =
  "border-b border-[#eef2f7] px-2 py-2 text-xs whitespace-nowrap text-[#0f172a]";

/** Header grup (Sow TIF / TELKOM / TSEL) dihitung dari daftar kolom. */
const GROUPS = RCA_NOT_CLEAR_COLUMNS.reduce<{ label: string; span: number }[]>(
  (result, column) => {
    const last = result[result.length - 1];

    if (last?.label === column.group) {
      last.span += 1;
      return result;
    }

    return [...result, { label: column.group, span: 1 }];
  },
  [],
);

interface RcaNotClearTableProps {
  data: RcaNotClearTableData;
  loading?: boolean;
  error?: boolean;
  onCellClick: (region: string, rca: string) => void;
}

export function RcaNotClearTable({
  data,
  loading = false,
  error = false,
  onCellClick,
}: RcaNotClearTableProps) {
  const sumColumn = (key: string) =>
    RCA_MTTR_REGIONS.reduce(
      (total, region) => total + (Number(data.detail[region]?.[key]) || 0),
      0,
    );

  const totalTickets = RCA_MTTR_REGIONS.reduce(
    (total, region) => total + (Number(data.totals[region]) || 0),
    0,
  );

  return (
    <SectionCard className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#020617]">
          RCA Ticket Not Clear
        </h2>
        {error && (
          <span className="text-xs font-medium text-rose-600">
            Gagal memuat data
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={`rca-not-clear-skeleton-${index}`} height={24} />
          ))}
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#e2e8f0]">
          <table
            className="w-full border-collapse text-center"
            style={{ minWidth: 1180 }}
          >
            <thead className="sticky top-0 z-10">
              <tr>
                <th rowSpan={2} className={`${headCell} bg-[#0c4a6e] text-left`}>
                  Region
                </th>
                <th rowSpan={2} className={`${headCell} bg-[#0c4a6e]`}>
                  Ticket Not Clear
                </th>
                {GROUPS.map((group) => (
                  <th
                    key={group.label}
                    colSpan={group.span}
                    className={`${headCell} bg-[#0c4a6e]`}
                  >
                    {group.label}
                  </th>
                ))}
              </tr>
              <tr>
                {RCA_NOT_CLEAR_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className={`${headCell} bg-[#0ea5e9] font-medium`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {RCA_MTTR_REGIONS.map((region, index) => {
                const regionLabel = `${String(index + 1).padStart(2, "0")}-${region}`;

                return (
                  <tr key={region} className="transition-colors hover:bg-[#f8fafc]">
                    <td className={`${bodyCell} text-left font-medium`}>
                      {regionLabel}
                    </td>
                    <td className={bodyCell}>{data.totals[region] ?? 0}</td>

                    {RCA_NOT_CLEAR_COLUMNS.map((column) => (
                      <td key={`${region}-${column.key}`} className={bodyCell}>
                        <button
                          type="button"
                          onClick={() => onCellClick(regionLabel, column.key)}
                          className="cursor-pointer font-semibold text-[#4338ca] hover:underline"
                        >
                          {data.detail[region]?.[column.key] ?? 0}
                        </button>
                      </td>
                    ))}
                  </tr>
                );
              })}

              <tr className="bg-[#fef3c7] font-semibold">
                <td className={`${bodyCell} text-left`}>Nationwide</td>
                <td className={bodyCell}>{totalTickets}</td>
                {RCA_NOT_CLEAR_COLUMNS.map((column) => (
                  <Fragment key={`nation-${column.key}`}>
                    <td className={bodyCell}>{sumColumn(column.key)}</td>
                  </Fragment>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

export default RcaNotClearTable;
