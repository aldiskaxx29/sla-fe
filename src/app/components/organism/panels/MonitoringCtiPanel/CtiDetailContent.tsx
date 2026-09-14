import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";

import { useCtiTransitDetailQuery } from "@/app/hooks/query/monday/trendQuality";
import type { CtiRow } from "@/app/types/monday/ticketQuality.types";
import type { CtiVerifier } from "@/app/types/monday/trendQuality.types";

export interface CtiDetailTarget {
  transit: string;
  verifier: CtiVerifier;
}

interface CtiDetailContentProps {
  rows: CtiRow[];
  target: CtiDetailTarget | null;
  onSelectTarget: (target: CtiDetailTarget | null) => void;
}

const VERIFIERS: { key: "bds" | "btc" | "pink"; label: CtiVerifier }[] = [
  { key: "bds", label: "BDS" },
  { key: "btc", label: "BTC" },
  { key: "pink", label: "PNK" },
];

const today = () => new Date().toISOString().slice(0, 10);

export function CtiDetailContent({
  rows,
  target,
  onSelectTarget,
}: CtiDetailContentProps) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const detail = useCtiTransitDetailQuery(
    target ? { ...target, startDate, endDate } : null,
  );

  useEffect(() => {
    if (!target) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSelectTarget(null);
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [target, onSelectTarget]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) =>
      row.peTransit.toLowerCase().includes(keyword),
    );
  }, [rows, search]);

  const points = useMemo(() => detail.data ?? [], [detail.data]);

  const chartOption = useMemo<EChartsOption>(
    () => ({
      grid: { top: 24, left: 8, right: 16, bottom: 28, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        textStyle: { color: "#213c52", fontSize: 11 },
        valueFormatter: (value) =>
          value === null || value === undefined
            ? "-"
            : `${Number(value).toFixed(2)} ms`,
      },
      legend: {
        data: ["Latency", "Baseline"],
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { fontSize: 10, color: "#64748B" },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: points.map((point) => point.label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#E2E8F0" } },
        axisLabel: { color: "#64748B", fontSize: 9, rotate: points.length > 12 ? 30 : 0 },
      },
      yAxis: {
        type: "value",
        scale: true,
        name: "ms",
        nameTextStyle: { color: "#94A3B8", fontSize: 9 },
        splitLine: { lineStyle: { color: "#F1F5F9" } },
        axisLabel: { color: "#64748B", fontSize: 10 },
      },
      series: [
        {
          name: "Latency",
          type: "line",
          smooth: true,
          symbolSize: 7,
          data: points.map((point) => ({
            value: point.latency,
            itemStyle: {
              color: point.latency > point.baseline ? "#EF4444" : "#3B82F6",
            },
          })),
          lineStyle: { width: 2, color: "#3B82F6" },
        },
        {
          name: "Baseline",
          type: "line",
          symbol: "none",
          data: points.map((point) => point.baseline),
          lineStyle: { width: 2, color: "#94A3B8" },
        },
      ],
    }),
    [points],
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <button
              type="button"
              onClick={() => onSelectTarget(null)}
              className={`transition-colors ${
                target
                  ? "cursor-pointer hover:text-indigo-500"
                  : "cursor-default text-[#213c52]"
              }`}
            >
              Seluruh PE transit
            </button>
            {target && (
              <>
                <LuChevronRight size={11} />
                <span className="text-[#213c52]">
                  {target.transit} · {target.verifier}
                </span>
              </>
            )}
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            {target
              ? "Latency per jam dibanding baseline"
              : "Klik nilai latency untuk melihat trennya"}
          </p>
        </div>

        {target && (
          <button
            type="button"
            onClick={() => onSelectTarget(null)}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-300 hover:text-[#213c52]"
          >
            <LuChevronLeft size={11} />
            Kembali
          </button>
        )}
      </div>

        {target ? (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3 text-[10px] font-bold text-slate-500">
              <span>Periode</span>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-[#213c52] outline-none focus:border-indigo-400"
              />
              <span>-</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-[#213c52] outline-none focus:border-indigo-400"
              />
              {points[0] && (
                <span className="ml-auto font-semibold text-slate-400">
                  Region {points[0].region} · Target {points[0].target}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto px-5 py-3">
              {detail.isPending ? (
                <p className="py-16 text-center text-[11px] font-semibold text-slate-400">
                  Memuat detail {target.transit}...
                </p>
              ) : detail.isError ? (
                <p className="py-16 text-center text-[11px] font-semibold text-red-500">
                  Gagal memuat detail transit.
                </p>
              ) : !points.length ? (
                <p className="py-16 text-center text-[11px] font-semibold text-slate-400">
                  Tidak ada data pada periode ini.
                </p>
              ) : (
                <>
                  <div className="h-56 w-full">
                    <ReactECharts
                      option={chartOption}
                      notMerge
                      style={{ height: "100%", width: "100%" }}
                    />
                  </div>

                  <table className="mt-3 w-full border-collapse text-left text-[11px]">
                    <thead>
                      <tr>
                        {["Jam", "Latency", "Baseline", "Status"].map(
                          (label) => (
                            <th
                              key={label}
                              className="sticky top-0 z-10 bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
                            >
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {points.map((point) => {
                        const over = point.latency > point.baseline;

                        return (
                          <tr
                            key={point.label}
                            className="border-b border-slate-50 last:border-b-0"
                          >
                            <td className="px-2 py-1.5 font-semibold text-[#213c52]">
                              {point.label}
                            </td>
                            <td
                              className={`px-2 py-1.5 font-bold tabular-nums ${
                                over ? "text-red-500" : "text-[#213c52]"
                              }`}
                            >
                              {point.latency.toFixed(2)}
                            </td>
                            <td className="px-2 py-1.5 font-semibold tabular-nums text-slate-500">
                              {point.baseline.toFixed(2)}
                            </td>
                            <td className="px-2 py-1.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  over
                                    ? "bg-red-50 text-red-500"
                                    : "bg-emerald-50 text-emerald-600"
                                }`}
                              >
                                {over ? "Over baseline" : "Normal"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </>
        ) : (
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
                  placeholder="Cari PE transit..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50/60 py-1.5 pl-9 pr-3 text-[11px] font-semibold text-[#213c52] outline-none transition-colors focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto px-5 py-3">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]">
                      No
                    </th>
                    <th className="sticky top-0 z-10 bg-white px-2 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]">
                      Pe Transit
                    </th>
                    {VERIFIERS.map((verifier) => (
                      <th
                        key={verifier.key}
                        colSpan={2}
                        className="sticky top-0 z-10 bg-white px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
                      >
                        {verifier.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.peTransit + row.no}
                      className="border-b border-slate-50 transition-colors last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="px-2 py-1.5 font-semibold text-slate-400">
                        {row.no}
                      </td>
                      <td className="px-2 py-1.5 font-bold text-[#213c52]">
                        {row.peTransit}
                      </td>
                      {VERIFIERS.map((verifier) => {
                        const cell = row[verifier.key];
                        const over = cell.latency > cell.baseline;

                        return [
                          <td
                            key={`${verifier.key}-baseline`}
                            className="px-2 py-1.5 text-center font-semibold tabular-nums text-slate-500"
                          >
                            {cell.baseline}
                          </td>,
                          <td
                            key={`${verifier.key}-latency`}
                            className="px-2 py-1.5 text-center"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                onSelectTarget({
                                  transit: row.peTransit,
                                  verifier: verifier.label,
                                })
                              }
                              className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-bold text-white transition-colors ${
                                over
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-emerald-500 hover:bg-emerald-600"
                              }`}
                            >
                              {cell.latency}
                            </button>
                          </td>,
                        ];
                      })}
                    </tr>
                  ))}

                  {!filteredRows.length && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-2 py-10 text-center text-[11px] font-semibold text-slate-400"
                      >
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] font-semibold text-slate-500">
              Menampilkan {filteredRows.length} dari {rows.length} PE transit
            </footer>
        </>
      )}
    </>
  );
}

export default CtiDetailContent;
