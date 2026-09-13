import { Fragment } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

// Atoms
import { Skeleton, Sparkline, StatusPill } from "@/app/components/atoms";

// Molecules
import { EmptyState } from "@/app/components/molecules/EmptyState";
import Pagination from "@/app/components/molecules/Pagination";

// Types
import type {
  FbbLoseRegionRow,
  FbbOnxMeta,
} from "@/app/types/fbb/onx.types";

interface FbbLoseRegionTableProps {
  rows: FbbLoseRegionRow[];
  childRows?: FbbLoseRegionRow[];
  meta?: FbbOnxMeta;
  childMeta?: FbbOnxMeta;
  loading?: boolean;
  childLoading?: boolean;
  error?: boolean;
  childError?: boolean;
  expandedRegion?: string;
  onToggleRegion?: (region: string) => void;
  onPageChange: (page: number, perPage: number) => void;
  onChildPageChange?: (page: number, perPage: number) => void;
}

const HEADERS = [
  "Region",
  "Value Indihome",
  "Trend",
  "Status",
  "Benchmark Status",
  "Nearest Competitor",
  "Winner",
  "Winner Value",
  "Gap to Winner",
];

/** Deret trend bisa ratusan titik; sparkline cukup memakai yang terbaru. */
const TREND_POINTS = 30;

const parseTrend = (trend?: string) =>
  String(trend ?? "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value))
    .slice(-TREND_POINTS);

/** "Win", "CONSECUTIVE WIN", "Consecutive Win" -> true. */
const isWin = (...values: (string | undefined)[]) =>
  values.some((value) => String(value ?? "").toLowerCase().includes("win"));

const isSimpleStatus = (value?: string) =>
  ["win", "lose"].includes(String(value ?? "").trim().toLowerCase());

const getDisplayStatus = (row: FbbLoseRegionRow) =>
  isSimpleStatus(row.status) ? row.status : row.benchmark_status || row.status;

const getBenchmarkStatus = (row: FbbLoseRegionRow) =>
  isSimpleStatus(row.status) ? row.benchmark_status : row.status;

const getAreaName = (row: FbbLoseRegionRow) =>
  row.kabupaten || row.region_new || row.region || "-";

const getRegionName = (row: FbbLoseRegionRow) => row.region_new || row.region || "-";

const formatGap = (value?: string) => {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "0") return "-";

  return raw.startsWith("-") ? raw.slice(1) : raw;
};

/** Pilihan ukuran halaman; nilai aktifnya datang dari `meta.per_page`. */
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200, 500];

const headCell =
  "sticky top-0 z-10 h-10 bg-[#f8fafc] px-3 text-[12px] font-medium text-[#334155]";
const bodyCell = "h-[38px] px-3 text-[12px] font-normal text-[#020617]";

