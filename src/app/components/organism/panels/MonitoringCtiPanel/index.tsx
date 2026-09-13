import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { LuCalendar, LuMaximize2, LuSearch } from "react-icons/lu";
import { useDebouncedSearch } from "@/app/hooks/custom/pacer";
import { formatMonitoringHour } from "@/app/utils/monday.utils";
import { useCtiMonitoringQuery } from "@/app/hooks/query/monday/trendQuality";
import { useOnxSummaryQuery } from "@/app/hooks/query/monday/onxMonitoring";
import type { CtiRow } from "@/app/types/monday/ticketQuality.types";
import type { CtiVerifier } from "@/app/types/monday/trendQuality.types";
import type {
  OnxProvider,
  OnxSummaryRow,
} from "@/app/types/monday/onxMonitoring.types";
import type { CtiDetailTarget } from "@/app/components/organism/panels/MonitoringCtiPanel/CtiDetailContent";
import type { OnxDetailTarget } from "@/app/components/organism/panels/MonitoringCtiPanel/OnxDetailContent";
import {
  MonitoringDetailModal,
  type MonitoringSource,
} from "@/app/components/organism/panels/MonitoringCtiPanel/MonitoringDetailModal";

const ONX_PROVIDERS: { key: OnxProvider; label: string }[] = [
  { key: "aws", label: "AWS" },
  { key: "google", label: "Google" },
  { key: "others", label: "Others" },
];

