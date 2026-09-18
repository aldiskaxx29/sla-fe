import { useMemo, useState } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import Modal from "@/app/components/molecules/Modal";
import SearchInput from "@/app/components/molecules/SearchInput";

import type { ReportSiteDetailRow } from "@/app/types/site/reportSite.types";

/** Kolom dinamis mengikuti parameter yang sedang dipilih. */
const toDynamicKey = (parameter: string) => {
  if (parameter.includes("packetloss")) return "packetloss";
  if (parameter.includes("jitter")) return "jitter";
  if (parameter.includes("latency")) return "latency";
  return "";
};

const toDynamicTitle = (parameter: string) => {
  if (parameter.includes("packetloss")) return "Packetloss";
  if (parameter.includes("jitter")) return "Jitter";
  if (parameter.includes("latency")) return "Latency";
  return "";
};

interface ReportSiteDetailModalProps {
  open: boolean;
  parameter: string;
  region?: string;
  statusSite?: string;
  rows: ReportSiteDetailRow[];
  loading?: boolean;
  error?: boolean;
  onClose: () => void;
}

export function ReportSiteDetailModal({
  open,
  parameter,
  region,
  statusSite,
  rows,
  loading = false,
  error = false,
  onClose,
}: ReportSiteDetailModalProps) {
  const [search, setSearch] = useState("");

  const dynamicKey = toDynamicKey(parameter);
  const dynamicTitle = toDynamicTitle(parameter);

  const columns = useMemo<DataTableColumn<ReportSiteDetailRow>[]>(
    () => [
      {
        key: "no",
        title: "No",
        width: 64,
        render: (_row, index) => index + 1,
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
        key: "witel",
        title: "Witel",
        align: "left",
        render: (row) => String(row.witel ?? "-"),
      },
      {
        key: `${dynamicKey}_status`,
        title: `${dynamicTitle} Status`,
        render: (row) => String(row[`${dynamicKey}_status`] ?? "-"),
      },
      {
        key: dynamicKey,
        title: dynamicTitle,
        render: (row) => String(row[dynamicKey] ?? "-"),
      },
    ],
    [dynamicKey, dynamicTitle],
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rows;

    return rows.filter((row) =>
      Object.values(row).some((cell) =>
        String(cell ?? "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [rows, search]);

  return (
    <Modal open={open} onClose={onClose} width={1160} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-base font-bold text-[#0f172a] sm:text-xl">
          Detail Site{region ? ` - ${region}` : ""}
        </h2>
        {statusSite ? (
          <p className="mt-1 text-sm text-slate-500">
            Status: <span className="font-medium uppercase">{statusSite}</span>
          </p>
        ) : null}
      </header>

      <div className="flex flex-col gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari Site ID, Regional, Witel..."
          className="w-full max-w-[360px]"
        />

        <DataTable
          columns={columns}
          rows={filteredRows}
          loading={loading}
          error={error}
          minWidth={880}
          maxHeightClassName="max-h-[68vh]"
          rowKey={(row, index) => String(row.site_id ?? index)}
        />
      </div>
    </Modal>
  );
}

export default ReportSiteDetailModal;