/** Detail per kabupaten, dikelompokkan per region dan bisa dibuka-tutup. */
export function FbbLoseRegionTable({
  rows,
  childRows = [],
  meta,
  childMeta,
  loading = false,
  childLoading = false,
  error = false,
  childError = false,
  expandedRegion = "",
  onToggleRegion,
  onPageChange,
  onChildPageChange,
}: FbbLoseRegionTableProps) {
  const expandable = Boolean(onToggleRegion);
  // Skeleton sebanyak baris yang akan datang, supaya tingginya tidak melompat.
  const skeletonRows = Math.min(meta?.per_page ?? PAGE_SIZE_OPTIONS[0], 10);

  return (
    <div className="flex flex-col">
      <div className="max-h-[600px] w-full overflow-auto rounded-[10px] border border-[#e2e8f0]">
        <table className="w-full min-w-[1320px] border-collapse text-left">
          <thead>
            <tr>
              {HEADERS.map((label) => (
                <th key={label} className={headCell}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-slate-100">
                  {HEADERS.map((label) => (
                    <td key={label} className="px-4 py-3">
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              rows.map((row, rowIndex) => {
                const region = expandable ? getRegionName(row) : getAreaName(row);
                const isOpen = expandedRegion === region;
                const status = getDisplayStatus(row);
                const benchmarkStatus = getBenchmarkStatus(row);
                const win = isWin(status);

                return (
                  <Fragment key={`${region}-${row.kpi_res}-${rowIndex}`}>
                    <tr className="border-b border-[#e2e8f0] transition-colors hover:bg-[#f8fafc]">
                      <td className={`${bodyCell} font-semibold`}>
                        <button
                          type="button"
                          disabled={!expandable}
                          onClick={() => onToggleRegion?.(region)}
                          className={`flex items-center gap-3 transition-colors ${
                            expandable
                              ? "cursor-pointer hover:text-[#2563eb]"
                              : "cursor-default"
                          }`}
                        >
                          {expandable && (
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#94a3b8]">
                              {isOpen ? (
                                <LuChevronDown size={16} />
                              ) : (
                                <LuChevronRight size={16} />
                              )}
                            </span>
                          )}
                          {region}
                        </button>
                      </td>
                      <td className={`${bodyCell} tabular-nums`}>
                        {row.value_indihome}
                      </td>
                      <td className="px-3 py-2">
                        <Sparkline values={parseTrend(row.trend)} />
                      </td>
                      <td className="px-3 py-2">
                        <StatusPill label={status} tone={win ? "win" : "lose"} />
                      </td>
                      <td className={`${bodyCell} ${win ? "text-[#5BA747]" : "text-[#D33D3D]"}`}>
                        {benchmarkStatus || "-"}
                      </td>
                      <td className={bodyCell}>
                        {row.nearest_comp || row.gap_to_nearest_comp || "-"}
                      </td>
                      <td className={bodyCell}>{row.winner}</td>
                      <td className={`${bodyCell} tabular-nums`}>
                        {win ? row.value_indihome : "-"}
                      </td>
                      <td className={`${bodyCell} tabular-nums`}>
                        {win ? "-" : formatGap(row.gap_to_winner)}
                      </td>
                    </tr>

                    {expandable && isOpen && childLoading &&
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr
                          key={`${region}-child-skeleton-${index}`}
                          className="border-b border-[#e2e8f0]"
                        >
                          {HEADERS.map((label, cellIndex) => (
                            <td
                              key={label}
                              className={`${cellIndex === 0 ? "pl-14" : "px-3"} py-3`}
                            >
                              <Skeleton />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {expandable &&
                      isOpen &&
                      !childLoading &&
                      childRows.map((child, index) => {
                        const childStatus = getDisplayStatus(child);
                        const childBenchmarkStatus = getBenchmarkStatus(child);
                        const childWin = isWin(childStatus);
                        const areaName = getAreaName(child);

                        return (
                          <tr
                            key={`${region}-${areaName}-${child.kpi_res}-${index}`}
                            className="border-b border-l-[3px] border-l-transparent border-[#e2e8f0] transition-colors last:border-b-0 hover:border-l-[#3b82f6] hover:bg-[#f8fafc]"
                          >
                            <td className={`${bodyCell} pl-16`}>
                              {areaName}
                            </td>
                            <td className={`${bodyCell} tabular-nums`}>
                              {child.value_indihome}
                            </td>
                            <td className="px-3 py-2">
                              <Sparkline values={parseTrend(child.trend)} />
                            </td>
                            <td className="px-3 py-2">
                              <StatusPill
                                label={childStatus}
                                tone={childWin ? "win" : "lose"}
                              />
                            </td>
                            <td
                              className={`${bodyCell} ${
                                childWin ? "text-[#5BA747]" : "text-[#D33D3D]"
                              }`}
                            >
                              {childBenchmarkStatus || "-"}
                            </td>
                            <td className={bodyCell}>
                              {child.nearest_comp || child.gap_to_nearest_comp || "-"}
                            </td>
                            <td className={bodyCell}>{child.winner}</td>
                            <td className={`${bodyCell} tabular-nums`}>
                              {childWin ? child.value_indihome : "-"}
                            </td>
                            <td
                              className={`${bodyCell} tabular-nums ${
                                childWin ? "" : "font-medium"
                              }`}
                            >
                              {childWin ? "-" : formatGap(child.gap_to_winner)}
                            </td>
                          </tr>
                        );
                      })}

                    {expandable && isOpen && !childLoading && childError && (
                      <tr className="border-b border-[#e2e8f0]">
                        <td colSpan={HEADERS.length} className="py-3 pl-16 text-sm text-red-500">
                          Gagal memuat detail kabupaten.
                        </td>
                      </tr>
                    )}

                    {expandable &&
                      isOpen &&
                      !childLoading &&
                      !childError &&
                      !childRows.length && (
                      <tr className="border-b border-[#e2e8f0]">
                        <td colSpan={HEADERS.length} className="py-3 pl-16 text-sm text-slate-500">
                          Tidak ada data kabupaten untuk region ini.
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

            {!loading && !rows.length && (
              <tr>
                <td colSpan={HEADERS.length}>
                  <EmptyState
                    title={
                      error ? "Gagal memuat detail kabupaten." : "Data belum tersedia"
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

      {expandedRegion && childMeta && childMeta.total > 0 && onChildPageChange && (
        <div className="pt-2">
          <Pagination
            current={childMeta.current_page}
            pageSize={childMeta.per_page}
            total={childMeta.total}
            onChange={onChildPageChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}
