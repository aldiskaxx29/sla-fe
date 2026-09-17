import { Fragment, useMemo } from "react";
import { LuChevronRight } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { MsaRow } from "@/app/types/msa/msa.types";
import { formatMsaNumber } from "@/app/utils/msa.utils";
import {
  isPacketlossRanToCore,
  isSummaryRow,
} from "@/app/utils/msaColumns.utils";

const SKELETON_ROWS = 8;

const QUARTERS: Array<{ label: string; months: number[] }> = [
  { label: "Q1", months: [1, 2, 3] },
  { label: "Q2", months: [4, 5, 6] },
  { label: "Q3", months: [7, 8, 9] },
  { label: "Q4", months: [10, 11, 12] },
];

const MONTH_LABELS: Record<number, string> = {
  1: "Januari",
  2: "Februari",
  3: "Maret",
  4: "April",
  5: "Mei",
  6: "Juni",
  7: "Juli",
  8: "Agustus",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Desember",
};

const headCell =
  "h-10 border-b border-r border-[#e2e8f0] bg-[#eef6ff] px-3 text-xs font-semibold whitespace-nowrap text-[#0f172a]";
const groupHeadCell =
  "h-9 border-b border-r border-[#e2e8f0] bg-[#dbe7f5] px-3 text-center text-xs font-bold whitespace-nowrap text-[#0f172a]";
const bodyCell =
  "h-10 border-b border-r border-[#e2e8f0] px-3 text-sm whitespace-nowrap";

interface FlatRow {
  row: MsaRow;
  key: string;
  depth: number;
  expandable: boolean;
  expanded: boolean;
}

const flattenRows = (
  rows: MsaRow[],
  expandedKeys: string[],
  childrenByKey: Record<string, MsaRow[]>,
  depth = 0,
  parentKey = "root",
): FlatRow[] =>
  rows.flatMap((row, index) => {
    const key = String(row.identIndex ?? `${parentKey}_${depth}_${index}`);
    /**
     * Baris parameter (level 0) selalu bisa dibuka ke region, dan region ke
     * witel. Sebagian response tidak mengirim flag `main_parent`, jadi
     * kedalaman baris dipakai sebagai penentu cadangan.
     */
    const expandable =
      !isSummaryRow(row) &&
      (depth === 0 || Boolean(row.main_parent) || Boolean(row.parent)) &&
      depth < 2;
    const expanded = expandedKeys.includes(key);
    const children = childrenByKey[key] ?? [];

    const current: FlatRow = { row, key, depth, expandable, expanded };

    if (!expanded || !children.length) return [current];

    return [
      current,
      ...flattenRows(children, expandedKeys, childrenByKey, depth + 1, key),
    ];
  });

interface MsaHistoryTableProps {
  rows: MsaRow[];
  loading?: boolean;
  error?: boolean;
  expandedKeys: string[];
  childrenByKey: Record<string, MsaRow[]>;
  onToggleRow: (row: MsaRow, rowKey: string) => void;
}

