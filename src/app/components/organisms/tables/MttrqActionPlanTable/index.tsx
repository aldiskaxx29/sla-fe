import { useMemo } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import { SectionCard } from "@/app/components/molecules/SectionCard";

interface MttrqActionPlanTableProps {
  rows: Record<string, unknown>[];
  loading?: boolean;
  error?: boolean;
}

export function MttrqActionPlanTable({
  rows,
  loading = false,
  error = false,
}: MttrqActionPlanTableProps) {
  const columns = useMemo<DataTableColumn<Record<string, unknown>>[]>(
    () => [
      { key: "no", title: "No", width: 64, render: (_row, index) => index + 1 },
      {
        key: "regional",
        title: "Regional",
        align: "left",
        render: (row) => String(row.regional ?? "-"),
      },
      {
        key: "ticket",
        title: "No Ticket",
        align: "left",
        render: (row) => String(row.ticket ?? "-"),
      },
      {
        key: "grouping",
        title: "Grouping Issue",
        align: "left",
        render: (row) => String(row.grouping ?? "-"),
      },
      {
        key: "detail_progress",
        title: "Detail Progress",
        align: "left",
        render: (row) => String(row.detail_progress ?? "-"),
      },
      {
        key: "latest_update",
        title: "Latest Update Progress",
        align: "left",
        render: (row) => String(row.latest_update ?? "-"),
      },
    ],
    [],
  );

  return (
    <SectionCard className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#020617]">
          Action Plan &amp; Progress
        </h2>
        <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#475569]">
          {rows.length} Ticket
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        minWidth={980}
        maxHeightClassName="max-h-[52vh]"
        rowKey={(row, index) => String(row.ticket ?? index)}
      />
    </SectionCard>
  );
}

export default MttrqActionPlanTable;
