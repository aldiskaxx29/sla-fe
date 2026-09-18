import { Fragment, useMemo } from "react";
import { LuChevronRight } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type { MsaRow } from "@/app/types/msa/msa.types";
import {
  buildMsaMonthColumns,
  formatCellValue,
  isSummaryRow,
  resolveValueTone,
  toneClassName,
  type MsaLeafColumn,
} from "@/app/utils/msaColumns.utils";
import { isMttrqParameter, isWilayahRow } from "@/app/utils/msa.utils";

const SKELETON_ROWS = 8;
const BASE_COLUMN_COUNT = 5;
const REKON_COLUMN_COUNT = 2;

const headCell =
  "h-11 border-b border-r border-[#e2e8f0] bg-[#eef6ff] px-3 text-xs font-semibold whitespace-nowrap text-[#0f172a]";
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
  loading: boolean;
}

interface MsaAchievementTableProps {
  rows: MsaRow[];
  loading?: boolean;
  error?: boolean;
  showActualWeeks?: boolean;
  expandedKeys: string[];
  childrenByKey: Record<string, MsaRow[]>;
  loadingKey: string | null;
  onToggleRow: (row: MsaRow, rowKey: string) => void;
  onWeekClick: (row: MsaRow, column: MsaLeafColumn) => void;
  onRealisasiClick: (
    row: MsaRow,
    monthNum: number,
    stage: "before" | "after",
  ) => void;
}

/**
 * Baris disusun rata (flat) beserta kedalamannya supaya render tabel tetap
 * sederhana; anak baris datang dari hasil ekspansi di page.
 */
const flattenRows = (
  rows: MsaRow[],
  expandedKeys: string[],
  childrenByKey: Record<string, MsaRow[]>,
  loadingKey: string | null,
  depth = 0,
  parentKey = "root",
): FlatRow[] =>
  rows.flatMap((row, index) => {
    const key = String(row.identIndex ?? `${parentKey}_${depth}_${index}`);
    const parameter = String(row.mini_parameter ?? row.parameter ?? "");
    const summary = isSummaryRow(row);

    /**
     * Baris parameter (level 0) menurunkan region, region menurunkan witel.
     * MTTRQ punya satu level wilayah tambahan sebelum sampai ke witel, jadi
     * batas kedalamannya lebih dalam.
     */
    const maxDepth = isMttrqParameter(parameter) ? 3 : 2;
    const expandable =
      !summary &&
      depth < maxDepth &&
      (depth === 0 ||
        Boolean(row.main_parent) ||
        Boolean(row.parent) ||
        (isMttrqParameter(parameter) && !row.is_level_4));

    const expanded = expandedKeys.includes(key);
    const children = childrenByKey[key] ?? [];

    const current: FlatRow = {
      row,
      key,
      depth,
      expandable,
      expanded,
      loading: loadingKey === key,
    };

    if (!expanded || !children.length) return [current];

    return [
      current,
      ...flattenRows(
        children,
        expandedKeys,
        childrenByKey,
        loadingKey,
        depth + 1,
        key,
      ),
    ];
  });

