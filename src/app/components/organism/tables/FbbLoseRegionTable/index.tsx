import { Fragment, useMemo, useState } from "react";
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
  meta?: FbbOnxMeta;
  loading?: boolean;
  error?: boolean;
  onPageChange: (page: number, perPage: number) => void;
}

const HEADERS = [
  "Region",
  "KPI",
  "Value Indihome",
  "Trend",
  "Status",
  "Nearest Competitor",
  "Winner",
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

const isWin = (status?: string, benchmarkStatus?: string) => {
  if (benchmarkStatus) {
    return benchmarkStatus.toLowerCase() === "win";
  }
  const s = String(status ?? "").toLowerCase();
  return s === "win" || s.includes("win");
};

/** Pilihan ukuran halaman; nilai aktifnya datang dari `meta.per_page`. */
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

const headCell = "h-10 bg-[#f8fafc] px-3 text-[12px] font-medium text-[#334155]";
const bodyCell = "h-[38px] px-3 text-[12px] font-normal text-[#020617]";

/** Detail per kabupaten, dikelompokkan per region dan bisa dibuka-tutup. */
export function FbbLoseRegionTable({
  rows,
  meta,
  loading = false,
  error = false,
  onPageChange,
}: FbbLoseRegionTableProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // API mengirim baris kabupaten datar; dikelompokkan per region supaya
  // tabelnya bisa dilipat seperti desain.
  const groups = useMemo(() => {
    const order: string[] = [];
    const byRegion: Record<string, FbbLoseRegionRow[]> = {};

    rows.forEach((row) => {
      const region = row.region || row.region_new || "-";
      if (!byRegion[region]) {
        byRegion[region] = [];
        order.push(region);
      }
      byRegion[region].push(row);
    });

    return order.map((region) => {
      const items = byRegion[region];
      const win = items.filter((item) =>
        isWin(item.status, item.benchmark_status),
      ).length;

      return { region, items, win, total: items.length };
    });
  }, [rows]);

  const toggle = (region: string) =>
    setCollapsed((current) => ({ ...current, [region]: !current[region] }));

  // Skeleton sebanyak baris yang akan datang, supaya tingginya tidak melompat.
  const skeletonRows = meta?.per_page ?? PAGE_SIZE_OPTIONS[0];

  return (
    <div className="flex flex-col">
      <div className="w-full overflow-x-auto rounded-[10px] border border-[#e2e8f0]">
        <table className="w-full min-w-[1100px] border-collapse text-left">
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
              groups.map((group) => {
                const isOpen = !collapsed[group.region];
                const groupWin = group.win >= group.total - group.win;

                return (
                  <Fragment key={group.region}>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <td className={`${bodyCell} font-semibold`}>
                        <button
                          type="button"
                          onClick={() => toggle(group.region)}
                          className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-indigo-500"
                        >
                          {isOpen ? (
                            <LuChevronDown size={14} />
                          ) : (
                            <LuChevronRight size={14} />
                          )}
                          {group.region}
                        </button>
                      </td>
                      <td className={bodyCell} colSpan={3}>
                        {group.total} kabupaten
                      </td>
                      <td className={bodyCell}>
                        <StatusPill
                          label={`${group.win} from ${group.total} win`}
                          tone={groupWin ? "win" : "lose"}
                        />
                      </td>
                      <td className={bodyCell} colSpan={3} />
                    </tr>

                    {isOpen &&
                      group.items.map((row, index) => {
                        const win = isWin(row.status, row.benchmark_status);

                        return (
                          <tr
                            key={`${group.region}-${row.kabupaten}-${row.kpi_res}-${index}`}
                            className="border-b border-l-[3px] border-l-transparent border-[#e2e8f0] transition-colors last:border-b-0 hover:border-l-[#3b82f6] hover:bg-[#f8fafc]"
                          >
                            <td className={`${bodyCell} pl-10`}>
                              {row.kabupaten}
                            </td>
                            <td className={bodyCell}>{row.kpi_res}</td>
                            <td className={`${bodyCell} tabular-nums`}>
                              {row.value_indihome}
                            </td>
                            <td className="px-4 py-2.5">
                              <Sparkline values={parseTrend(row.trend)} />
                            </td>
                            <td className="px-4 py-2.5">
                              <StatusPill
                                label={row.status}
                                tone={win ? "win" : "lose"}
                              />
                            </td>
                            <td className={bodyCell}>
                              {row.nearest_comp || row.gap_to_nearest_comp || "-"}
                            </td>
                            <td className={bodyCell}>{row.winner}</td>
                            <td
                              className={`${bodyCell} tabular-nums ${
                                win ? "" : "font-bold text-red-500"
                              }`}
                            >
                              {row.gap_to_winner}
                            </td>
                          </tr>
                        );
                      })}
                  </Fragment>
                );
              })}

            {!loading && !groups.length && (
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
    </div>
  );
}
