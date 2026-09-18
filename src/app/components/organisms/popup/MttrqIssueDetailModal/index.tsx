import { useMemo } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import Modal from "@/app/components/molecules/Modal";

import type { MttrqIssueDetailRow } from "@/app/types/site/reportSite.types";

interface MttrqIssueDetailModalProps {
  open: boolean;
  title: string;
  rows: MttrqIssueDetailRow[];
  loading?: boolean;
  error?: boolean;
  onClose: () => void;
}

export function MttrqIssueDetailModal({
  open,
  title,
  rows,
  loading = false,
  error = false,
  onClose,
}: MttrqIssueDetailModalProps) {
  const columns = useMemo<DataTableColumn<MttrqIssueDetailRow>[]>(
    () => [
      { key: "no", title: "No", width: 64, render: (_row, index) => index + 1 },
      {
        key: "ticket_no",
        title: "Ticket No",
        align: "left",
        render: (row) => String(row.ticket_no ?? "-"),
      },
      {
        key: "site_id",
        title: "Site ID",
        align: "left",
        render: (row) => String(row.site_id ?? "-"),
      },
      {
        key: "region_tsel",
        title: "Regional",
        align: "left",
        render: (row) => String(row.region_tsel ?? "-"),
      },
      {
        key: "status",
        title: "Status",
        align: "left",
        render: (row) => String(row.status ?? "-"),
      },
      {
        key: "detail",
        title: "Detail",
        align: "left",
        render: (row) => String(row.detail ?? "-"),
      },
      {
        key: "latest_update",
        title: "Latest Update",
        align: "left",
        render: (row) => String(row.latest_update ?? "-"),
      },
    ],
    [],
  );

  return (
    <Modal open={open} onClose={onClose} width={1040} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-base font-bold text-[#0f172a] sm:text-xl">
          {title || "Detail Issue"}
        </h2>
      </header>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        minWidth={920}
        maxHeightClassName="max-h-[68vh]"
        rowKey={(row, index) => String(row.ticket_no ?? index)}
      />
    </Modal>
  );
}

export default MttrqIssueDetailModal;
