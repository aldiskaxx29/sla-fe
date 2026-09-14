import { useMemo } from "react";

import { Skeleton } from "@/app/components/atoms";

import ColumnFilterPopover from "@/app/components/molecules/ColumnFilterPopover";
import ColumnSearchPopover from "@/app/components/molecules/ColumnSearchPopover";
import Pagination from "@/app/components/molecules/Pagination";

import { formatTableValue } from "@/app/utils/table.utils";

import { buildAccessColumns, buildMttrqColumns } from "./columns";

import type { TableColumn } from "@/app/types/table.types";
import type {
  ColumnSearch,
  RekonsiliasiFilterOptions,
  RekonsiliasiRow,
  TablePagination,
} from "@/app/types/reconsiliation/rekonsiliasi.types";

const SKELETON_ROW_COUNT = 10;

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

interface RekonsiliasiTableProps {
  rows: RekonsiliasiRow[];
  isLoading: boolean;
  parameter: string;
  week: string;
  pagination: TablePagination;
  columnFilters: Record<string, string[]>;
  columnSearch: ColumnSearch | null;
  filterOptions?: RekonsiliasiFilterOptions;
  onFilterChange: (field: string, values: string[]) => void;
  onSearchChange: (field: string, value: string) => void;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (row: RekonsiliasiRow) => void;
}

const RekonsiliasiTable = ({
  rows,
  isLoading,
  parameter,
  week,
  pagination,
  columnFilters,
  columnSearch,
  filterOptions,
  onFilterChange,
  onSearchChange,
  onPageChange,
  onEdit,
}: RekonsiliasiTableProps) => {
  const columns = useMemo<TableColumn<RekonsiliasiRow>[]>(() => {
    const params = {
      parameter,
      week,
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      filterOptions,
      onEdit,
    };

    return parameter.includes("mttrq")
      ? buildMttrqColumns(params)
      : buildAccessColumns(params);
  }, [parameter, week, pagination, filterOptions, onEdit]);

  const showSkeleton = isLoading;

  const renderFilter = (column: TableColumn<RekonsiliasiRow>) => {
    if (!column.filter) return null;

    if (column.filter.type === "checkbox") {
      return (
        <ColumnFilterPopover
          options={column.filter.options}
          value={columnFilters[column.filter.field] ?? []}
          onApply={(values) => onFilterChange(column.filter!.field, values)}
        />
      );
    }

    return (
      <ColumnSearchPopover
        label={column.title}
        value={
          columnSearch?.field === column.filter.field ? columnSearch.value : ""
        }
        onApply={(value) => onSearchChange(column.filter!.field, value)}
      />
    );
  };

  const cellClass = (column: TableColumn<RekonsiliasiRow>) =>
    [
      "border-b border-r border-[#F0F0F0] px-3 py-2 text-sm leading-snug last:border-r-0",
      ALIGN_CLASS[column.align ?? "left"],
      column.wrap ? "whitespace-normal break-words" : "truncate",
      column.fixedRight
        ? "sticky right-0 z-10 bg-white shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.12)]"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="mt-1">
      <div className="w-full overflow-x-auto rounded-xl border border-[#F0F0F0]">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width ?? 150 }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width ?? 150 }}
                  className={[
                    "whitespace-nowrap border-b border-r border-[#F0F0F0] bg-blue-pacific px-3 py-3.5 text-sm font-bold text-[#0E2133] last:border-r-0",
                    ALIGN_CLASS[column.align ?? "left"],
                    column.fixedRight ? "sticky right-0 z-20" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="inline-flex items-center gap-1">
                    <span>{column.title}</span>
                    {renderFilter(column)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {showSkeleton
              ? Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`${cellClass(column)} !py-3`}
                      >
                        <Skeleton height={25} />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row, rowIndex) => (
                  <tr
                    key={String(
                      row.id ?? row.site_id ?? row.ticket_id ?? rowIndex,
                    )}
                    className="odd:bg-white  even:bg-[#FAFAFA] hover:bg-[#EDFFFD]"
                  >
                    {columns.map((column) => {
                      const value = column.dataIndex
                        ? row[column.dataIndex]
                        : undefined;

                      return (
                        <td
                          key={column.key}
                          className={cellClass(column)}
                          title={
                            column.wrap || !column.dataIndex
                              ? undefined
                              : String(formatTableValue(value))
                          }
                        >
                          {column.render
                            ? column.render(value, row, rowIndex)
                            : formatTableValue(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

            {!showSkeleton && !rows.length ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-sm text-gray-400"
                >
                  Tidak ada data
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={onPageChange}
      />
    </div>
  );
};

export default RekonsiliasiTable;
