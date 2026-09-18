import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import { SectionCard } from "@/app/components/molecules/SectionCard";

const SKELETON_ROWS = 8;

interface DetailIssueColumn {
  key: string;
  title: string;
  dataIndex: string;
  /** Sel bisa diklik untuk membuka popup ticket per region. */
  statusSite?: string;
  width?: number;
  align?: "left" | "center";
}

const COLUMNS: DetailIssueColumn[] = [
  { key: "region", title: "Region", dataIndex: "region_tsel", align: "left", width: 180 },
  { key: "total", title: "Total Ticket Not Clear", dataIndex: "total" },
  { key: "spms", title: "SPMS", dataIndex: "spms", statusSite: "spms" },
  { key: "isr", title: "ISR", dataIndex: "isr", statusSite: "isr" },
  {
    key: "menunggu",
    title: "Menunggu Transportasi",
    dataIndex: "menunggu",
    statusSite: "menunggu",
  },
  { key: "qe", title: "QE", dataIndex: "qe", statusSite: "qe" },
  { key: "tsel", title: "Issue TSEL", dataIndex: "tsel", statusSite: "tsel" },
  {
    key: "warranty",
    title: "Warranty",
    dataIndex: "warranty",
    statusSite: "warranty",
  },
  { key: "comcase", title: "Comcase", dataIndex: "comcase", statusSite: "comcase" },
  { key: "ceragon", title: "Ceragon", dataIndex: "ceragon", statusSite: "ceragon" },
  {
    key: "waiting_cra_crq",
    title: "Waiting CRA / CRQ",
    dataIndex: "waiting_cra_crq",
    statusSite: "waiting_cra",
  },
  {
    key: "issue_dws",
    title: "Issue DWS",
    dataIndex: "issue_dws",
    statusSite: "issue_dws",
  },
  {
    key: "late_response",
    title: "Late Response TIF / Mitra",
    dataIndex: "late_response",
    statusSite: "late_response",
  },
];

const headCell =
  "sticky top-0 z-10 h-12 border-b border-[#e2e8f0] bg-[#eef1f5] px-3 text-xs font-semibold text-[#334155]";
const bodyCell =
  "h-11 border-b border-[#eef2f7] px-3 text-sm whitespace-nowrap text-[#0f172a]";

interface MttrqDetailIssueTableProps {
  rows: Record<string, unknown>[];
  loading?: boolean;
  error?: boolean;
  onCellClick: (region: string, statusSite: string) => void;
}

export function MttrqDetailIssueTable({
  rows,
  loading = false,
  error = false,
  onCellClick,
}: MttrqDetailIssueTableProps) {
  const isEmpty = !loading && !rows.length;

  return (
    <SectionCard className="flex h-full min-w-0 flex-col gap-3 p-4">
      <h2 className="text-base font-semibold text-[#020617]">Detail Issue</h2>

      {isEmpty ? (
        <EmptyState
          title={error ? "Gagal memuat detail issue." : "Data belum tersedia"}
          description={
            error ? undefined : "Tidak ada data untuk filter yang dipilih."
          }
        />
      ) : (
        <div className="overflow-auto rounded-2xl border border-[#e2e8f0]">
          <table
            className="w-full border-collapse text-center"
            style={{ minWidth: 1180 }}
          >
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                    className={`${headCell} ${
                      column.align === "left" ? "text-left" : ""
                    }`}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                    <tr key={`detail-issue-skeleton-${rowIndex}`}>
                      {COLUMNS.map((column) => (
                        <td key={column.key} className={bodyCell}>
                          <Skeleton height={14} />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row, index) => {
                    const region = String(row.region_tsel ?? row.region ?? "");
                    const isNation = region.toLowerCase().includes("nation");

                    return (
                      <tr
                        key={region || index}
                        className={
                          isNation
                            ? "bg-[#f1f5f9] font-semibold"
                            : "transition-colors hover:bg-[#f8fafc]"
                        }
                      >
                        {COLUMNS.map((column) => {
                          const value = row[column.dataIndex];
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
                                    onCellClick(
                                      region,
                                      column.statusSite as string,
                                    )
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
      )}
    </SectionCard>
  );
}

export default MttrqDetailIssueTable;
