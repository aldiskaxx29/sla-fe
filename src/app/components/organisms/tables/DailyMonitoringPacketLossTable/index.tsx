import { LuDownload } from "react-icons/lu";

import { Button, Switch } from "@/app/components/atoms";

import type {
  PacketLossLevel,
  PacketLossRow,
  PacketLossSiteScope,
} from "@/app/types/daily-monitoring/dailyMonitoring.types";

const SKELETON_ROWS = 4;

const COL_WIDTHS = [
  "5%",
  "24%",
  "7%",
  "11%",
  "7%",
  "7%",
  "8%",
  "8%",
  "9%",
  "14%",
];

const headMainCell =
  "dm-th-main border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[24px] font-semibold leading-none whitespace-nowrap text-black lg:text-[22px]";
const headSubCell =
  "dm-th-sub border border-[#D8DEE6] bg-gray-400 px-4 py-3 text-[17px] font-medium leading-none whitespace-nowrap text-black lg:text-[20px]";
const bodyCell = "border border-[#D8DEE6] px-4 py-3 text-slate-700";

const TRAFFIC_LIGHT_CLASS: Record<PacketLossLevel, string> = {
  good: "bg-emerald-500",
  warning: "bg-amber-400",
  danger: "bg-rose-500",
};

/** Region dikirim apa adanya, area memakai nomor barisnya. */
const toDetailValue = (row: PacketLossRow) =>
  row.downloadType === "region" ? row.region : row.no;

interface DailyMonitoringPacketLossTableProps {
  rows?: PacketLossRow[];
  section?: string;
  loading?: boolean;
  showSplitToggle?: boolean;
  splitView?: boolean;
  onSplitViewChange?: (checked: boolean) => void;
  onDownload: () => void;
  downloading?: boolean;
  onSiteDetail: (scope: PacketLossSiteScope, value: string) => void;
  /** Nilai baris yang detailnya sedang dimuat, untuk indikator tombol. */
  pendingDetailValue?: string;
}

