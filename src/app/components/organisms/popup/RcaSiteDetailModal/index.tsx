import { useMemo, useState } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import Modal from "@/app/components/molecules/Modal";
import SearchInput from "@/app/components/molecules/SearchInput";

import type { RcaSiteRow } from "@/app/types/resume-rca/resumeRca.types";

interface RcaSiteDetailModalProps {
  open: boolean;
  title: string;
  rows: RcaSiteRow[];
  loading?: boolean;
  onClose: () => void;
}

export function RcaSiteDetailModal({
  open,
  title,
  rows,
  loading = false,
  onClose,
}: RcaSiteDetailModalProps) {
  const [search, setSearch] = useState("");

  const columns = useMemo<DataTableColumn<RcaSiteRow>[]>(
    () => [
      { key: "no", title: "No", width: 56, render: (_row, index) => index + 1 },
      {
        key: "site_id",
        title: "Site",
        align: "left",
        render: (row) => String(row.site_id ?? "-"),
      },
      {
        key: "region",
        title: "Region",
        align: "left",
        render: (row) => String(row.region ?? "-"),
      },
      {
        key: "witel",
        title: "District",
        align: "left",
        render: (row) => String(row.witel ?? "-"),
      },
      {
        key: "av",
        title: "Packetloss",
        render: (row) => String(row.av ?? "-"),
      },
      { key: "rca", title: "RCA", align: "left", render: (row) => String(row.rca ?? "-") },
      { key: "rc2", title: "RCA 2", align: "left", render: (row) => String(row.rc2 ?? "-") },
      {
        key: "rca2",
        title: "Action Plan",
        align: "left",
        render: (row) => String(row.rca2 ?? "-"),
      },
      {
        key: "status",
        title: "Progress Status",
        render: (row) => {
          const status = String(row.status ?? "-").toUpperCase();
          const tone =
            status === "CLOSED"
              ? "bg-emerald-50 text-emerald-700"
              : status === "OGP"
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-600";

          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}
            >
              {status}
            </span>
          );
        },
      },
    ],
    [],
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
        <h2 className="text-base font-bold text-[#0f172a] sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {filteredRows.length} site ditampilkan
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari Site, Region, RCA, Action Plan..."
          className="w-full max-w-[360px]"
        />

        <DataTable
          columns={columns}
          rows={filteredRows}
          loading={loading}
          minWidth={1040}
          maxHeightClassName="max-h-[64vh]"
          rowKey={(row, index) => String(row.site_id ?? index)}
        />
      </div>
    </Modal>
  );
}

export default RcaSiteDetailModal;
