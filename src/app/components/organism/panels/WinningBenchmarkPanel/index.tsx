import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  LuTrophy,
  LuChevronDown,
  LuChevronUp,
  LuArrowUp,
  LuArrowDown,
} from "react-icons/lu";
import { FaExclamationTriangle } from "react-icons/fa";
import { useWinningBenchmarkQuery } from "@/app/hooks/query/monday/ticketQuality";
import type {
  BenchmarkRow,
  BenchmarkValue,
} from "@/app/types/monday/ticketQuality.types";

export function WinningBenchmarkPanel() {
  const { data: benchmarkData = [] } = useWinningBenchmarkQuery();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderValueCell = (val: BenchmarkValue) => {
    const isTrophy = val.trophy.type === "gold" || val.trophy.type === "silver" || val.trophy.type === "bronze";

    return (
      <div className="flex items-center justify-center gap-1.5 py-0.5">
        <div
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold shadow-3xs ${
            isTrophy
              ? "border-amber-200 bg-amber-100/70 text-amber-700"
              : "border-emerald-200 bg-emerald-100/70 text-emerald-700"
          }`}
        >
          <span
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-white ${
              isTrophy ? "bg-amber-500" : "bg-emerald-500"
            }`}
          >
            <LuTrophy size={8} className="text-white" />
          </span>
          {val.trophy.trend === "up" ? (
            <LuArrowUp size={8} className={isTrophy ? "text-amber-600" : "text-emerald-600"} />
          ) : (
            <LuArrowDown size={8} className={isTrophy ? "text-amber-600" : "text-emerald-600"} />
          )}
          <span>{val.trophy.value.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-red-200 bg-red-100/70 px-2 py-0.5 text-[9px] font-extrabold text-red-700 shadow-3xs">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
            <FaExclamationTriangle size={8} className="text-white" />
          </span>
          {val.warning.trend === "up" ? (
            <LuArrowUp size={8} className="text-red-600" />
          ) : (
            <LuArrowDown size={8} className="text-red-600" />
          )}
          <span>{val.warning.value.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  const columns = useMemo<ColumnDef<BenchmarkRow>[]>(
    () => [
      {
        accessorKey: "area",
        header: "Area",
        cell: ({ getValue }) => (
          <span className="text-[10px] font-extrabold text-[#213c52]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "latency",
        header: "Latency (ms)",
        cell: ({ getValue }) => renderValueCell(getValue<BenchmarkValue>()),
      },
      {
        accessorKey: "packetLoss",
        header: "Packet Loss (%)",
        cell: ({ getValue }) => renderValueCell(getValue<BenchmarkValue>()),
      },
      {
        accessorKey: "jitter",
        header: "Jitter (ms)",
        cell: ({ getValue }) => renderValueCell(getValue<BenchmarkValue>()),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isExpanded = !!expandedRows[row.original.id];
          if (row.original.area !== "Area 1") {
            return <div className="w-5 h-5" />;
          }
          return (
            <button
              onClick={() => toggleRow(row.original.id)}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer"
            >
              {isExpanded ? <LuChevronUp size={12} /> : <LuChevronDown size={12} />}
            </button>
          );
        },
      },
    ],
    [expandedRows]
  );

  const table = useReactTable({
    data: benchmarkData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <header className="mb-2">
        <h2 className="text-xs font-extrabold text-[#213c52]">
          Winning Benchmark RPJ Customer Experience
        </h2>
      </header>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-collapse text-left text-xs">
          <colgroup>
            <col style={{ width: "70px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "40px" }} />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-2.5 text-[9px] font-extrabold text-[#213c52] uppercase tracking-wider text-center"
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
                    className="px-2 py-3 text-center text-xs text-slate-700"
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
