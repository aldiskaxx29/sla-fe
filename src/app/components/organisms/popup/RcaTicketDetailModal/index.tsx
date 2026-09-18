import { useMemo } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import Modal from "@/app/components/molecules/Modal";

import type { RcaTicketRow } from "@/app/types/resume-rca/resumeRca.types";

interface RcaTicketDetailModalProps {
  open: boolean;
  title: string;
  rows: RcaTicketRow[];
  loading?: boolean;
  error?: boolean;
  onClose: () => void;
}

export function RcaTicketDetailModal({
  open,
  title,
  rows,
  loading = false,
  error = false,
  onClose,
}: RcaTicketDetailModalProps) {
  const columns = useMemo<DataTableColumn<RcaTicketRow>[]>(
    () => [
      { key: "no", title: "No", width: 56, render: (_row, index) => index + 1 },
      {
        key: "ticket_id",
        title: "Ticket ID",
        align: "left",
        render: (row) => String(row.ticket_id ?? "-"),
      },
      {
        key: "region",
        title: "Regional",
        align: "left",
        render: (row) => String(row.region ?? "-"),
      },
      {
        key: "treshold",
        title: "Treshold",
        render: (row) => String(row.treshold ?? "-"),
      },
      {
        key: "ttr",
        title: "TTR",
        render: (row) => Number(row.ttr ?? 0).toFixed(2),
      },
    ],
    [],
  );

  return (
    <Modal open={open} onClose={onClose} width={900} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-base font-bold text-[#0f172a] sm:text-xl">{title}</h2>
      </header>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        minWidth={720}
        maxHeightClassName="max-h-[64vh]"
        rowKey={(row, index) => String(row.ticket_id ?? index)}
      />
    </Modal>
  );
}

export default RcaTicketDetailModal;
