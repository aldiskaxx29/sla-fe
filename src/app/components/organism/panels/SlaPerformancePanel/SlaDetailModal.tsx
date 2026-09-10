import { useEffect, useMemo, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuSearch, LuX } from "react-icons/lu";

import { useSlaDrilldownQuery } from "@/app/hooks/query/monday/slaDrilldown";
import type {
  SlaCardDetail,
  SlaDetailColumn,
  SlaDetailRow,
} from "@/app/types/monday/ticketQuality.types";

interface SlaDetailModalProps {
  detail: SlaCardDetail | null;
  onClose: () => void;
}

/** Nilai yang menandakan baris bermasalah pada kolom status. */
const isDangerValue = (value: string | number | null) => {
  const text = String(value ?? "").toLowerCase();
  if (!text || text === "-") return false;
  if (text === "merah") return true;
  if (text === "hijau" || text === "closed") return false;

  const numeric = Number(text);
  return Number.isFinite(numeric) && numeric > 0;
};

const isStatusText = (value: string | number | null) =>
  ["merah", "kuning", "hijau", "closed", "open"].includes(
    String(value ?? "").toLowerCase(),
  );

const alignClass = (column: SlaDetailColumn) =>
  column.align === "right"
    ? "text-right"
    : column.align === "center"
      ? "text-center"
      : "text-left";

export function SlaDetailModal({ detail, onClose }: SlaDetailModalProps) {
  const [search, setSearch] = useState("");
  const [drillRegion, setDrillRegion] = useState<string | null>(null);

  const drilldown = useSlaDrilldownQuery(detail, drillRegion);

  // Reset saat popup dibuka untuk kartu lain.
  useEffect(() => {
    setSearch("");
    setDrillRegion(null);
  }, [detail]);

  useEffect(() => {
    if (!detail) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Esc menutup rincian lanjutan dulu, baru popup-nya.
      if (drillRegion) setDrillRegion(null);
      else onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [detail, drillRegion, onClose]);

  const isDrilling = Boolean(drillRegion);

  const columns: SlaDetailColumn[] = isDrilling
    ? (drilldown.data?.columns ?? [])
    : (detail?.columns ?? []);

  const baseRows: SlaDetailRow[] = useMemo(
    () => (isDrilling ? (drilldown.data?.rows ?? []) : (detail?.rows ?? [])),
    [isDrilling, drilldown.data, detail],
  );

  const statusKey = isDrilling ? drilldown.data?.statusKey : detail?.statusKey;

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return baseRows;

    return baseRows.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [baseRows, search]);

  if (!detail) return null;

  const canDrill = Boolean(detail.drilldown) && !isDrilling;
  const regionKey = detail.drilldown?.regionKey ?? "region";

  const errorMessage =
    drilldown.error instanceof Error
      ? drilldown.error.message
      : "Rincian tidak tersedia.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={detail.title}
        className="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <button
                type="button"
                onClick={() => setDrillRegion(null)}
                className={`transition-colors ${
                  isDrilling
                    ? "cursor-pointer hover:text-indigo-500"
                    : "cursor-default text-[#213c52]"
                }`}
              >
                {detail.title}
              </button>
              {isDrilling && (
                <>
                  <LuChevronRight size={11} />
                  <span className="text-[#213c52]">{drillRegion}</span>
                </>
              )}
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              {isDrilling
                ? "Rincian lanjutan untuk region terpilih"
                : detail.subtitle}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {isDrilling && (
              <button
                type="button"
                onClick={() => setDrillRegion(null)}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-300 hover:text-[#213c52]"
              >
                <LuChevronLeft size={11} />
                Kembali
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <LuX size={16} />
            </button>
          </div>
        </header>

        <div className="border-b border-slate-100 px-5 py-3">
          <div className="relative">
            <LuSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={13}
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isDrilling ? "Cari site / tiket..." : "Cari region..."}
              className="w-full rounded-full border border-slate-200 bg-slate-50/60 py-1.5 pl-9 pr-3 text-[11px] font-semibold text-[#213c52] outline-none transition-colors focus:border-indigo-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-3">
          {isDrilling && drilldown.isPending ? (
            <p className="py-10 text-center text-[11px] font-semibold text-slate-400">
              Memuat rincian {drillRegion}...
            </p>
          ) : isDrilling && drilldown.isError ? (
            <p className="py-10 text-center text-[11px] font-semibold text-red-500">
              {errorMessage}
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-[11px]">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`sticky top-0 z-10 whitespace-nowrap bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0] ${alignClass(column)}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row[columns[0]?.key ?? ""] ?? index}-${index}`}
                    onClick={() =>
                      canDrill && setDrillRegion(String(row[regionKey] ?? ""))
                    }
                    className={`border-b border-slate-50 transition-colors last:border-b-0 ${
                      canDrill
                        ? "cursor-pointer hover:bg-indigo-50/50"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {columns.map((column) => {
                      const value = row[column.key];
                      const danger = column.key === statusKey && isDangerValue(value);

                      return (
                        <td
                          key={column.key}
                          className={`px-2 py-2 font-semibold ${
                            column.key === "analisis" || column.key === "headline"
                              ? "max-w-[260px] truncate"
                              : "whitespace-nowrap"
                          } ${
                            column.align === "right" ? "tabular-nums" : ""
                          } ${alignClass(column)} ${
                            danger ? "text-red-500" : "text-[#213c52]"
                          }`}
                          title={
                            column.key === "analisis" || column.key === "headline"
                              ? String(value ?? "")
                              : undefined
                          }
                        >
                          {isStatusText(value) ? (
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                danger
                                  ? "bg-red-50 text-red-500"
                                  : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              {value}
                            </span>
                          ) : (
                            (value ?? "-")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {!rows.length && (
                  <tr>
                    <td
                      colSpan={Math.max(columns.length, 1)}
                      className="px-2 py-10 text-center text-[11px] font-semibold text-slate-400"
                    >
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] font-semibold text-slate-500">
          <span>
            Menampilkan {rows.length} dari {baseRows.length} baris
          </span>
          {canDrill && (
            <span className="text-slate-400">
              Klik baris untuk melihat rinciannya
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}

export default SlaDetailModal;
