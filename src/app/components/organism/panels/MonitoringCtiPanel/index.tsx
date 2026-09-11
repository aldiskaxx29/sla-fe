import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { LuCalendar, LuMaximize2, LuSearch } from "react-icons/lu";
import { useDebouncedSearch } from "@/app/hooks/custom/pacer";
import { useCtiMonitoringQuery } from "@/app/hooks/query/monday/trendQuality";
import { useCtiMonitoringQuery as useAwsMonitoringQuery } from "@/app/hooks/query/monday/ticketQuality";
import type { CtiRow } from "@/app/types/monday/ticketQuality.types";
import type { CtiVerifier } from "@/app/types/monday/trendQuality.types";
import {
  CtiDetailModal,
  type CtiDetailTarget,
} from "@/app/components/organism/panels/MonitoringCtiPanel/CtiDetailModal";

export function MonitoringCtiPanel() {
  const [activeTab, setActiveTab] = useState<"CTI" | "AWS">("CTI");

  // Tab CTI sudah memakai data asli; tab AWS di server lama bentuknya beda
  // (kolom per host, bukan BDS/BTC/PNK) jadi masih memakai data contoh.
  const { data: realCtiData = [], isPending, isError } =
    useCtiMonitoringQuery(activeTab === "CTI");
  const { data: awsData = [] } = useAwsMonitoringQuery("AWS");
  const ctiData = activeTab === "CTI" ? realCtiData : awsData;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<CtiDetailTarget | null>(null);

  /** Klik nilai latency langsung membuka popup pada detail transit itu. */
  const openTransitDetail = (peTransit: string, verifier: CtiVerifier) => {
    setDetailTarget({ transit: peTransit, verifier });
    setDetailOpen(true);
  };

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return ctiData;
    return ctiData.filter((row) =>
      row.peTransit.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [ctiData, debouncedSearch]);

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
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-extrabold text-[#213c52]">
            Monitoring CTI 12:00 WIB
          </h2>
          <LuCalendar className="text-blue-500" size={14} />
        </div>

        <button
          type="button"
          onClick={() => {
            setDetailTarget(null);
            setDetailOpen(true);
          }}
          aria-label="Lihat semua PE transit"
          title="Lihat semua PE transit"
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#213c52]"
        >
          <LuMaximize2 size={12} />
        </button>
      </header>

      {/* Search dan pemilih sumber data sebaris, seperti desain. */}
      <div className="mt-2 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-[10px] font-semibold text-[#213c52] outline-none transition-colors focus:border-indigo-500"
          />
          <LuSearch
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={12}
          />
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(["CTI", "AWS"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-[10px] font-extrabold transition-all ${
                activeTab === tab
                  ? "bg-[#007BFF] text-white shadow-xs"
                  : "text-slate-500 hover:text-[#213c52]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tinggi dikunci ~7 baris (header 2 x 24px + 7 x 22px); sisanya discroll. */}
      <div className="mt-2 max-h-[210px] overflow-auto">
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

      <CtiDetailModal
        open={detailOpen}
        rows={ctiData}
        target={detailTarget}
        onSelectTarget={setDetailTarget}
        onClose={() => {
          setDetailOpen(false);
          setDetailTarget(null);
        }}
      />
    </div>
  );
}
