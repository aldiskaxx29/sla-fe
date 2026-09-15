import { useEffect, useMemo, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuSearch, LuX } from "react-icons/lu";

import {
  useSlaDrilldownQuery,
  useSlaRcaGroupingQuery,
} from "@/app/hooks/query/monday/slaDrilldown";

import { groupSlaRca } from "@/app/utils/slaPerformance.utils";
import type {
  SlaCardDetail,
  SlaDetailColumn,
  SlaDetailRow,
} from "@/app/types/monday/ticketQuality.types";

interface SlaDetailModalProps {
  detail: SlaCardDetail | null;
  onClose: () => void;
}

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

const toneClass = (tone?: SlaDetailColumn["tone"]) => {
  if (tone === "green") return "bg-emerald-500 text-white";
  if (tone === "yellow") return "bg-amber-500 text-white";
  if (tone === "red") return "bg-red-500 text-white";

  return "bg-[#213c52] text-white";
};

const toComparable = (value: string | number | null | undefined) => {
  const numeric = Number(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
};

const cellAlignClass = (column: SlaDetailColumn) =>
  column.key.toLowerCase().includes("region") ||
  column.label.toLowerCase() === "region"
    ? "text-left align-middle"
    : "text-center align-middle";

const regionToneClass = ({
  column,
  danger,
  achieved,
  hasStatusKey,
  highlightRow,
}: {
  column: SlaDetailColumn;
  danger: boolean;
  achieved: boolean | null;
  hasStatusKey: boolean;
  highlightRow: boolean;
}) => {
  if (column.key !== "region") return "";
  if (achieved !== null) {
    if (!highlightRow) {
      return achieved
        ? "font-bold text-emerald-600"
        : "font-bold text-red-500";
    }

    return achieved
      ? "bg-emerald-500 font-bold text-white"
      : "bg-red-500 font-bold text-white";
  }

  if (!hasStatusKey) return "bg-slate-400 font-bold text-white";

  return danger
    ? "bg-red-100 font-bold text-red-700"
    : "bg-emerald-100 font-bold text-emerald-700";
};

export function SlaDetailModal({ detail, onClose }: SlaDetailModalProps) {
  const [search, setSearch] = useState("");
  const [drillRegion, setDrillRegion] = useState<string | null>(null);

  const drilldown = useSlaDrilldownQuery(detail, drillRegion);
  const rcaGrouping = useSlaRcaGroupingQuery(
    Boolean(detail?.rca) && !drillRegion,
  );

  const rcaBuckets = useMemo(() => {
    if (!detail?.rca) return [];

    return groupSlaRca(rcaGrouping.data?.[detail.rca.key] ?? []);
  }, [detail?.rca, rcaGrouping.data]);

  useEffect(() => {
    setSearch("");
    setDrillRegion(null);
  }, [detail]);

  useEffect(() => {
    if (!detail) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (drillRegion) setDrillRegion(null);
      else onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [detail, drillRegion, onClose]);

  const isDrilling = Boolean(drillRegion);

  const columns: SlaDetailColumn[] = useMemo(
    () =>
      isDrilling ? (drilldown.data?.columns ?? []) : (detail?.columns ?? []),
    [isDrilling, drilldown.data, detail],
  );

  const baseRows: SlaDetailRow[] = useMemo(
    () => (isDrilling ? (drilldown.data?.rows ?? []) : (detail?.rows ?? [])),
    [isDrilling, drilldown.data, detail],
  );

  const statusKey = isDrilling ? drilldown.data?.statusKey : detail?.statusKey;

  const headerGroups = useMemo(() => {
    const groups: { label?: string; columns: SlaDetailColumn[] }[] = [];

    columns.forEach((column) => {
      const last = groups[groups.length - 1];

      if (column.group && last?.label === column.group) last.columns.push(column);
      else groups.push({ label: column.group, columns: [column] });
    });

    return groups;
  }, [columns]);

  const hasGroupedHeader = headerGroups.some((group) => Boolean(group.label));

  const achievement = isDrilling ? undefined : detail?.achievement;

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

        {detail.rca && !isDrilling && (
          <div className="flex flex-wrap items-stretch gap-2 border-b border-slate-100 bg-slate-100/70 px-5 py-3">
            <div className="flex w-32 shrink-0 flex-col items-center justify-center rounded-lg bg-orange-100 p-2.5 text-center shadow-sm">
              <span className="text-[11px] font-bold text-slate-600">
                Total Not Clear
              </span>
              <span className="text-xl leading-tight font-extrabold text-[#213c52]">
                {detail.rca.notClear ?? "-"}
              </span>
              <span className="text-[11px] font-bold text-slate-600">
                {detail.rca.notClearUnit ?? "Site"}
              </span>
            </div>

            {rcaBuckets.map((bucket) => (
              <div
                key={bucket.id}
                className="min-w-0 flex-1 basis-[150px] rounded-lg bg-white p-2.5 leading-snug shadow-sm"
              >
                <p className="text-[11px] font-bold text-slate-700">
                  {bucket.label} : {bucket.percent}% ({bucket.total})
                </p>
                {bucket.items.map((item, index) => (
                  <p
                    key={item.label}
                    className={`text-[9px] font-medium text-slate-500 ${
                      index === 0 ? "mt-1" : ""
                    }`}
                  >
                    {String.fromCharCode(97 + index)}. {item.label} :{" "}
                    {item.total}
                  </p>
                ))}
              </div>
            ))}

            {rcaGrouping.isPending && (
              <div className="flex items-center px-2 text-[11px] font-semibold text-slate-400">
                Memuat ringkasan RCA...
              </div>
            )}
          </div>
        )}

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
            <table className="w-full border-collapse text-center text-[11px]">
              <thead>
                {hasGroupedHeader ? (
                  <>
                    <tr>
                      {headerGroups.map((group) =>
                        group.label ? (
                          <th
                            key={`group-${group.label}`}
                            colSpan={group.columns.length}
                            className={`sticky top-0 z-10 border border-slate-700 px-2 py-1.5 text-center text-[10px] font-bold whitespace-nowrap ${toneClass()}`}
                          >
                            {group.label}
                          </th>
                        ) : (
                          <th
                            key={`solo-${group.columns[0].key}`}
                            rowSpan={2}
                            className={`sticky top-0 z-10 border border-slate-700 px-2 py-1.5 text-[10px] font-bold whitespace-nowrap ${toneClass()} ${cellAlignClass(group.columns[0])}`}
                          >
                            {group.columns[0].label}
                          </th>
                        ),
                      )}
                    </tr>
                    <tr>
                      {headerGroups
                        .filter((group) => group.label)
                        .flatMap((group) => group.columns)
                        .map((column) => (
                          <th
                            key={`sub-${column.key}`}
                            className={`sticky top-[30px] z-10 border border-slate-700 px-2 py-1 text-center text-[10px] font-bold whitespace-nowrap ${toneClass(column.tone)}`}
                          >
                            {column.label}
                          </th>
                        ))}
                    </tr>
                  </>
                ) : (
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`sticky top-0 z-10 whitespace-nowrap bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0] ${cellAlignClass(column)}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const ach = achievement
                    ? toComparable(row[achievement.achKey])
                    : null;
                  const target = achievement
                    ? toComparable(row[achievement.targetKey])
                    : null;
                  const achieved =
                    ach === null || target === null ? null : ach > target;
                  const groupRows = achievement?.groupRows;
                  const labelValue = String(
                    achievement ? (row[achievement.labelKey] ?? "") : "",
                  )
                    .trim()
                    .toLowerCase();
                  const highlightRow =
                    !groupRows ||
                    groupRows.some(
                      (groupRow) => groupRow.toLowerCase() === labelValue,
                    );
                  const achClass =
                    achieved === null
                      ? ""
                      : achieved
                        ? "text-emerald-600"
                        : "text-red-500";

                  return (
                  <tr
                    key={`${row[columns[0]?.key ?? ""] ?? index}-${index}`}
                    onClick={() =>
                      canDrill && setDrillRegion(String(row[regionKey] ?? ""))
                    }
                    className={`border-b border-slate-100 transition-colors last:border-b-0 ${
                      canDrill
                        ? "cursor-pointer hover:bg-indigo-50/50"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {columns.map((column) => {
                      const value = row[column.key];
                      const statusValue =
                        statusKey && column.key === "region" ? row[statusKey] : value;
                      const danger =
                        column.key === statusKey ||
                        (statusKey && column.key === "region")
                          ? isDangerValue(statusValue)
                          : false;
                      const isAchCell =
                        achievement &&
                        (column.key === achievement.achKey ||
                          column.key === achievement.labelKey);
                      const shouldToneRegion =
                        column.key === "region" &&
                        (Boolean(statusKey) ||
                          column.key === achievement?.labelKey);

                      return (
                        <td
                          key={column.key}
                          className={`px-2 py-2 font-semibold ${
                            hasGroupedHeader ? "border border-slate-200" : ""
                          } ${
                            column.key === "analisis" || column.key === "headline"
                              ? "max-w-[260px] truncate"
                              : "whitespace-nowrap"
                          } tabular-nums ${cellAlignClass(column)} ${
                            shouldToneRegion
                              ? regionToneClass({
                                  column,
                                  danger,
                                  achieved,
                                  hasStatusKey: Boolean(statusKey),
                                  highlightRow,
                                })
                              : isAchCell
                                ? achClass
                                : danger
                                  ? "text-red-500"
                                  : "text-[#213c52]"
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
                  );
                })}

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
