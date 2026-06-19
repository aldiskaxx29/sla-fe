import type { MttrQualityRow } from "../types";
import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import * as XLSX from "xlsx";

// const achToneClass: Record<MttrQualityLevel, string> = {
//   good: "bg-emerald-600/20 border-[1px] border-emerald-600/30 text-emerald-600",
//   warning: "bg-amber-500/20 border-[1px] border-amber-500/30 text-amber-500",
//   danger: "bg-rose-600/20 border-[1px] border-rose-600/30 text-rose-600",
// };

const renderSplitValue = (value: string) =>
  value.split("|").map((part, index, array) => (
    <span key={`${part}-${index}`} className={index === 0 ? "font-medium" : ""}>
      {part.trim()}
      {index < array.length - 1 ? (
        <span className="px-1 text-slate-400">|</span>
      ) : null}
    </span>
  ));

const getTrafficLightClass = (level: "good" | "warning" | "danger") => {
  switch (level) {
    case "good":
      return "bg-emerald-500";
    case "warning":
      return "bg-amber-400";
    default:
      return "bg-rose-500";
  }
};

type MttrQualityTableProps = {
  rows?: MttrQualityRow[];
  summaryRows?: Array<{
    ticketId: string;
    regionTsel: string;
    status: string;
    area: string;
    ttrCustomerDecimal: string;
    network: string;
    sitegroup: string;
    regtsel: string;
    statusPersen: string;
  }>;
  isLoading?: boolean;
  totalTickets?: number;
};

const MttrQualityTable = ({
  rows,
  summaryRows,
  isLoading,
  totalTickets,
}: MttrQualityTableProps) => {
  const colWidths = [
    "5%",
    "12%",
    "14%",
    "14%",
    "17%",
    "8%",
    "8%",
    "10%",
    "12%",
  ];
  const tableRows = rows ?? [];
  const skeletonRows = Array.from({ length: 4 }, (_, index) => index);
  const [exporting, setExporting] = useState(false);

  const nextFrame = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

  const exportSummaryRows = async () => {
    if (exporting) return;

    setExporting(true);
    await nextFrame();

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
      <div className="border-b border-[#D8DEE6] px-4 py-3 flex items-center">
        <h2 className="daily-monitoring-section-title font-bold uppercase tracking-wide text-blue-600">
          B. MTTR QUALITY CNOP MERAH
        </h2>
        <Button
          type="link"
          icon={<DownloadOutlined />}
          className="ms-auto"
          loading={exporting}
          onClick={() => {
            void exportSummaryRows();
          }}
          disabled={!summaryRows?.length}
        >
          Download Data
        </Button>
      </div>

      <div>
        <table className="daily-monitoring-table w-full border-collapse table-fixed text-center text-[26px] lg:text-[28px]">
          <colgroup>
            {colWidths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                No
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Area
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Reg
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Open | FO | RIP
              </th>
              <th
                rowSpan={2}
                className="dm-th-compact border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[18px] font-semibold leading-none whitespace-nowrap text-black lg:text-[20px] "
              >
                Kuning/Merah/&gt;96 Jam
              </th>
              <th
                colSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Closing Ticket
              </th>
              <th className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]">
                Done
              </th>
              <th
                rowSpan={2}
                className="dm-th-main border border-[#D8DEE6] bg-gray-400 px-3 py-2.5 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[24px]"
              >
                Ach | TA | PST
              </th>
            </tr>
            <tr>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[19px]">
                H-1
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[19px]">
                H
              </th>
              <th className="dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[19px]">
                TA | PST
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? skeletonRows.map((index) => (
                    <tr key={`mttrq-skeleton-${index}`} className="bg-white">
                    {Array.from({ length: 9 }, (_, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-[#D8DEE6] px-4 py-3"
                      >
                        <div className="mx-auto h-5 w-full max-w-[120px] animate-pulse rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))
              : tableRows.length > 0
                ? tableRows.map((row, index) => {
                    const isTotalRow = row.area === "Total";
                    const rowClass = isTotalRow
                      ? "bg-[#d1d5db] font-bold text-black"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50";

                    return (
                      <tr key={index} className={rowClass}>
                        <td className="border border-[#D8DEE6] px-4 py-3 font-medium text-slate-700">
                          {row.no}
                        </td>

                        {isTotalRow ? (
                          <td
                            colSpan={2}
                            className="border border-[#D8DEE6] px-4 py-3 font-bold uppercase text-center text-slate-800"
                          >
                            {row.area}
                          </td>
                        ) : (
                          <>
                            <td className="border border-[#D8DEE6] px-4 py-3 font-semibold text-slate-800">
                              {row.area}
                            </td>
                            <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                              {row.reg}
                            </td>
                          </>
                        )}

                        <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                          {row.openFoRip}
                        </td>
                        <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                          {row.kuningMerah96Jam}
                        </td>
                        <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                          {row.closingTicketH1}
                        </td>
                        <td className="border border-[#D8DEE6] px-4 py-3 text-slate-700">
                          {row.closingTicketH}
                        </td>
                        <td className="border border-[#D8DEE6] px-3 py-2.5 text-slate-700">
                          {row.doneTaPst}
                        </td>
                        <td className="border border-[#D8DEE6] px-4 py-3">
                          <div className="flex h-full items-center justify-center">
                            <div className="dm-badge inline-flex items-center gap-3 rounded-full px-4 py-2 text-[22px] font-semibold leading-none">
                              <span
                                className={`block aspect-square h-4 w-4 shrink-0 rounded-full ${getTrafficLightClass(row.achLevel)}`}
                              ></span>
                              <span className="flex items-center">
                                {renderSplitValue(row.achTaPst)}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : null}
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
};

export default MttrQualityTable;
