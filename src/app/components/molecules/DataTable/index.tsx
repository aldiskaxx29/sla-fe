import type { ReactNode } from "react";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

export interface DataTableColumn<TRow> {
  key: string;
  title: ReactNode;
  width?: number;
  align?: "left" | "center" | "right";
  render?: (row: TRow, index: number) => ReactNode;
}

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const DEFAULT_SKELETON_ROWS = 8;

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  loading?: boolean;
  error?: boolean;
  emptyTitle?: string;
  rowKey: (row: TRow, index: number) => string;
  minWidth?: number;
  maxHeightClassName?: string;
  skeletonRows?: number;
}

/**
 * Tabel sederhana untuk isi modal: hanya header + baris, tanpa state sendiri.
 * Tabel kompleks (kolom bergrup, baris bertingkat) punya organism sendiri.
 */
export function DataTable<TRow>({
  columns,
  rows,
  loading = false,
  error = false,
  emptyTitle = "Data belum tersedia",
  rowKey,
  minWidth = 720,
  maxHeightClassName = "max-h-[60vh]",
  skeletonRows = DEFAULT_SKELETON_ROWS,
}: DataTableProps<TRow>) {
  const headCell =
    "sticky top-0 z-10 h-10 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 text-xs font-semibold whitespace-nowrap text-[#334155]";
  const bodyCell =
    "h-10 border-b border-[#e2e8f0] px-3 text-sm whitespace-nowrap text-[#0f172a]";

  if (!loading && !rows.length) {
    return (
      <EmptyState
        title={error ? "Gagal memuat data." : emptyTitle}
        description={
          error ? undefined : "Tidak ada data untuk filter yang dipilih."
        }
      />
    );
  }

  return (
    <div
      className={`${maxHeightClassName} overflow-auto rounded-lg border border-[#e2e8f0]`}
    >
      <table
        className="w-full border-collapse text-left"
        style={{ minWidth }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={column.width ? { width: column.width } : undefined}
                className={`${headCell} ${ALIGN_CLASS[column.align ?? "center"]}`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key} className={bodyCell}>
                      <Skeleton height={14} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, index) => (
                <tr key={rowKey(row, index)} className="hover:bg-[#f8fafc]">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${bodyCell} ${ALIGN_CLASS[column.align ?? "center"]}`}
                    >
                      {column.render
                        ? column.render(row, index)
                        : String(
                            (row as Record<string, unknown>)[column.key] ?? "-",
                          )}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
