import { Fragment, useEffect, useMemo, useState } from "react";
import { LuChevronLeft, LuDownload, LuSearch } from "react-icons/lu";

import {
  useOnxDetailQuery,
  useOnxSummaryQuery,
} from "@/app/hooks/query/monday/onxMonitoring";
import type {
  OnxDetailEntry,
  OnxDetailRow,
  OnxProvider,
  OnxSummaryRow,
} from "@/app/types/monday/onxMonitoring.types";

export interface OnxDetailTarget {
  region: string;
  code?: string;
  provider?: OnxProvider;
}

interface OnxDetailContentProps {
  target: OnxDetailTarget | null;
  onSelectTarget: (target: OnxDetailTarget | null) => void;
}

const PROVIDERS: { key: OnxProvider; label: string }[] = [
  { key: "aws", label: "AWS" },
  { key: "google", label: "Google" },
  { key: "others", label: "Others" },
];

const headCell =
  "sticky top-0 z-10 bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]";

const detailHeadCell =
  "border-r border-b border-slate-200 bg-[#f8fafc] px-2.5 py-2 align-middle";
const subHeadCell =
  "border-r border-b border-slate-200 bg-[#f8fafc] px-2 py-1.5";
const groupCell = "border-r border-slate-200 px-2 py-1.5 text-center align-middle";
const bodyCell = "border-r border-slate-100 px-2 py-1.5 text-center";

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

function LatencyValue({ entry }: { entry?: OnxDetailEntry }) {
  const latency = toNumber(entry?.latency);
  const baseline = toNumber(entry?.baseline);

  if (latency === null) return <span className="text-slate-300">-</span>;

  const over = baseline !== null && latency > baseline;

  return (
    <span
      title={baseline !== null ? `Baseline ${baseline}` : undefined}
      className={`font-bold tabular-nums ${
        over ? "text-red-500" : "text-emerald-600"
      }`}
    >
      {latency}
    </span>
  );
}

const CSV_HEADERS = [
  "No",
  "Region",
  "Code",
  ...PROVIDERS.flatMap((provider) => [
    `${provider.label} IP Address`,
    `${provider.label} Baseline`,
    `${provider.label} Latency`,
  ]),
  "All",
];

