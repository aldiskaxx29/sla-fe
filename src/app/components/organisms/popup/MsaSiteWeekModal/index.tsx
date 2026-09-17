import { useMemo, useState } from "react";

import DataTable from "@/app/components/molecules/DataTable";
import type { DataTableColumn } from "@/app/components/molecules/DataTable";
import Modal from "@/app/components/molecules/Modal";
import Pagination from "@/app/components/molecules/Pagination";

import type { MsaRow, MsaSiteWeekParams } from "@/app/types/msa/msa.types";

const DEFAULT_PAGE_SIZE = 20;

interface MsaSiteWeekModalProps {
  open: boolean;
  params: MsaSiteWeekParams | null;
  rows: MsaRow[];
  loading?: boolean;
  error?: boolean;
  onClose: () => void;
}

/** Detail site yang belum clear pada satu minggu tertentu. */
export function MsaSiteWeekModal({
  open,
  params,
  rows,
  loading = false,
  error = false,
  onClose,
}: MsaSiteWeekModalProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize, rows],
  );

  const columns = useMemo<DataTableColumn<MsaRow>[]>(
    () => [
      {
        key: "no",
        title: "No.",
        width: 60,
        render: (_row, index) => (page - 1) * pageSize + index + 1,
      },
      { key: "site_id", title: "Site ID" },
      { key: "region", title: "Region" },
      { key: "area", title: "Area" },
      { key: "year", title: "Year" },
      { key: "week", title: "Week" },
      {
        key: "value",
        title: "Value",
        render: (row) =>
          typeof row.value === "number"
            ? row.value.toFixed(4)
            : String(row.value ?? "-"),
      },
      { key: "group_rca", title: "Group RCA" },
      {
        key: "detail_rca",
        title: "Detail RCA",
        width: 300,
        align: "left",
        render: (row) => (
          <span className="block max-w-xs text-xs whitespace-pre-line">
            {String(row.detail_rca ?? "-")}
          </span>
        ),
      },
      { key: "update_progress", title: "Update Progress" },
      { key: "user_update", title: "User Update" },
      { key: "last_update", title: "Last Update" },
    ],
    [page, pageSize],
  );

  const handleClose = () => {
    setPage(1);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} width={1200} bodyClassName="p-6">
      <header className="mb-4 flex flex-wrap items-center gap-2 pr-8">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          Detail Site {params?.type ? params.type.toUpperCase() : ""} · Week{" "}
          {params?.week ?? "-"}
        </h2>

        {params?.status ? (
          <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#2563eb] uppercase">
            {params.status}
          </span>
        ) : null}
      </header>

      <DataTable
        columns={columns}
        rows={pageRows}
        loading={loading}
        error={error}
        minWidth={1600}
        maxHeightClassName="max-h-[60vh]"
        skeletonRows={20}
        rowKey={(row, index) =>
          `${row.site_id ?? index}-${row.week ?? ""}-${row.year ?? ""}`
        }
      />

      {!loading && rows.length ? (
        <div className="mt-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={rows.length}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        </div>
      ) : null}
    </Modal>
  );
}
