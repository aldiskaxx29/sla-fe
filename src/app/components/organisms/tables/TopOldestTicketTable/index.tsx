import { useMemo } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import { SectionCard } from "@/app/components/molecules/SectionCard";

import type { TopOldestRow } from "@/app/types/resume-rca/resumeRca.types";

interface TopOldestTicketTableProps {
  rows: TopOldestRow[];
  loading?: boolean;
  error?: boolean;
}

export function TopOldestTicketTable({
  rows,
  loading = false,
  error = false,
}: TopOldestTicketTableProps) {
  const columns = useMemo<DataTableColumn<TopOldestRow>[]>(
    () => [
      { key: "no", title: "No", width: 48, render: (_row, index) => index + 1 },
      {
        key: "ticket_id",
        title: "No Ticket",
        align: "left",
        render: (row) => String(row.ticket_id ?? "-"),
      },
      {
        key: "region",
        title: "Region",
        align: "left",
        /** Region dari API berbentuk "01-SUMBAGUT". */
        render: (row) => String(row.region ?? "").split("-")[1] ?? "-",
      },
      {
        key: "rca",
        title: "RCA",
        align: "left",
        render: (row) => String(row.rca ?? "-"),
      },
      {
        key: "ttr",
        title: "TTR",
        width: 80,
        render: (row) => Number(row.ttr ?? 0).toFixed(2),
      },
      {
        key: "last_update",
        title: "Last Update",
        align: "left",
        render: (row) => (
          <span className="block max-w-[220px] truncate">
            {String(row.last_update ?? "-")}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <SectionCard className="flex h-full min-w-0 flex-col gap-3 p-4">
      <h2 className="text-base font-semibold text-[#020617]">
        Top 15 Oldest Ticket
      </h2>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        minWidth={720}
        maxHeightClassName="max-h-[52vh]"
        rowKey={(row, index) => String(row.ticket_id ?? index)}
      />
    </SectionCard>
  );
}

export default TopOldestTicketTable;
