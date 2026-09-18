import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { ReportSiteProfilingRow } from "@/app/types/site/reportSite.types";

const SKELETON_ROWS = 10;

interface LeafColumn {
  key: string;
  title: string;
  dataIndex: string;
  statusSite?: string;
  width?: number;
  align?: "left" | "center";
  headClassName: string;
}

interface GroupColumn {
  key: string;
  title: string;
  headClassName: string;
  children: LeafColumn[];
}

type ProfilingColumn = LeafColumn | GroupColumn;

const isGroup = (column: ProfilingColumn): column is GroupColumn =>
  "children" in column;

const HEAD_IDENTITY = "bg-[#e8effb] text-[#1f3d70]";
const HEAD_TOTAL = "bg-[#eef1f5] text-[#334155]";
const HEAD_CLEAR = "bg-[#dcf5e7] text-[#116b43]";
const HEAD_WARNING = "bg-[#fdf0d5] text-[#8a5a06]";
const HEAD_SOS = "bg-[#fbdede] text-[#992b2b]";
const HEAD_BLACKLIST = "bg-[#0f172a] text-white";

const COLUMNS: ProfilingColumn[] = [
  {
    key: "no",
    title: "No",
    dataIndex: "no",
    width: 64,
    align: "left",
    headClassName: HEAD_IDENTITY,
  },
  {
    key: "regional",
    title: "Regional",
    dataIndex: "region_tsel",
    align: "left",
    headClassName: HEAD_IDENTITY,
  },
  {
    key: "total",
    title: "Total Site",
    dataIndex: "total",
    width: 120,
    headClassName: HEAD_TOTAL,
  },
  {
    key: "clear",
    title: "Clear",
    dataIndex: "clear",
    statusSite: "clear",
    headClassName: HEAD_CLEAR,
  },
  {
    key: "preventive",
    title: "Preventive",
    dataIndex: "preventive",
    statusSite: "preventive",
    headClassName: HEAD_WARNING,
  },
  {
    key: "quality",
    title: "Quality",
    dataIndex: "quality",
    statusSite: "quality",
    headClassName: HEAD_WARNING,
  },
  {
    key: "sos",
    title: "SOS",
    headClassName: HEAD_SOS,
    children: [
      {
        key: "sos_capacity",
        title: "Capacity",
        dataIndex: "sos_capacity",
        statusSite: "sos_capacity",
        headClassName: HEAD_SOS,
      },
      {
        key: "sos_waranty",
        title: "Warranty",
        dataIndex: "sos_waranty",
        statusSite: "sos_waranty",
        headClassName: HEAD_SOS,
      },
      {
        key: "sos_power",
        title: "Power",
        dataIndex: "sos_power",
        statusSite: "sos_power",
        headClassName: HEAD_SOS,
      },
      {
        key: "sos_qual_tsel",
        title: "Qual TSEL",
        dataIndex: "sos_qual_tsel",
        statusSite: "sos_qual_tsel",
        headClassName: HEAD_SOS,
      },
      {
        key: "sos_qe",
        title: "QE",
        dataIndex: "sos_qe",
        statusSite: "sos_qe",
        headClassName: HEAD_SOS,
      },
      {
        key: "sos_others",
        title: "Others",
        dataIndex: "sos",
        statusSite: "sos",
        headClassName: HEAD_SOS,
      },
    ],
  },
  {
    key: "blacklist",
    title: "Blacklist",
    dataIndex: "blacklist",
    statusSite: "blacklist",
    headClassName: HEAD_BLACKLIST,
  },
];

const LEAF_COLUMNS = COLUMNS.flatMap((column) =>
  isGroup(column) ? column.children : [column],
);

const headCell =
  "h-11 border-b border-[#e2e8f0] px-3 text-xs font-semibold whitespace-nowrap";
const bodyCell =
  "h-11 border-b border-[#eef2f7] px-3 text-sm whitespace-nowrap text-[#0f172a]";

const isNationRow = (row: ReportSiteProfilingRow) =>
  String(row.region_tsel ?? "")
    .toLowerCase()
    .includes("nation");

interface ReportSiteProfilingTableProps {
  rows: ReportSiteProfilingRow[];
  loading?: boolean;
  error?: boolean;
  onCellClick: (row: ReportSiteProfilingRow, statusSite: string) => void;
}

export function ReportSiteProfilingTable({
  rows,
  loading = false,
  error = false,
  onCellClick,
}: ReportSiteProfilingTableProps) {
  if (!loading && !rows.length) {
    return (
      <EmptyState
        title={
          error ? "Gagal memuat data profiling site." : "Data belum tersedia"
        }
        description={
          error ? undefined : "Tidak ada data untuk filter yang dipilih."
        }
      />
    );
  }

  return (
    <div className="overflow-auto rounded-2xl border border-[#e2e8f0]">
      <table
        className="w-full border-collapse text-center"
        style={{ minWidth: 1080 }}
      >
        <thead className="sticky top-0 z-10">
          <tr>
            {COLUMNS.map((column) =>
              isGroup(column) ? (
                <th
                  key={column.key}
                  colSpan={column.children.length}
                  className={`${headCell} ${column.headClassName}`}
                >
                  {column.title}
                </th>
              ) : (
                <th
                  key={column.key}
                  rowSpan={2}
                  style={column.width ? { width: column.width } : undefined}
                  className={`${headCell} ${column.headClassName} ${
                    column.align === "left" ? "text-left" : ""
                  }`}
                >
                  {column.title}
                </th>
              ),
            )}
          </tr>
          <tr>
            {COLUMNS.filter(isGroup).flatMap((column) =>
              column.children.map((child) => (
                <th
                  key={child.key}
                  className={`${headCell} ${child.headClassName} font-medium`}
                >
                  {child.title}
                </th>
              )),
            )}
          </tr>
        </thead>

        <tbody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <tr key={`profiling-skeleton-${rowIndex}`}>
                  {LEAF_COLUMNS.map((column) => (
                    <td key={column.key} className={bodyCell}>
                      <Skeleton height={14} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, index) => {
                const nation = isNationRow(row);

                return (
                  <tr
                    key={String(row.region_tsel ?? index)}
                    className={
                      nation
                        ? "bg-[#f1f5f9] font-semibold"
                        : "transition-colors hover:bg-[#f8fafc]"
                    }
                  >
                    {LEAF_COLUMNS.map((column) => {
                      const value =
                        column.dataIndex === "no"
                          ? nation
                            ? ""
                            : index + 1
                          : row[column.dataIndex];
                      const text =
                        value === null || value === undefined
                          ? "-"
                          : String(value);

                      return (
                        <td
                          key={column.key}
                          className={`${bodyCell} ${
                            column.align === "left" ? "text-left" : ""
                          }`}
                        >
                          {column.statusSite ? (
                            <button
                              type="button"
                              onClick={() =>
                                onCellClick(row, column.statusSite as string)
                              }
                              className="cursor-pointer font-semibold text-[#4338ca] hover:underline"
                            >
                              {text}
                            </button>
                          ) : (
                            text
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}

export default ReportSiteProfilingTable;
