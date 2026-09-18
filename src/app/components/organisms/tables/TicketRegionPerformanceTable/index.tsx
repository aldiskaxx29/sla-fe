import { LuMaximize2 } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { TICKET_SEVERITY_OPTIONS } from "@/app/api/ticket";
import type {
  TicketRegionPerformanceRow,
  TicketSeverityFilter,
} from "@/app/types/ticket/ticketQuality.types";
import {
  formatTicketAchievement,
  formatTicketPercent,
  isTicketAchieved,
} from "@/app/utils/ticketQuality.utils";

const SKELETON_ROWS = 8;

/** Header dibuat sticky karena badan tabel bisa di-scroll. */
const headCell =
  "sticky z-10 h-9 border-b border-r border-[#e2e8f0] bg-[#f8fafc] px-2 text-[11px] font-semibold whitespace-nowrap text-[#334155]";
const bodyCell =
  "h-8 border-b border-r border-[#e2e8f0] px-2 text-[11px] whitespace-nowrap text-[#0f172a]";

const TICKET_OPEN_COLUMNS = [
  { key: "green", label: "Hijau", className: "bg-[#d1fae5] text-[#047857]" },
  { key: "yellow", label: "Kuning", className: "bg-[#fef3c7] text-[#b45309]" },
  { key: "red", label: "Merah", className: "bg-[#fee2e2] text-[#b91c1c]" },
] as const;

interface TicketRegionPerformanceTableProps {
  rows: TicketRegionPerformanceRow[];
  severity: TicketSeverityFilter;
  onSeverityChange: (value: TicketSeverityFilter) => void;
  onExpand?: () => void;
  onTicketOpenClick?: (
    row: TicketRegionPerformanceRow,
    bucket: "green" | "yellow" | "red",
  ) => void;
  loading?: boolean;
  error?: boolean;
}

export function TicketRegionPerformanceTable({
  rows,
  severity,
  onSeverityChange,
  onExpand,
  onTicketOpenClick,
  loading = false,
  error = false,
}: TicketRegionPerformanceTableProps) {
  return (
    /* basis-0 + min-h: tinggi tabel tidak ikut jumlah baris, jadi kolom ini
       tetap sejajar dengan kolom kiri/kanan. Sisa baris di-scroll. */
    <section className="flex min-h-[320px] min-w-0 flex-1 basis-0 flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <h3 className="text-sm font-bold text-[#020617]">
          Region Performance Details
        </h3>

        <div className="flex items-center gap-2">
          <SelectMenu
            value={severity}
            options={[...TICKET_SEVERITY_OPTIONS]}
            onChange={(value) => onSeverityChange(value as TicketSeverityFilter)}
            className="[&_button]:h-9 [&_button]:w-[150px] [&_button]:rounded-lg [&_button]:border-[#e2e8f0] [&_button]:text-xs"
          />

          {onExpand ? (
            <button
              type="button"
              onClick={onExpand}
              aria-label="Perbesar tabel"
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-[#e2e8f0] text-[#6366f1] transition-colors hover:bg-[#f8fafc]"
            >
              <LuMaximize2 size={16} />
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
        {!loading && !rows.length ? (
          <EmptyState
            title={error ? "Gagal memuat data region." : "Data belum tersedia"}
            description={error ? undefined : "Coba ubah filter severity."}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#e2e8f0]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th rowSpan={2} className={`${headCell} top-0 text-center`}>
                    Region
                  </th>
                  <th rowSpan={2} className={`${headCell} top-0 text-center`}>
                    Target
                  </th>
                  <th rowSpan={2} className={`${headCell} top-0 text-center`}>
                    Ach
                  </th>
                  <th rowSpan={2} className={`${headCell} top-0 text-center`}>
                    Not Ach
                  </th>
                  <th rowSpan={2} className={`${headCell} top-0 text-center`}>
                    Ach%
                  </th>
                  <th rowSpan={2} className={`${headCell} top-0 text-center`}>
                    Total
                    <br />
                    Ticket
                  </th>
                  <th colSpan={3} className={`${headCell} top-0 text-center`}>
                    Total Ticket Open
                  </th>
                </tr>
                <tr>
                  {TICKET_OPEN_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className={`${headCell} top-9 text-center ${column.className}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading
                  ? Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                      <tr key={`skeleton-${rowIndex}`}>
                        {Array.from({ length: 9 }).map((__, cellIndex) => (
                          <td key={cellIndex} className={bodyCell}>
                            <Skeleton height={12} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : rows.map((row) => {
                      const achieved = isTicketAchieved(row.achievement);

                      return (
                        <tr
                          key={row.region}
                          className={`hover:bg-[#f8fafc] ${row.parent ? "font-bold" : ""}`}
                        >
                          <td className={bodyCell}>{row.region}</td>
                          <td className={`${bodyCell} text-center`}>
                            {formatTicketPercent(row.target)}
                          </td>
                          <td className={`${bodyCell} text-center`}>
                            {row.achieved}
                          </td>
                          <td className={`${bodyCell} text-center`}>
                            {row.notAchieved}
                          </td>
                          <td
                            className={`${bodyCell} text-center font-bold ${
                              achieved ? "text-[#16a34a]" : "text-[#dc2626]"
                            }`}
                          >
                            {formatTicketAchievement(row.achievement)}
                          </td>
                          <td className={`${bodyCell} text-center`}>
                            {row.totalTicket}
                          </td>

                          {TICKET_OPEN_COLUMNS.map((column) => (
                            <td
                              key={column.key}
                              className={`${bodyCell} text-center`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  onTicketOpenClick?.(row, column.key)
                                }
                                className="cursor-pointer text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]"
                              >
                                {row.ticketOpen[column.key]}
                              </button>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