export function MsaAchievementTable({
  rows,
  loading = false,
  error = false,
  showActualWeeks = false,
  expandedKeys,
  childrenByKey,
  loadingKey,
  onToggleRow,
  onWeekClick,
  onRealisasiClick,
}: MsaAchievementTableProps) {
  const monthColumns = useMemo(
    () => buildMsaMonthColumns(rows, showActualWeeks),
    [rows, showActualWeeks],
  );

  const flatRows = useMemo(
    () => flattenRows(rows, expandedKeys, childrenByKey, loadingKey),
    [rows, expandedKeys, childrenByKey, loadingKey],
  );

  const leafCount =
    BASE_COLUMN_COUNT +
    monthColumns.reduce((total, month) => total + month.children.length, 0) +
    REKON_COLUMN_COUNT;

  if (!loading && !rows.length) {
    return (
      <EmptyState
        title={error ? "Gagal memuat data MSA." : "Data belum tersedia"}
        description={
          error ? undefined : "Coba ubah filter area atau muat ulang halaman."
        }
      />
    );
  }

  const renderLeafCell = (row: MsaRow, column: MsaLeafColumn) => {
    const value = row[column.key];
    const summary = isSummaryRow(row);
    const tone = resolveValueTone(row, value, column.kind);
    const label = formatCellValue(row, value);

    if (label === "-") return <span className="text-[#94a3b8]">-</span>;

    if (summary) {
      return (
        <span className={`font-bold ${toneClassName(tone)} rounded-sm px-1`}>
          {label}
        </span>
      );
    }

    if (column.kind === "week") {
      return (
        <button
          type="button"
          onClick={() => onWeekClick(row, column)}
          className={`cursor-pointer rounded-sm px-1 font-medium hover:underline ${toneClassName(tone)}`}
        >
          {label}
        </button>
      );
    }

    if (
      column.kind === "realisasi-before" ||
      column.kind === "realisasi-after"
    ) {
      return (
        <button
          type="button"
          onClick={() =>
            onRealisasiClick(
              row,
              column.monthNum,
              column.kind === "realisasi-before" ? "before" : "after",
            )
          }
          className={`cursor-pointer rounded-sm px-1 font-medium hover:underline ${toneClassName(tone)}`}
        >
          {label}
        </button>
      );
    }

    if (column.kind === "achievement") {
      return (
        <span className={`rounded-sm px-1 font-medium ${toneClassName(tone)}`}>
          {label}
        </span>
      );
    }

    return <span className="text-[#0f172a]">{label}</span>;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th rowSpan={2} className={`${headCell} w-14 text-center`}>
              NO
            </th>
            <th rowSpan={2} className={`${headCell} w-[240px]`}>
              PARAMETER
            </th>
            <th rowSpan={2} className={`${headCell} text-center`}>
              TARGET
            </th>
            <th rowSpan={2} className={`${headCell} text-center`}>
              SATUAN
            </th>
            <th rowSpan={2} className={`${headCell} text-center`}>
              WEIGHTED SC
            </th>

            {monthColumns.map((month) => (
              <th
                key={month.key}
                colSpan={month.children.length}
                className={groupHeadCell}
              >
                {month.title}
              </th>
            ))}

            <th rowSpan={2} className={`${headCell} text-center`}>
              SCORE
              <br />
              BEFORE REKON
            </th>
            <th rowSpan={2} className={`${headCell} text-center`}>
              SCORE
              <br />
              AFTER REKON
            </th>
          </tr>

          <tr>
            {monthColumns.flatMap((month) =>
              month.children.map((column) => (
                <th
                  key={`${month.key}-${column.key}`}
                  className={`${headCell} text-center`}
                >
                  {column.title}
                </th>
              )),
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
              const parameterLabel = String(item.row.parameter ?? "-");
              const highlightParameter =
                parameterLabel === "WEIGHTED ACHIEVEMENT NATION" ||
                parameterLabel === "SERVICE CREDIT NATION";

              return (
                <Fragment key={item.key}>
                  <tr
                    className={`hover:bg-[#f8fafc] ${summary ? "bg-[#f1f5f9] font-semibold" : ""}`}
                  >
                    <td className={`${bodyCell} text-center text-[#475569]`}>
                      {item.depth === 0 ? (item.row.no as number) ?? "" : ""}
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
                            highlightParameter
                              ? "rounded-md bg-[#04d1de] px-2 py-1 font-bold text-white"
                              : item.depth === 0
                                ? "font-medium text-[#0f172a]"
                                : "text-xs text-[#475569]"
                          }
                        >
                          {parameterLabel}
                        </span>

                        {item.loading ? (
                          <span className="text-xs text-[#94a3b8]">
                            memuat…
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className={`${bodyCell} text-center text-[#475569]`}>
                      {(item.row.target as string) ?? "-"}
                    </td>
                    <td className={`${bodyCell} text-center text-[#475569]`}>
                      {(item.row.satuan as string) ?? "-"}
                    </td>
                    <td className={`${bodyCell} text-center text-[#475569]`}>
                      {(item.row.weight as string) ?? "-"}
                    </td>

                    {monthColumns.flatMap((month) =>
                      month.children.map((column) => (
                        <td
                          key={`${item.key}-${column.key}`}
                          className={`${bodyCell} text-center`}
                        >
                          {renderLeafCell(item.row, column)}
                        </td>
                      )),
                    )}

                    <td className={`${bodyCell} text-center text-[#0f172a]`}>
                      {(item.row.score_before_rekon as string) ?? "-"}
                    </td>
                    <td className={`${bodyCell} text-center text-[#0f172a]`}>
                      {(item.row.score_after_rekon as string) ?? "-"}
                    </td>
                  </tr>

                  {item.expanded &&
                    item.loading &&
                    !isWilayahRow(String(item.row.parameter ?? "")) && (
                      <tr>
                        <td colSpan={leafCount} className={bodyCell}>
                          <Skeleton height={14} />
                        </td>
                      </tr>
                    )}
                </Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