export function DailyMonitoringPacketLossTable({
  rows,
  section,
  loading = false,
  showSplitToggle = false,
  splitView = false,
  onSplitViewChange,
  onDownload,
  downloading = false,
  onSiteDetail,
  pendingDetailValue,
}: DailyMonitoringPacketLossTableProps) {
  const tableRows = rows ?? [];

  return (
    <section className="rounded-2xl bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8DEE6] px-4 py-3">
        <h2 className="daily-monitoring-section-title font-bold uppercase tracking-wide text-blue-600">
          {section || "A. PL 5% & 1-5%"}
        </h2>

        <div className="daily-monitoring-export-controls flex flex-wrap items-center gap-3">
          {showSplitToggle ? (
            <Switch
              checked={splitView}
              onChange={(checked) => onSplitViewChange?.(checked)}
              label="Split Table"
            />
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            icon={<LuDownload size={16} />}
            loading={downloading}
            onClick={onDownload}
            className="text-[#1d4ed8]"
          >
            Download Data
          </Button>
        </div>
      </div>

      <div className="daily-monitoring-table-container">
        <table className="daily-monitoring-table w-full table-fixed border-collapse text-center text-[26px] lg:text-[28px]">
          <colgroup>
            {COL_WIDTHS.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>

          <thead className="text-black">
            <tr>
              <th rowSpan={2} className={headMainCell}>
                No
              </th>
              <th rowSpan={2} className={headMainCell}>
                Region
              </th>
              <th rowSpan={2} className={headMainCell}>
                Target
              </th>
              <th rowSpan={2} className={headMainCell}>
                Site Degrade
              </th>
              <th colSpan={3} className={headMainCell}>
                CLEAR
              </th>
              <th rowSpan={2} className={headMainCell}>
                Not Clear
              </th>
              <th rowSpan={2} className={headMainCell}>
                Ach
              </th>
              <th rowSpan={2} className={headMainCell}>
                Remark
              </th>
            </tr>

            <tr>
              <th className={headSubCell}>H-1</th>
              <th className={headSubCell}>H</th>
              <th className={headSubCell}>Growth</th>
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                  <tr
                    key={`packetloss-skeleton-${rowIndex}`}
                    className="bg-white"
                  >
                    {Array.from({ length: 10 }).map((__, cellIndex) => (
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
                  if (row.isSpacerRow) {
                    return (
                      <tr key={`spacer-${index}`} className="bg-white">
                        <td colSpan={10} className="border-0 px-0 py-3" />
                      </tr>
                    );
                  }

                  const rowClass = row.isTotalRow
                    ? "bg-[#d1d5db] font-bold text-black"
                    : index % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50";

                  const detailValue = toDetailValue(row);
                  const detailable =
                    Boolean(row.downloadType) &&
                    row.downloadType !== "total" &&
                    !row.isTotalRow;

                  return (
                    <tr key={`${row.region}-${index}`} className={rowClass}>
                      <td className={`${bodyCell} font-medium`}>{row.no}</td>

                      <td
                        className={`border border-[#D8DEE6] px-4 py-3 text-slate-800 ${
                          row.isTotalRow
                            ? "text-center uppercase"
                            : row.downloadType === "area"
                              ? "text-left font-semibold"
                              : "text-left font-normal"
                        }`}
                      >
                        {row.region}
                      </td>

                      <td className={bodyCell}>{row.target}</td>
                      <td className={bodyCell}>{row.siteDegradeH1}</td>
                      <td className={bodyCell}>{row.siteDegradeH}</td>
                      <td className={bodyCell}>{row.clear}</td>
                      <td className={bodyCell}>{row.growth}</td>

                      <td className="border border-[#D8DEE6] px-3 py-2.5 text-slate-700">
                        {detailable ? (
                          <button
                            type="button"
                            className={`daily-monitoring-not-clear-button cursor-pointer p-0 text-inherit hover:text-blue-600 ${
                              pendingDetailValue === detailValue
                                ? "opacity-60"
                                : ""
                            }`}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              onSiteDetail(
                                row.downloadType as PacketLossSiteScope,
                                detailValue,
                              );
                            }}
                          >
                            {row.notClear}
                          </button>
                        ) : (
                          row.notClear
                        )}
                      </td>

                      <td className="border border-[#D8DEE6] px-4 py-3">
                        <div className="dm-pl-ach-cell flex h-full items-center justify-center">
                          <span
                            className={`dm-badge dm-pl-ach-badge inline-flex min-w-[104px] items-center justify-center rounded-full px-3.5 py-2 leading-none ${
                              row.downloadType === "area" || row.isTotalRow
                                ? "font-semibold"
                                : "font-normal"
                            }`}
                          >
                            <span
                              className={`mr-2 block aspect-square h-4 w-4 shrink-0 rounded-full ${TRAFFIC_LIGHT_CLASS[row.achLevel]}`}
                            />
                            {row.ach}
                          </span>
                        </div>
                      </td>

                      <td className="border border-[#D8DEE6] px-4 py-3 text-left text-slate-700">
                        {row.remark || "-"}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      <div className="daily-monitoring-notes space-y-2 border-t border-[#D8DEE6] bg-white px-4 py-5 text-4xl leading-[1.5] text-slate-600">
        <p className="font-semibold text-slate-700">
          *Pembaruan Data Weekly Setiap Hari Kamis
        </p>
        <p className="font-semibold text-slate-700">Sumber Data:</p>
        <p>
          <a
            href="https://qosmo.telkom.co.id/daily-monitoring"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-sky-700 underline"
          >
            Packet Loss: https://qosmo.telkom.co.id/daily-monitoring
          </a>
        </p>
      </div>
    </section>
  );
}

export default DailyMonitoringPacketLossTable;