/** Tabel MONTHLY DATA SLA: per kuartal, tiap bulan berisi Real / Ach / Score. */
export function MsaHistoryTable({
  rows,
  loading = false,
  error = false,
  expandedKeys,
  childrenByKey,
  onToggleRow,
}: MsaHistoryTableProps) {
  const flatRows = useMemo(
    () => flattenRows(rows, expandedKeys, childrenByKey),
    [rows, expandedKeys, childrenByKey],
  );

  /** Nomor hanya untuk baris parameter utama; baris ringkasan dilewati. */
  const rowNumbers = useMemo(() => {
    const numbers: Record<string, number> = {};
    let counter = 0;

    flatRows.forEach((item) => {
      if (item.depth !== 0 || isSummaryRow(item.row)) return;

      counter += 1;
      numbers[item.key] = counter;
    });

    return numbers;
  }, [flatRows]);

  const leafCount = 4 + QUARTERS.length * (1 + 3 * 3);

  if (!loading && !rows.length) {
    return (
      <EmptyState
        title={error ? "Gagal memuat data history." : "Data belum tersedia"}
      />
    );
  }

  const renderValue = (row: MsaRow, key: string) => {
    const value = row[key];

    if (value === null || value === undefined || value === "") {
      return <span className="text-[#94a3b8]">-</span>;
    }

    /** Kolom Real & Score tampil apa adanya; hanya angka yang diformat. */
    if (!key.startsWith("ach_fm_")) {
      const isNumeric = !Number.isNaN(parseFloat(String(value)));

      return (
        <span className="text-[#0f172a]">
          {isNumeric ? formatMsaNumber(value) : String(value)}
        </span>
      );
    }

    const target = Number(row.target);
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return <span className="text-[#0f172a]">{String(value)}</span>;
    }

    const lowerIsBetter = isPacketlossRanToCore(row);
    const isGood = Number.isFinite(target)
      ? lowerIsBetter
        ? numeric <= target
        : numeric >= target
      : true;

    return (
      <span
        className={`rounded-sm px-1 font-medium ${
          isGood ? "text-[#16a34a] bg-[#f0fdf4]" : "text-[#dc2626] bg-[#fef2f2]"
        }`}
      >
        {formatMsaNumber(value)}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th rowSpan={2} className={`${headCell} w-14 text-center`}>
              No.
            </th>
            <th rowSpan={2} className={`${headCell} w-[240px]`}>
              Parameter
            </th>
            <th rowSpan={2} className={`${headCell} text-center`}>
              Satuan
            </th>
            <th rowSpan={2} className={`${headCell} text-center`}>
              Weighted SC
            </th>

            {QUARTERS.map((quarter) => (
              <Fragment key={quarter.label}>
                <th rowSpan={2} className={`${headCell} text-center`}>
                  {quarter.label}
                </th>
                {quarter.months.map((month) => (
                  <th
                    key={`${quarter.label}-${month}`}
                    colSpan={3}
                    className={groupHeadCell}
                  >
                    {MONTH_LABELS[month]}
                  </th>
                ))}
              </Fragment>
            ))}
          </tr>

          <tr>
            {QUARTERS.flatMap((quarter) =>
              quarter.months.flatMap((month) =>
                ["Real", "Ach", "Score"].map((label) => (
                  <th
                    key={`${month}-${label}`}
                    className={`${headCell} text-center`}
                  >
                    {label}
                  </th>
                )),
              ),
            )}
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {Array.from({ length: leafCount }).map((_, cellIndex) => (
                  <td key={cellIndex} className={bodyCell}>
                    <Skeleton height={14} />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            flatRows.map((item) => {
              const summary = isSummaryRow(item.row);

              return (
                <tr
                  key={item.key}
                  className={`hover:bg-[#f8fafc] ${summary ? "bg-[#f1f5f9] font-semibold" : ""}`}
                >
                  <td className={`${bodyCell} text-center text-[#475569]`}>
                    {rowNumbers[item.key] ?? ""}
                  </td>

                  <td className={bodyCell}>
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: item.depth * 16 }}
                    >
                      {item.expandable ? (
                        <button
                          type="button"
                          aria-label={
                            item.expanded ? "Tutup baris" : "Buka baris"
                          }
                          onClick={() => onToggleRow(item.row, item.key)}
                          className="flex size-5 cursor-pointer items-center justify-center rounded border border-[#e2e8f0] bg-white text-[#64748b]"
                        >
                          <LuChevronRight
                            size={14}
                            className={`transition-transform ${item.expanded ? "rotate-90" : ""}`}
                          />
                        </button>
                      ) : (
                        <span className="size-5" />
                      )}

                      <span
                        className={
                          item.depth === 0
                            ? "font-medium text-[#0f172a]"
                            : "text-xs text-[#475569]"
                        }
                      >
                        {String(item.row.parameter ?? "-")}
                      </span>
                    </div>
                  </td>

                  <td className={`${bodyCell} text-center text-[#475569]`}>
                    {(item.row.satuan as string) ?? "-"}
                  </td>
                  <td className={`${bodyCell} text-center text-[#475569]`}>
                    {(item.row.weight as string) ?? "-"}
                  </td>

                  {QUARTERS.flatMap((quarter) => [
                    <td
                      key={`${item.key}-${quarter.label}`}
                      className={`${bodyCell} text-center text-[#475569]`}
                    >
                      {(item.row[
                        `target_${quarter.label.toLowerCase()}`
                      ] as string) ?? "-"}
                    </td>,
                    ...quarter.months.flatMap((month) =>
                      [
                        `real_fm_${month}`,
                        `ach_fm_${month}`,
                        `score_fm_${month}`,
                      ].map((key) => (
                        <td
                          key={`${item.key}-${key}`}
                          className={`${bodyCell} text-center`}
                        >
                          {renderValue(item.row, key)}
                        </td>
                      )),
                    ),
                  ])}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
