// Atoms
import { Skeleton } from "@/app/components/atoms";

// Molecules
import { EmptyState } from "@/app/components/molecules/EmptyState";
import Pagination from "@/app/components/molecules/Pagination";

// Types
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

const HEADERS = [
  "Metrics",
  "KPI",
  "WoW (Win/Lose)",
  "Winner",
  "Gap to Winner",
  "Gap to Nearest Comp",
];

const isWin = (status?: string) => String(status).toLowerCase() === "win";

/** Pilihan ukuran halaman; nilai aktifnya datang dari `meta.per_page`. */
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const headCell =
  "bg-slate-50 px-4 py-3 text-[13px] font-bold text-navy first:rounded-l-xl last:rounded-r-xl";
const bodyCell = "px-4 py-2.5 text-[13px] text-slate-600";

/** Tabel ringkasan menang/kalah per metrics & KPI tingkat nasional. */
export function FbbNationMetricsTable({
  rows,
  meta,
  loading = false,
  error = false,
  onPageChange,
}: FbbNationMetricsTableProps) {
  // Skeleton sebanyak baris yang akan datang, supaya tingginya tidak melompat.
  const skeletonRows = meta?.per_page ?? PAGE_SIZE_OPTIONS[0];

  return (
    <div className="flex flex-col">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr>
              {HEADERS.map((label, index) => (
                <th
                  key={label}
                  className={`${headCell} ${index > 1 ? "text-center" : ""}`}
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
                  {HEADERS.map((label) => (
                    <td key={label} className="px-4 py-3">
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              rows.map((row, index) => {
                const win = isWin(row.status);

                return (
                  <tr
                    key={`${row.metrics}-${row.kpi}-${index}`}
                    className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/60"
                  >
                    <td className={`${bodyCell} font-semibold text-navy`}>
                      {row.metrics}
                    </td>
                    <td className={bodyCell}>{row.kpi}</td>
                    <td
                      className={`${bodyCell} text-center font-bold ${
                        win ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {row.status}
                    </td>
                    <td className={`${bodyCell} text-center`}>{row.winner}</td>
                    <td className={`${bodyCell} text-center tabular-nums`}>
                      {row.gap_to_winner}
                    </td>
                    <td className={`${bodyCell} text-center`}>
                      {row.gap_to_nearest_comp}
                    </td>
                  </tr>
                );
              })}

            {!loading && !rows.length && (
              <tr>
                <td colSpan={HEADERS.length}>
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
        <div className="border-t border-slate-100 pt-2">
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
