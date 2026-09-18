import { Fragment } from "react";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { RcaRegionProgress } from "@/app/types/resume-rca/resumeRca.types";
import {
  averageRegionProgress,
  formatRcaNumber,
  RCA_TRAFFIC_REGIONS,
  sumRegionValues,
  toRegionKey,
} from "@/app/utils/resumeRca.utils";

const headCell =
  "border-b border-[#e2e8f0] px-3 py-2 text-[11px] font-semibold whitespace-nowrap text-white";
const bodyCell =
  "border-b border-[#eef2f7] px-3 py-2 text-xs whitespace-nowrap text-[#0f172a]";

/** Progress >=80% dianggap sehat, di bawahnya merah, 0 dianggap belum ada data. */
const toProgressClass = (value: number) => {
  if (!value) return "text-slate-400";

  return value > 80 ? "text-emerald-600" : "text-rose-600";
};

interface ResumeRcaRegionTableProps {
  labels: string[];
  progress: Record<string, RcaRegionProgress>;
  totalSites: number;
  loading?: boolean;
  error?: boolean;
  onCellClick: (region: string, rca: string) => void;
}

export function ResumeRcaRegionTable({
  labels,
  progress,
  totalSites,
  loading = false,
  error = false,
  onCellClick,
}: ResumeRcaRegionTableProps) {
  if (!loading && !labels.length) {
    return (
      <EmptyState
        title={error ? "Gagal memuat tabel RCA." : "Data belum tersedia"}
        description={error ? undefined : "Tidak ada data untuk filter yang dipilih."}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={`rca-region-skeleton-${index}`} height={24} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-2xl border border-[#e2e8f0]">
      <table className="w-full border-collapse text-center" style={{ minWidth: 1080 }}>
        <thead className="sticky top-0 z-10">
          <tr>
            <th rowSpan={2} className={`${headCell} bg-[#0c4a6e] text-left`}>
              Region
            </th>
            <th rowSpan={2} className={`${headCell} bg-[#0c4a6e]`}>
              Total Site Not Clear
            </th>
            {labels.map((label) => (
              <th key={label} colSpan={2} className={`${headCell} bg-[#0c4a6e]`}>
                {label}
              </th>
            ))}
          </tr>
          <tr>
            {labels.map((label) => (
              <Fragment key={label}>
                <th className={`${headCell} bg-[#0ea5e9] font-medium`}>
                  Total Site
                </th>
                <th className={`${headCell} bg-[#0ea5e9] font-medium`}>
                  Progress
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {RCA_TRAFFIC_REGIONS.map((region, index) => {
            const row = progress[region];

            return (
              <tr key={region} className="transition-colors hover:bg-[#f8fafc]">
                <td className={`${bodyCell} text-left font-medium`}>
                  {`${String(index + 1).padStart(2, "0")}-${toRegionKey(region)}`}
                </td>
                <td className={bodyCell}>
                  <button
                    type="button"
                    onClick={() => onCellClick(toRegionKey(region), "")}
                    className="cursor-pointer font-semibold text-[#4338ca] hover:underline"
                  >
                    {row?.total_site ?? 0}
                  </button>
                </td>
                {labels.map((label) => {
                  const lower = label.toLowerCase();
                  const total = row?.[`t_${lower}`] ?? 0;
                  const percent = Math.abs(row?.[`p_${lower}`] ?? 0);

                  return (
                    <Fragment key={`${region}-${label}`}>
                      <td className={bodyCell}>
                        <button
                          type="button"
                          onClick={() => onCellClick(toRegionKey(region), label)}
                          className="cursor-pointer font-semibold text-[#4338ca] hover:underline"
                        >
                          {total}
                        </button>
                      </td>
                      <td
                        className={`${bodyCell} font-medium ${toProgressClass(percent)}`}
                      >
                        {formatRcaNumber(percent)}%
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            );
          })}

          <tr className="bg-[#fef3c7] font-semibold">
            <td className={`${bodyCell} text-left`}>Nationwide</td>
            <td className={bodyCell}>
              <button
                type="button"
                onClick={() => onCellClick("nationwide", "")}
                className="cursor-pointer text-[#4338ca] hover:underline"
              >
                {totalSites}
              </button>
            </td>
            {labels.map((label) => {
              const lower = label.toLowerCase();

              return (
                <Fragment key={`nation-${label}`}>
                  <td className={bodyCell}>
                    <button
                      type="button"
                      onClick={() => onCellClick("nationwide", label)}
                      className="cursor-pointer text-[#4338ca] hover:underline"
                    >
                      {sumRegionValues(progress, `t_${lower}`)}
                    </button>
                  </td>
                  <td className={bodyCell}>
                    {formatRcaNumber(averageRegionProgress(progress, `p_${lower}`))}%
                  </td>
                </Fragment>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ResumeRcaRegionTable;
