import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { LuCalendar, LuSearch } from "react-icons/lu";
import { useDebouncedSearch } from "@/app/hooks/custom/pacer";
import { useCtiMonitoringQuery } from "@/app/hooks/query/monday/ticketQuality";
import type { CtiRow } from "@/app/types/monday/ticketQuality.types";

export function MonitoringCtiPanel() {
  const [activeTab, setActiveTab] = useState<"CTI" | "AWS">("CTI");
  const { data: ctiData = [] } = useCtiMonitoringQuery(activeTab);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);

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
            cell: ({ getValue }) => (
              <span className="font-extrabold text-emerald-500">{getValue<number>()}</span>
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
            cell: ({ getValue }) => (
              <span className="font-extrabold text-emerald-500">{getValue<number>()}</span>
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
            cell: ({ getValue }) => (
              <span className="font-extrabold text-emerald-500">{getValue<number>()}</span>
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
            Monitoring CTI 12:00 WIB
          </h2>
          <LuCalendar className="text-blue-500" size={14} />
        </div>

        <div className="flex items-center gap-1.5">
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
            onClick={() => setActiveTab("AWS")}
            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${
              activeTab === "AWS"
                ? "bg-[#007BFF] text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            AWS
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

      <div className="mt-2 flex-1 overflow-x-auto">
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
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="border border-slate-200 px-1 py-1 text-center text-[9px] font-extrabold text-[#213c52]"
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
