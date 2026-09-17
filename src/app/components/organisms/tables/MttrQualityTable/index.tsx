import { useState } from "react";
import { LuDownload } from "react-icons/lu";
import * as XLSX from "xlsx";

import { Button } from "@/app/components/atoms";

import type {
  DailyMonitoringSummaryView,
  MttrQualityLevel,
  MttrQualityRow,
} from "@/app/types/daily-monitoring/dailyMonitoring.types";

const SKELETON_ROWS = 4;

const COL_WIDTHS = [
  "5%",
  "12%",
  "14%",
  "14%",
  "17%",
  "6%",
  "6%",
  "10%",
  "16%",
];

const headMainCell =
  "dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]";
const headCompactCell =
  "dm-th-compact border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[18px] font-semibold leading-none whitespace-nowrap text-black lg:text-[20px]";
const headSubCell =
  "dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[19px]";
const bodyCell = "border border-[#D8DEE6] px-4 py-3 text-slate-700";

const TRAFFIC_LIGHT_CLASS: Record<MttrQualityLevel, string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-400",
  danger: "bg-rose-500",
};

/** Nilai "96 | 90 | 80" ditampilkan dengan pemisah abu-abu. */
const renderSplitValue = (value: string) =>
  value.split("|").map((part, index, array) => (
    <span key={`${part}-${index}`} className={index === 0 ? "font-medium" : ""}>
      {part.trim()}
      {index < array.length - 1 ? (
        <span className="px-0.5 text-slate-400">|</span>
      ) : null}
    </span>
  ));

interface MttrQualityTableProps {
  rows?: MttrQualityRow[];
  summaryRows?: DailyMonitoringSummaryView["summaryRows"];
  loading?: boolean;
  totalTickets?: number;
}

export function MttrQualityTable({
  rows,
  summaryRows,
  loading = false,
  totalTickets,
}: MttrQualityTableProps) {
  const [exporting, setExporting] = useState(false);

  const tableRows = rows ?? [];

  const exportSummaryRows = async () => {
    if (exporting) return;

    setExporting(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    try {
      const exportRows =
        summaryRows?.map((row, index) => ({
          No: index + 1,
          "Ticket ID": row.ticketId || "-",
          "Region Tsel": row.regionTsel || "-",
          Status: row.status || "-",
          Area: row.area || "-",
          "TTR Customer Decimal": row.ttrCustomerDecimal || "-",
          Network: row.network || "-",
          Sitegroup: row.sitegroup || "-",
          Regtsel: row.regtsel || "-",
        })) ?? [];

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Summary Rows");
      XLSX.writeFile(workbook, "mttrq-summary-rows.xlsx");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#D8DEE6] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8DEE6] px-4 py-3">
        <h2 className="daily-monitoring-section-title font-bold uppercase tracking-wide text-blue-600">
          B. MTTR QUALITY CNOP MERAH
        </h2>

        <Button
          variant="ghost"
          size="sm"
          icon={<LuDownload size={16} />}
          className="daily-monitoring-export-controls text-[#1d4ed8]"
          loading={exporting}
          disabled={!summaryRows?.length}
          onClick={() => {
            void exportSummaryRows();
          }}
        >
          Download Data
        </Button>
      </div>

      <div className="daily-monitoring-table-container">
        <table className="daily-monitoring-table dm-mttrq-table w-full table-fixed border-collapse text-center text-[26px] lg:text-[28px]">
          <colgroup>
            {COL_WIDTHS.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>

          <thead>
            <tr>
              <th rowSpan={2} className={headMainCell}>
                No
              </th>
              <th rowSpan={2} className={headMainCell}>
                Area
              </th>
              <th rowSpan={2} className={headMainCell}>
                Reg
              </th>
              <th rowSpan={2} className={headMainCell}>
                Open | FO | RIP
              </th>
              <th rowSpan={2} className={headCompactCell}>
                Kuning/Merah/&gt;96 Jam
              </th>
              <th colSpan={2} className={headMainCell}>
                Closing Ticket
              </th>
              <th className={headMainCell}>Done</th>
              <th rowSpan={2} className={headMainCell}>
                Ach | TA | PST
              </th>
            </tr>

            <tr>
              <th className={headSubCell}>H-1</th>
              <th className={headSubCell}>H</th>
              <th className={headSubCell}>TA | PST</th>
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                  <tr key={`mttrq-skeleton-${rowIndex}`} className="bg-white">
                    {Array.from({ length: 9 }).map((__, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-[#D8DEE6] px-4 py-3"
                      >
                        <div className="mx-auto h-5 w-full max-w-[120px] animate-pulse rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))
              : tableRows.map((row, index) => {
                  const isTotalRow = row.area === "Total";
                  const rowClass = isTotalRow
                    ? "bg-[#d1d5db] font-bold text-black"
                    : index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50";

                  return (
                    <tr key={`${row.area}-${index}`} className={rowClass}>
                      <td
                        className={`${bodyCell} font-medium`}
                      >
                        {row.no}
                      </td>

                      {isTotalRow ? (
                        <td
                          colSpan={2}
                          className="border border-[#D8DEE6] px-4 py-3 text-center font-bold uppercase text-slate-800"
                        >
                          {row.area}
                        </td>
                      ) : (
                        <>
                          <td className="border border-[#D8DEE6] px-4 py-3 font-semibold text-slate-800">
                            {row.area}
                          </td>
                          <td className={`dm-reg-cell ${bodyCell}`}>
                            {row.reg}
                          </td>
                        </>
                      )}

                      <td className={bodyCell}>{row.openFoRip}</td>
                      <td className={bodyCell}>{row.kuningMerah96Jam}</td>
                      <td className={bodyCell}>{row.closingTicketH1}</td>
                      <td className={bodyCell}>{row.closingTicketH}</td>
                      <td className="border border-[#D8DEE6] px-3 py-2.5 text-slate-700">
                        {row.doneTaPst}
                      </td>
                      <td className="border border-[#D8DEE6] px-4 py-3">
                        <div className="dm-ach-cell flex h-full items-center justify-center">
                          <div className="dm-badge dm-badge-ach inline-flex max-w-full items-center justify-center gap-1 whitespace-nowrap rounded-full px-1 py-2 text-[22px] font-semibold leading-none">
                            <span
                              className={`dm-ach-bullet block aspect-square h-3 w-3 shrink-0 rounded-full ${TRAFFIC_LIGHT_CLASS[row.achLevel]}`}
                            />
                            <span className="dm-ach-value flex items-center whitespace-nowrap">
                              {renderSplitValue(row.achTaPst)}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      <div className="daily-monitoring-notes space-y-2 border-t border-[#D8DEE6] bg-white px-4 py-5 text-4xl leading-[1.5] text-slate-600">
        <p className="font-semibold text-slate-700">Keterangan:</p>
        <p>Kuning: TTR &lt; Threshold</p>
        <p>Merah: TTR &gt; Threshold</p>
        <p>Total Ticket: {totalTickets ?? "-"}</p>
        <p className="mt-2 font-semibold text-slate-700">Sumber Data:</p>
        <p>
          <a
            href="https://qosmo.telkom.co.id/daily-monitoring"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-sky-700 underline"
          >
            MTTRq: https://qosmo.telkom.co.id/daily-monitoring
          </a>
        </p>
      </div>
    </section>
  );
}

export default MttrQualityTable;
