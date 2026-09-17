import { useMemo } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import Modal from "@/app/components/molecules/Modal";

import type { MsaRow, MsaWeeklyDetailParams } from "@/app/types/msa/msa.types";
import {
  formatParameterText,
  formatWeekMonthLabel,
  isMttrqParameter,
} from "@/app/utils/msa.utils";

const textCell = (key: string): DataTableColumn<MsaRow> => ({
  key,
  title: key,
  render: (row) => String(row[key] ?? "-"),
});

/** KPI MTTRQ memakai data tiket, KPI lain memakai data site packetloss. */
const MTTRQ_COLUMNS: DataTableColumn<MsaRow>[] = [
  { ...textCell("month"), title: "Month" },
  { ...textCell("ticket_id"), title: "No Ticket" },
  { ...textCell("site_id"), title: "Site Id" },
  { ...textCell("final_severity"), title: "Final Severity" },
  { ...textCell("witel"), title: "Witel" },
  { ...textCell("treshold"), title: "Treshold" },
  { ...textCell("ttr_customer_jam"), title: "TTR Awal" },
  { ...textCell("ttr_selisih"), title: "TTR Selisih" },
  { ...textCell("ttr_final"), title: "TTR Final" },
  { ...textCell("ket_recon"), title: "Ket Recon" },
];

const DEFAULT_COLUMNS: DataTableColumn<MsaRow>[] = [
  { ...textCell("week"), title: "Week" },
  { ...textCell("region_tsel"), title: "Region" },
  { ...textCell("area"), title: "Area" },
  { ...textCell("site_id"), title: "Site ID" },
  { ...textCell("packetloss_status"), title: "PL Status" },
  { ...textCell("distribution_pl"), title: "DIST PL" },
  { ...textCell("value"), title: "Value" },
  { ...textCell("grouping_rca"), title: "Group RCA" },
  { ...textCell("detail_rca"), title: "Detail RCA" },
  { ...textCell("update_progress_packetloss"), title: "Update Progres" },
  { ...textCell("last_update_packetloss_cnq"), title: "Last Update" },
  { ...textCell("user_update_packetloss_cnq"), title: "User Update" },
];

interface MsaWeeklyDetailModalProps {
  open: boolean;
  detail: MsaWeeklyDetailParams | null;
  rows: MsaRow[];
  loading?: boolean;
  error?: boolean;
  onClose: () => void;
}

export function MsaWeeklyDetailModal({
  open,
  detail,
  rows,
  loading = false,
  error = false,
  onClose,
}: MsaWeeklyDetailModalProps) {
  const columns = useMemo(() => {
    const base = isMttrqParameter(detail?.kpi)
      ? MTTRQ_COLUMNS
      : DEFAULT_COLUMNS;

    return [
      {
        key: "no",
        title: "No.",
        width: 60,
        render: (_row: MsaRow, index: number) => index + 1,
      },
      ...base,
    ];
  }, [detail?.kpi]);

  return (
    <Modal open={open} onClose={onClose} width={1000} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          Detail {formatWeekMonthLabel(detail?.week)}{" "}
          {formatParameterText(detail?.kpi)}
        </h2>
      </header>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        minWidth={1200}
        maxHeightClassName="max-h-[65vh]"
        rowKey={(row, index) => String(row.site_id ?? row.ticket_id ?? index)}
      />
    </Modal>
  );
}
