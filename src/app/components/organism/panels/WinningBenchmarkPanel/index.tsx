import { Fragment, useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

import { useRpjBenchmarkQuery } from "@/app/hooks/query/monday/rpjBenchmark";

// Assets — lihat catatan di NotchedCard soal kenapa tidak lewat `public`.
import isatIcon from "@/assets/icons/isat_.png";
import smartfrenIcon from "@/assets/icons/smartfren.png";
import tselIcon from "@/assets/icons/tsel_.png";
import xlIcon from "@/assets/icons/xl_.png";
import type {
  RpjBenchmarkRow,
  RpjMetric,
  RpjOperatorValues,
} from "@/app/types/monday/trendQuality.types";

const OPERATORS: {
  key: keyof RpjOperatorValues;
  label: string;
  icon: string;
}[] = [
  { key: "telkomsel", label: "Telkomsel", icon: tselIcon },
  { key: "indosat", label: "Indosat Ooredoo", icon: isatIcon },
  { key: "smartfren", label: "Smartfren", icon: smartfrenIcon },
  { key: "xl", label: "XL Axiata", icon: xlIcon },
];

const METRICS: { key: RpjMetric; label: string }[] = [
  { key: "packetloss", label: "Packet Loss" },
  { key: "latency", label: "Latency" },
  { key: "jitter", label: "Jitter" },
];

/** Semua metrik di sini "lower is better", jadi pemenangnya nilai terkecil. */
const bestOperator = (values: RpjOperatorValues) => {
  let winner: keyof RpjOperatorValues | null = null;
  let best = Number.POSITIVE_INFINITY;

  OPERATORS.forEach(({ key }) => {
    const value = values[key];
    if (value === null || value >= best) return;

    winner = key;
    best = value;
  });

  return winner as keyof RpjOperatorValues | null;
};

const formatValue = (value: number | null) =>
  value === null ? "-" : value.toFixed(2);

export function WinningBenchmarkPanel() {
  const { data: rows = [], isPending, isError } = useRpjBenchmarkQuery();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) =>
    setExpanded((current) => ({ ...current, [id]: !current[id] }));

  const renderCells = (row: RpjBenchmarkRow, isChild: boolean) =>
    METRICS.map((metric) => {
      const values = row[metric.key];
      const winner = bestOperator(values);

      return OPERATORS.map(({ key }) => {
        const value = values[key];

        return (
          <td
            key={`${metric.key}-${key}`}
            className={`border-l border-slate-100 px-1.5 py-2 text-center tabular-nums ${
              isChild ? "text-[10px]" : "text-[11px]"
            }`}
          >
            {key === "telkomsel" && value !== null ? (
              <span
                className={`inline-block rounded-full px-1.5 py-0.5 font-extrabold ${
                  winner === "telkomsel"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {formatValue(value)}
              </span>
            ) : (
              <span
                className={`font-semibold ${
                  winner === key ? "text-[#213c52]" : "text-slate-500"
                }`}
              >
                {formatValue(value)}
              </span>
            )}
          </td>
        );
      });
    });

  return (
    // `min-h-0` juga wajib di kartunya: tanpa itu, kartu sebagai flex item
    // tidak boleh lebih pendek dari isinya, jadi baris yang di-expand ikut
    // menambah tinggi kartu alih-alih memunculkan scroll.
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="mb-2">
        <h2 className="text-xs font-extrabold text-[#213c52]">
          Winning Benchmark RPJ Customer Experience
        </h2>
      </header>

      {/* `min-h-0` membuat wadah ini boleh lebih pendek dari isinya, jadi saat
          baris di-expand tabelnya yang discroll — tinggi kartu tidak berubah.
          `h-full` pada tabel tetap dipakai supaya saat isinya sedikit, sisa
          ruang dibagi rata ke tiap baris. */}
      <div className="flex min-h-0 flex-1 overflow-auto">
        <table className="h-full w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="sticky top-0 z-10 w-[132px] bg-white px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
              >
                Area
              </th>
              {METRICS.map((metric) => (
                <th
                  key={metric.key}
                  colSpan={OPERATORS.length}
                  className="sticky top-0 z-10 border-l border-slate-100 bg-white px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 shadow-[inset_0_-1px_0_#E2E8F0]"
                >
                  {metric.label}
                </th>
              ))}
            </tr>
            <tr>
              {METRICS.map((metric) =>
                OPERATORS.map((operator) => (
                  <th
                    key={`${metric.key}-${operator.key}`}
                    title={operator.label}
                    className="sticky top-[33px] z-10 border-l border-slate-100 bg-white px-1 py-1.5 shadow-[inset_0_-1px_0_#E2E8F0]"
                  >
                    <img
                      src={operator.icon}
                      alt={operator.label}
                      className="mx-auto h-4 w-auto object-contain"
                    />
                  </th>
                )),
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const isOpen = Boolean(expanded[row.id]);

              return (
                <Fragment key={row.id}>
                  <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/40">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        {row.children.length ? (
                          <button
                            type="button"
                            onClick={() => toggleRow(row.id)}
                            aria-label={isOpen ? "Tutup" : "Buka"}
                            className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#213c52]"
                          >
                            {isOpen ? (
                              <LuChevronDown size={11} />
                            ) : (
                              <LuChevronRight size={11} />
                            )}
                          </button>
                        ) : (
                          <span className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate text-[11px] font-extrabold text-[#213c52]">
                          {row.label}
                        </span>
                      </div>
                    </td>
                    {renderCells(row, false)}
                  </tr>

                  {isOpen &&
                    row.children.map((child) => (
                      <tr
                        key={child.id}
                        className="border-b border-slate-100 bg-slate-50/40"
                      >
                        <td className="py-1.5 pl-8 pr-2">
                          <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {child.label}
                          </span>
                        </td>
                        {renderCells(child, true)}
                      </tr>
                    ))}
                </Fragment>
              );
            })}

            {!rows.length && (
              <tr>
                <td
                  colSpan={1 + METRICS.length * OPERATORS.length}
                  className="px-2 py-10 text-center text-[11px] font-semibold text-slate-400"
                >
                  {isError
                    ? "Gagal memuat Winning Benchmark."
                    : isPending
                      ? "Memuat data benchmark..."
                      : "Data tidak tersedia."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[9px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-extrabold text-emerald-600">
            0.00
          </span>
          Telkomsel terbaik
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="rounded-full bg-red-50 px-1.5 py-0.5 font-extrabold text-red-500">
            0.00
          </span>
          Operator lain lebih baik
        </span>
        <span className="text-slate-400">Nilai lebih kecil lebih baik</span>
      </footer>
    </div>
  );
}