export function MonitoringCtiPanel() {
  const [activeTab, setActiveTab] = useState<MonitoringSource>("CTI");

  // Data CTI tetap diambil walau tab ONX aktif: popup-nya bisa ditukar ke CTI
  // kapan saja dan memakai baris yang sama dengan kartu ini.
  const { data: ctiData = [], isPending, isError } = useCtiMonitoringQuery();
  const onxSummary = useOnxSummaryQuery(activeTab === "ONX");
  const onxRows = useMemo(
    () => onxSummary.data?.data ?? [],
    [onxSummary.data],
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSource, setDetailSource] = useState<MonitoringSource>("CTI");
  const [detailTarget, setDetailTarget] = useState<CtiDetailTarget | null>(null);
  const [onxTarget, setOnxTarget] = useState<OnxDetailTarget | null>(null);

  /** Klik nilai latency langsung membuka popup pada detail transit itu. */
  const openTransitDetail = (peTransit: string, verifier: CtiVerifier) => {
    setDetailTarget({ transit: peTransit, verifier });
    setDetailSource("CTI");
    setDetailOpen(true);
  };

  /** Klik region/code (atau angka provider) membuka popup detail ONX-nya. */
  const openOnxDetail = (row: OnxSummaryRow, provider?: OnxProvider) => {
    setOnxTarget({ region: row.region, code: row.code, provider });
    setDetailSource("ONX");
    setDetailOpen(true);
  };

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return ctiData;
    return ctiData.filter((row) =>
      row.peTransit.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [ctiData, debouncedSearch]);

  const filteredOnxRows = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) return onxRows;

    return onxRows.filter(
      (row) =>
        row.region?.toLowerCase().includes(keyword) ||
        row.code?.toLowerCase().includes(keyword),
    );
  }, [onxRows, debouncedSearch]);

  const columns = useMemo<ColumnDef<CtiRow>[]>(
    () => [
      {
        accessorKey: "no",
        header: "No",
      },
      {
        accessorKey: "peTransit",
        header: "Pe Transit",
      },
      {
        id: "bds",
        header: "BDS",
        columns: [
          {
            id: "bdsBaseline",
            header: "Baseline",
            accessorFn: (row) => row.bds.baseline,
            cell: ({ getValue }) => (
              <span className="font-extrabold text-slate-800">{getValue<number>()}</span>
            ),
          },
          {
            id: "bdsLatency",
            header: "Latency",
            accessorFn: (row) => row.bds.latency,
            cell: ({ row, getValue }) => (
              <button
                type="button"
                onClick={() =>
                  openTransitDetail(row.original.peTransit, "BDS")
                }
                className={`cursor-pointer font-extrabold transition-colors hover:underline ${
                  row.original.bds.latency > row.original.bds.baseline
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              >
                {getValue<number>()}
              </button>
            ),
          },
        ],
      },
      {
        id: "btc",
        header: "BTC",
        columns: [
          {
            id: "btcBaseline",
            header: "Baseline",
            accessorFn: (row) => row.btc.baseline,
            cell: ({ getValue }) => (
              <span className="font-extrabold text-slate-800">{getValue<number>()}</span>
            ),
          },
          {
            id: "btcLatency",
            header: "Latency",
            accessorFn: (row) => row.btc.latency,
            cell: ({ row, getValue }) => (
              <button
                type="button"
                onClick={() =>
                  openTransitDetail(row.original.peTransit, "BTC")
                }
                className={`cursor-pointer font-extrabold transition-colors hover:underline ${
                  row.original.btc.latency > row.original.btc.baseline
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              >
                {getValue<number>()}
              </button>
            ),
          },
        ],
      },
      {
        id: "pink",
        header: "Pink",
        columns: [
          {
            id: "pinkBaseline",
            header: "Baseline",
            accessorFn: (row) => row.pink.baseline,
            cell: ({ getValue }) => (
              <span className="font-extrabold text-slate-800">{getValue<number>()}</span>
            ),
          },
          {
            id: "pinkLatency",
            header: "Latency",
            accessorFn: (row) => row.pink.latency,
            cell: ({ row, getValue }) => (
              <button
                type="button"
                onClick={() =>
                  openTransitDetail(row.original.peTransit, "PNK")
                }
                className={`cursor-pointer font-extrabold transition-colors hover:underline ${
                  row.original.pink.latency > row.original.pink.baseline
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              >
                {getValue<number>()}
              </button>
            ),
          },
        ],
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xs font-extrabold text-[#213c52]">
            Monitoring {activeTab} {formatMonitoringHour()} WIB
          </h2>
          <LuCalendar className="text-blue-500" size={14} />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDetailTarget(null);
              setOnxTarget(null);
              setDetailSource(activeTab);
              setDetailOpen(true);
            }}
            aria-label={`Lihat semua data ${activeTab}`}
            title={`Lihat semua data ${activeTab}`}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#213c52]"
          >
            <LuMaximize2 size={12} />
          </button>
          <button
            onClick={() => setActiveTab("CTI")}
            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${
              activeTab === "CTI"
                ? "bg-[#007BFF] text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            CTI
          </button>
          <button
            onClick={() => setActiveTab("ONX")}
            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${
              activeTab === "ONX"
                ? "bg-[#007BFF] text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            ONX
          </button>
        </div>
      </header>

      <div className="relative mt-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1 pl-8 pr-3 text-[10px] font-semibold text-[#213c52] outline-none transition-colors focus:border-indigo-500"
        />
        <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
      </div>

      {activeTab === "CTI" ? (
        <>
      {/* Tinggi dikunci ~5 baris (header 2 x 24px + 5 x 22px); sisanya discroll. */}
      <div className="mt-2 max-h-[160px] overflow-auto">
        <table className="w-full min-w-[500px] table-fixed border-collapse text-left text-[10px]">
          <colgroup>
            <col style={{ width: "30px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup, groupIndex) => (
              <tr key={headerGroup.id} className="border-b border-slate-200">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    // inset shadow: garis header tetap terlihat saat body
                    // discroll (border tabel `collapse` tidak ikut sticky)
                    className={`sticky z-10 h-6 border border-slate-200 bg-[#F8FAFC] px-1 py-1 text-center text-[9px] font-extrabold text-[#213c52] shadow-[inset_0_-1px_0_#E2E8F0] ${
                      groupIndex === 0 ? "top-0" : "top-6"
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border border-slate-100 px-1 py-1 text-center text-[9px] text-slate-700 truncate"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {!table.getRowModel().rows.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-2 py-8 text-center text-[10px] font-semibold text-slate-500"
                >
                  {isError
                    ? "Gagal memuat data Monitoring CTI."
                    : isPending && activeTab === "CTI"
                      ? "Memuat data Monitoring CTI..."
                      : "Data tidak ditemukan."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      ) : (
        <>
      {/* Tabel ONX: ringkasan jumlah IP per provider tiap region/code. */}
      <div className="mt-2 max-h-[160px] overflow-auto">
        <table className="w-full min-w-[500px] table-fixed border-collapse text-left text-[10px]">
          <colgroup>
            <col style={{ width: "30px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "45px" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200">
              {["No", "Region", "Code", ...ONX_PROVIDERS.map((p) => p.label), "All"].map(
                (label) => (
                  <th
                    key={label}
                    className="sticky top-0 z-10 h-6 border border-slate-200 bg-[#F8FAFC] px-1 py-1 text-center text-[9px] font-extrabold text-[#213c52] shadow-[inset_0_-1px_0_#E2E8F0]"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filteredOnxRows.map((row) => (
              <tr
                key={`${row.region}-${row.code}`}
                className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors"
              >
                <td className="border border-slate-100 px-1 py-1 text-center text-[9px] text-slate-500">
                  {row.no}
                </td>
                <td className="border border-slate-100 px-1 py-1 text-center text-[9px]">
                  <button
                    type="button"
                    onClick={() => openOnxDetail(row)}
                    className="cursor-pointer truncate font-extrabold text-[#213c52] transition-colors hover:text-indigo-500 hover:underline"
                  >
                    {row.region}
                  </button>
                </td>
                <td className="border border-slate-100 px-1 py-1 text-center text-[9px]">
                  <button
                    type="button"
                    onClick={() => openOnxDetail(row)}
                    className="cursor-pointer font-extrabold text-highlight transition-colors hover:underline"
                  >
                    {row.code}
                  </button>
                </td>
                {ONX_PROVIDERS.map((provider) => (
                  <td
                    key={provider.key}
                    className="border border-slate-100 px-1 py-1 text-center text-[9px]"
                  >
                    <button
                      type="button"
                      onClick={() => openOnxDetail(row, provider.key)}
                      title={`Detail ${provider.label} ${row.code}`}
                      className="cursor-pointer font-extrabold text-slate-700 transition-colors hover:text-indigo-500 hover:underline"
                    >
                      {row[provider.key] ?? "-"}
                    </button>
                  </td>
                ))}
                <td className="border border-slate-100 px-1 py-1 text-center text-[9px] font-extrabold text-slate-500">
                  {row.all ?? "-"}
                </td>
              </tr>
            ))}

            {!filteredOnxRows.length && (
              <tr>
                <td
                  colSpan={7}
                  className="px-2 py-8 text-center text-[10px] font-semibold text-slate-500"
                >
                  {onxSummary.isError
                    ? "Gagal memuat data Monitoring ONX."
                    : onxSummary.isPending
                      ? "Memuat data Monitoring ONX..."
                      : "Data tidak ditemukan."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      )}

      <MonitoringDetailModal
        open={detailOpen}
        source={detailSource}
        onSourceChange={setDetailSource}
        ctiRows={ctiData}
        ctiTarget={detailTarget}
        onCtiTargetChange={setDetailTarget}
        onxTarget={onxTarget}
        onOnxTargetChange={setOnxTarget}
        onClose={() => {
          setDetailOpen(false);
          setDetailTarget(null);
          setOnxTarget(null);
        }}
      />
    </div>
  );
}
