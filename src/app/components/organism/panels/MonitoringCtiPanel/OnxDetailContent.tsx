import { Fragment, useEffect, useMemo, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";

import {
  useOnxDetailQuery,
  useOnxSummaryQuery,
} from "@/app/hooks/query/monday/onxMonitoring";
import type {
  OnxDetailEntry,
  OnxProvider,
  OnxSummaryRow,
} from "@/app/types/monday/onxMonitoring.types";

export interface OnxDetailTarget {
  region: string;
  code: string;
  /** Terisi kalau yang diklik angka satu provider, bukan barisnya. */
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

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

/** Latency merah begitu melewati baseline IP-nya sendiri. */
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

/** Isi popup untuk mode ONX: ringkasan per region/code lalu detail per IP. */
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
          code: target.code,
          ...(target.provider ? { provider: target.provider } : {}),
        }
      : null,
  );

  // Escape mundur dari detail dulu; menutup popup diurus shell-nya.
  useEffect(() => {
    if (!target) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSelectTarget(null);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [target, onSelectTarget]);

  // Kalau yang diklik angka satu provider, kolom provider lain tidak perlu
  // ditampilkan — server pun hanya mengirim provider itu.
  const visibleProviders = useMemo(
    () =>
      target?.provider
        ? PROVIDERS.filter((provider) => provider.key === target.provider)
        : PROVIDERS,
    [target?.provider],
  );

  const summaryRows = useMemo(() => summary.data?.data ?? [], [summary.data]);
  const detailRows = useMemo(() => detail.data?.data ?? [], [detail.data]);

  const filteredSummary = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return summaryRows;

    return summaryRows.filter(
      (row) =>
        row.region?.toLowerCase().includes(keyword) ||
        row.code?.toLowerCase().includes(keyword),
    );
  }, [summaryRows, search]);

  const openTarget = (row: OnxSummaryRow, provider?: OnxProvider) =>
    onSelectTarget({ region: row.region, code: row.code, provider });

  if (target) {
    return (
      <>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <button
                type="button"
                onClick={() => onSelectTarget(null)}
                className="cursor-pointer transition-colors hover:text-indigo-500"
              >
                Ringkasan ONX
              </button>
              <LuChevronRight size={11} />
              <span className="text-[#213c52]">
                {target.region} · {target.code}
                {target.provider
                  ? ` · ${target.provider.toUpperCase()}`
                  : ""}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              Latency per IP tujuan dibanding baseline-nya
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTarget(null)}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-300 hover:text-[#213c52]"
          >
            <LuChevronLeft size={11} />
            Kembali
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
          ) : !detailRows.length ? (
            <p className="py-16 text-center text-[11px] font-semibold text-slate-400">
              Tidak ada data detail.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-[11px]">
              <thead>
                <tr>
                  <th className={headCell}>No</th>
                  <th className={headCell}>Region</th>
                  <th className={headCell}>Code</th>
                  {visibleProviders.map((provider) => (
                    <th
                      key={provider.key}
                      colSpan={2}
                      className={`${headCell} text-center`}
                    >
                      {provider.label}
                    </th>
                  ))}
                  <th className={`${headCell} text-center`}>All</th>
                </tr>
              </thead>

              <tbody>
                {detailRows.map((row) => {
                  // Tiap provider punya daftar IP sendiri; barisnya dibuat
                  // sebanyak daftar terpanjang, kolom sisanya dikosongkan.
                  const lists = visibleProviders.map(
                    (provider) => row[provider.key] ?? [],
                  );
                  const rowCount = Math.max(
                    1,
                    ...lists.map((list) => list.length),
                  );

                  return (
                    <Fragment key={`${row.region}-${row.code}-${row.no}`}>
                      {Array.from({ length: rowCount }).map((_, index) => (
                        <tr
                          key={`${row.code}-${index}`}
                          className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60"
                        >
                          {index === 0 && (
                            <>
                              <td
                                rowSpan={rowCount}
                                className="px-2 py-1.5 align-middle font-semibold text-slate-400"
                              >
                                {row.no}
                              </td>
                              <td
                                rowSpan={rowCount}
                                className="px-2 py-1.5 align-middle font-bold text-[#213c52]"
                              >
                                {row.region}
                              </td>
                              <td
                                rowSpan={rowCount}
                                className="px-2 py-1.5 align-middle font-bold text-highlight"
                              >
                                {row.code}
                              </td>
                            </>
                          )}

                          {lists.map((list, listIndex) => {
                            const entry = list[index];

                            return (
                              <Fragment key={visibleProviders[listIndex].key}>
                                <td className="px-2 py-1.5 text-center font-semibold text-slate-500 tabular-nums">
                                  {entry?.ip_address ?? "-"}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <LatencyValue entry={entry} />
                                </td>
                              </Fragment>
                            );
                          })}

                          {index === 0 && (
                            <td
                              rowSpan={rowCount}
                              className="px-2 py-1.5 text-center align-middle font-bold tabular-nums text-[#213c52]"
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
                    onClick={() => openTarget(row)}
                    className="cursor-pointer font-bold text-highlight transition-colors hover:underline"
                  >
                    {row.code}
                  </button>
                </td>

                {PROVIDERS.map((provider) => (
                  <td key={provider.key} className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => openTarget(row, provider.key)}
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
        klik angka provider untuk detail IP-nya
      </footer>
    </>
  );
}

export default OnxDetailContent;