const csvCell = (value: unknown) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const exportDetail = (region: string, rows: OnxDetailRow[]) => {
  const lines = [CSV_HEADERS.join(",")];

  rows.forEach((row) => {
    const lists = PROVIDERS.map((provider) => row[provider.key] ?? []);
    const rowCount = Math.max(1, ...lists.map((list) => list.length));

    for (let index = 0; index < rowCount; index += 1) {
      lines.push(
        [
          index === 0 ? row.no : "",
          index === 0 ? row.region : "",
          index === 0 ? row.code : "",
          ...lists.flatMap((list) => [
            list[index]?.ip_address ?? "",
            list[index]?.baseline ?? "",
            list[index]?.latency ?? "",
          ]),
          index === 0 ? (row.all ?? "") : "",
        ]
          .map(csvCell)
          .join(","),
      );
    }
  });

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `monitoring-onx-${region || "all"}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export function OnxDetailContent({
  target,
  onSelectTarget,
}: OnxDetailContentProps) {
  const [search, setSearch] = useState("");

  const summary = useOnxSummaryQuery();
  const detail = useOnxDetailQuery(
    target
      ? {
          region: target.region,
          ...(target.provider ? { provider: target.provider } : {}),
          ...(target.code ? { code: target.code } : {}),
        }
      : null,
  );

  useEffect(() => {
    if (!target) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSelectTarget(null);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [target, onSelectTarget]);

  const visibleProviders = useMemo(
    () =>
      target?.provider
        ? PROVIDERS.filter((provider) => provider.key === target.provider)
        : PROVIDERS,
    [target?.provider],
  );

  const summaryRows = useMemo(() => summary.data?.data ?? [], [summary.data]);
  const detailRows = useMemo(() => detail.data?.data ?? [], [detail.data]);

  const filteredDetail = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return detailRows;

    return detailRows.filter(
      (row) =>
        row.code?.toLowerCase().includes(keyword) ||
        row.region?.toLowerCase().includes(keyword) ||
        PROVIDERS.some((provider) =>
          (row[provider.key] ?? []).some((entry) =>
            entry.ip_address?.toLowerCase().includes(keyword),
          ),
        ),
    );
  }, [detailRows, search]);

  const filteredSummary = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return summaryRows;

    return summaryRows.filter(
      (row) =>
        row.region?.toLowerCase().includes(keyword) ||
        row.code?.toLowerCase().includes(keyword),
    );
  }, [summaryRows, search]);

  const openTarget = (
    row: OnxSummaryRow,
    options: { withCode?: boolean; provider?: OnxProvider } = {},
  ) =>
    onSelectTarget({
      region: row.region,
      ...(options.withCode || options.provider ? { code: row.code } : {}),
      ...(options.provider ? { provider: options.provider } : {}),
    });

  if (target) {
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectTarget(null)}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition-colors hover:border-slate-300 hover:text-[#213c52]"
            >
              <LuChevronLeft size={12} />
              Ringkasan
            </button>

            <div className="relative w-56">
              <LuSearch
                className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                size={13}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-[11px] font-semibold text-[#213c52] outline-none transition-colors focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => exportDetail(target.region, filteredDetail)}
            disabled={!filteredDetail.length}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#007BFF] px-5 py-2 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LuDownload size={13} />
            Export
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-3">
          {detail.isPending ? (
            <p className="py-16 text-center text-[11px] font-semibold text-slate-400">
              Memuat detail {target.region}...
            </p>
          ) : detail.isError ? (
            <p className="py-16 text-center text-[11px] font-semibold text-red-500">
              Gagal memuat detail ONX.
            </p>
          ) : !filteredDetail.length ? (
            <p className="py-16 text-center text-[11px] font-semibold text-slate-400">
              Tidak ada data detail.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f8fafc] text-[11px] font-bold text-slate-500">
                    <th rowSpan={2} className={`${detailHeadCell} w-10 text-center`}>
                      No
                    </th>
                    <th rowSpan={2} className={`${detailHeadCell} text-center`}>
                      Region
                    </th>
                    <th rowSpan={2} className={`${detailHeadCell} text-center`}>
                      Code
                    </th>
                    {visibleProviders.map((provider) => (
                      <th
                        key={provider.key}
                        colSpan={3}
                        className={`${detailHeadCell} text-center`}
                      >
                        {provider.label}
                      </th>
                    ))}
                    <th rowSpan={2} className={`${detailHeadCell} w-14 text-center`}>
                      All
                    </th>
                  </tr>
                  <tr className="bg-[#f8fafc] text-[10px] font-semibold text-slate-500">
                    {visibleProviders.map((provider) => (
                      <Fragment key={provider.key}>
                        <th className={`${subHeadCell} text-center`}>
                          IP Address
                        </th>
                        <th className={`${subHeadCell} text-center`}>
                          Baseline
                        </th>
                        <th className={`${subHeadCell} text-center`}>
                          Latency
                        </th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredDetail.map((row, rowIndex) => {
                    const lists = visibleProviders.map(
                      (provider) => row[provider.key] ?? [],
                    );
                    const rowCount = Math.max(
                      1,
                      ...lists.map((list) => list.length),
                    );
                    const highlighted =
                      Boolean(target.code) &&
                      row.code?.toUpperCase() === target.code?.toUpperCase();
                    const groupBg = highlighted
                      ? "bg-amber-50/70"
                      : rowIndex % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50/40";

                    return (
                      <Fragment key={`${row.region}-${row.code}-${row.no}`}>
                        {Array.from({ length: rowCount }).map((_, index) => (
                          <tr
                            key={`${row.code}-${index}`}
                            className={`${groupBg} border-b border-slate-100 transition-colors last:border-b-0 hover:bg-blue-50/40`}
                          >
                            {index === 0 && (
                              <>
                                <td
                                  rowSpan={rowCount}
                                  className={`${groupCell} font-semibold text-slate-500`}
                                >
                                  {row.no}
                                </td>
                                <td
                                  rowSpan={rowCount}
                                  className={`${groupCell} font-bold text-[#213c52]`}
                                >
                                  {row.region}
                                </td>
                                <td
                                  rowSpan={rowCount}
                                  className={`${groupCell} font-bold text-blue-600`}
                                >
                                  {row.code}
                                </td>
                              </>
                            )}

                            {lists.map((list, listIndex) => {
                              const entry = list[index];

                              return (
                                <Fragment key={visibleProviders[listIndex].key}>
                                  <td className={`${bodyCell} text-slate-500`}>
                                    {entry?.ip_address ?? "-"}
                                  </td>
                                  <td
                                    className={`${bodyCell} font-semibold text-slate-500 tabular-nums`}
                                  >
                                    {entry?.baseline ?? "-"}
                                  </td>
                                  <td className={`${bodyCell} border-r border-slate-200`}>
                                    <LatencyValue entry={entry} />
                                  </td>
                                </Fragment>
                              );
                            })}

                            {index === 0 && (
                              <td
                                rowSpan={rowCount}
                                className="px-2 py-1.5 text-center align-middle font-bold text-[#213c52] tabular-nums"
                              >
                                {row.all ?? "-"}
                              </td>
                            )}
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
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
            placeholder="Cari region atau code..."
            className="w-full rounded-full border border-slate-200 bg-slate-50/60 py-1.5 pl-9 pr-3 text-[11px] font-semibold text-[#213c52] outline-none transition-colors focus:border-indigo-400 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-3">
        <table className="w-full border-collapse text-left text-[11px]">
          <thead>
            <tr>
              <th className={headCell}>No</th>
              <th className={headCell}>Region</th>
              <th className={headCell}>Code</th>
              {PROVIDERS.map((provider) => (
                <th
                  key={provider.key}
                  className={`${headCell} text-center`}
                >
                  {provider.label}
                </th>
              ))}
              <th className={`${headCell} text-center`}>All</th>
            </tr>
          </thead>

          <tbody>
            {filteredSummary.map((row) => (
              <tr
                key={`${row.region}-${row.code}`}
                className="border-b border-slate-50 transition-colors last:border-b-0 hover:bg-slate-50/60"
              >
                <td className="px-2 py-1.5 font-semibold text-slate-400">
                  {row.no}
                </td>
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => openTarget(row)}
                    className="cursor-pointer font-bold text-[#213c52] transition-colors hover:text-indigo-500 hover:underline"
                  >
                    {row.region}
                  </button>
                </td>
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => openTarget(row, { withCode: true })}
                    className="cursor-pointer font-bold text-highlight transition-colors hover:underline"
                  >
                    {row.code}
                  </button>
                </td>

                {PROVIDERS.map((provider) => (
                  <td key={provider.key} className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => openTarget(row, { provider: provider.key })}
                      title={`Detail ${provider.label} ${row.code}`}
                      className="cursor-pointer rounded-md px-2 py-0.5 font-bold tabular-nums text-[#213c52] transition-colors hover:bg-slate-100"
                    >
                      {row[provider.key] ?? "-"}
                    </button>
                  </td>
                ))}

                <td className="px-2 py-1.5 text-center font-bold tabular-nums text-slate-500">
                  {row.all ?? "-"}
                </td>
              </tr>
            ))}

            {!filteredSummary.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-2 py-10 text-center text-[11px] font-semibold text-slate-400"
                >
                  {summary.isError
                    ? "Gagal memuat ringkasan ONX."
                    : summary.isPending
                      ? "Memuat ringkasan ONX..."
                      : "Data tidak ditemukan."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] font-semibold text-slate-500">
        Menampilkan {filteredSummary.length} dari {summaryRows.length} region ·
        klik barisnya untuk detail IP per region
      </footer>
    </>
  );
}

export default OnxDetailContent;
