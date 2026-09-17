import { Fragment, useMemo, useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type {
  PeHsiPath,
  PeHsiPivotArea,
} from "@/app/types/network/peHsi.types";

const PATHS: PeHsiPath[] = ["BTC", "BDS", "PNK", "JT2"];
const SKELETON_ROWS = 6;

const DANGER_THRESHOLD = 100;

const headCell =
  "h-11 border-b border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#334155]";
const bodyCell = "h-10 border-b border-[#e2e8f0] px-3 text-sm";

const valueToneClass = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "text-[#94a3b8]";

  return value > DANGER_THRESHOLD ? "text-[#dc2626]" : "text-[#16a34a]";
};

interface PeHsiPivotTableProps {
  areas: PeHsiPivotArea[];
  loading?: boolean;
  error?: boolean;
  onValueClick?: (peHsi: string) => void;
}

export function PeHsiPivotTable({
  areas,
  loading = false,
  error = false,
  onValueClick,
}: PeHsiPivotTableProps) {
  const [collapsedAreas, setCollapsedAreas] = useState<string[]>([]);

  const groups = useMemo(() => {
    let counter = 0;

    return areas.map((area) => ({
      areaName: area.area_name,
      peCount: area.pe_count ?? area.items.length,
      rows: area.items.map((item) => ({ ...item, no: (counter += 1) })),
    }));
  }, [areas]);

  const toggleArea = (area: string) =>
    setCollapsedAreas((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area],
    );

  return (
    <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr>
            <th className={`${headCell} w-16 border-r text-center`}>No</th>
            <th className={`${headCell} w-[260px] border-r text-center`}>
              PE-HSI
            </th>
            <th className={`${headCell} border-r text-center`}>Baseline</th>
            {PATHS.map((path) => (
              <th
                key={path}
                className={`${headCell} w-[140px] border-r text-center last:border-r-0`}
              >
                {path}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {Array.from({ length: PATHS.length + 3 }).map((_, cellIndex) => (
                  <td key={cellIndex} className={`${bodyCell} border-r`}>
                    <Skeleton />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            groups.map((group) => {
              const collapsed = collapsedAreas.includes(group.areaName);

              return (
                <Fragment key={group.areaName}>
                  <tr className="bg-[#f8fafc]">
                    <td colSpan={PATHS.length + 3} className={`${bodyCell} px-3`}>
                      <button
                        type="button"
                        onClick={() => toggleArea(group.areaName)}
                        className="flex cursor-pointer items-center gap-2 font-semibold text-[#0f172a]"
                      >
                        <span className="flex size-5 items-center justify-center rounded border border-[#e2e8f0] bg-white text-[#64748b]">
                          {collapsed ? (
                            <LuChevronRight size={14} />
                          ) : (
                            <LuChevronDown size={14} />
                          )}
                        </span>
                        {group.areaName}
                        <span className="text-xs font-normal text-[#64748b]">
                          ({group.peCount} PE)
                        </span>
                      </button>
                    </td>
                  </tr>

                  {!collapsed &&
                    group.rows.map((row) => (
                      <tr key={row.pe_hsi} className="hover:bg-[#f8fafc]">
                        <td
                          className={`${bodyCell} border-r text-center text-[#020617] tabular-nums`}
                        >
                          {row.no}
                        </td>
                        <td
                          className={`${bodyCell} border-r text-center text-[#020617]`}
                        >
                          {row.pe_hsi}
                        </td>
                        <td
                          className={`${bodyCell} border-r text-center text-[#475569] tabular-nums`}
                        >
                          {row.baseline_str || "-"}
                        </td>
                        {PATHS.map((path) => {
                          const value = row[path];
                          const label =
                            value === null || value === undefined
                              ? "-"
                              : `${value} ms`;

                          return (
                            <td
                              key={path}
                              className={`${bodyCell} border-r text-center font-medium tabular-nums last:border-r-0 ${valueToneClass(
                                value,
                              )}`}
                            >
                              {onValueClick ? (
                                <button
                                  type="button"
                                  onClick={() => onValueClick(row.pe_hsi)}
                                  title="Lihat detail link"
                                  className="cursor-pointer underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-80"
                                >
                                  {label}
                                </button>
                              ) : (
                                label
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </Fragment>
              );
            })}

          {!loading && !groups.length && (
            <tr>
              <td colSpan={PATHS.length + 3}>
                <EmptyState
                  title={
                    error ? "Gagal memuat data PE-HSI." : "Data belum tersedia"
                  }
                  description={
                    error
                      ? undefined
                      : "Tidak ada PE-HSI yang cocok dengan pencarian ini."
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
