import { Fragment, useEffect, useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

import { Skeleton, Sparkline, StatusPill, Switch } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import Modal from "@/app/components/molecules/Modal";

import {
  useFbbSlaKabupatenQuery,
  useFbbSlaRegionQuery,
} from "@/app/hooks";

import type {
  SlaWsaDetailRow,
  SlaWsaItem,
} from "@/app/types/fbb/sla.types";

import {
  formatAchievementLabel,
  formatSlaDetailValue,
  resolveSlaParameter,
} from "@/app/utils/fbbSla.utils";

const HEADERS = [
  "Region",
  "Value",
  "Trend",
  "Target",
  "Status",
  "Capaian",
  "Gap to Target",
];

const TREND_POINTS = 30;

const LOWER_IS_BETTER = /latency|jitter|packet|loss|mttr|ttr/i;

const parseTrend = (trend?: string) =>
  String(trend ?? "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value))
    .slice(-TREND_POINTS);

const isAchieved = (row: SlaWsaDetailRow) =>
  String(row.status_result ?? "").toLowerCase().includes("not") === false;

interface FbbSlaDetailModalProps {
  indicator: SlaWsaItem | null;
  yearweek: string | null;
  onClose: () => void;
}

export function FbbSlaDetailModal({
  indicator,
  yearweek,
  onClose,
}: FbbSlaDetailModalProps) {
  const [expandedRegion, setExpandedRegion] = useState("");
  const [showAll, setShowAll] = useState(false);

  const open = Boolean(indicator);
  const parameter = resolveSlaParameter(indicator);
  const sumberData = indicator?.sumber_data;
  const lowerIsBetter = LOWER_IS_BETTER.test(
    `${indicator?.performance_indicator ?? ""} ${parameter}`,
  );

  useEffect(() => {
    if (!open) return;

    setExpandedRegion("");
    setShowAll(false);
  }, [open, indicator?.performance_indicator, indicator?.sumber_data]);

  const regionQuery = useFbbSlaRegionQuery(
    { yearweek, parameter, sumberData, showAll },
    open,
  );

  const kabupatenQuery = useFbbSlaKabupatenQuery(
    { yearweek, parameter, sumberData, region: expandedRegion, showAll },
    open && Boolean(expandedRegion),
  );

  const regionRows = regionQuery.data?.data ?? [];
  const kabupatenRows = kabupatenQuery.data?.data ?? [];

  const toggleRegion = (region: string) =>
    setExpandedRegion((current) => (current === region ? "" : region));

  const renderValueRow = (row: SlaWsaDetailRow, isChild = false) => {
    const achieved = isAchieved(row);

    return (
      <>
        <td
          className={`h-10 px-3 text-sm text-[#020617] tabular-nums ${
            isChild ? "" : "font-medium"
          }`}
        >
          {formatSlaDetailValue(row.value)}
        </td>
        <td className="px-3 py-2">
          <Sparkline values={parseTrend(row.trend)} lowerIsBetter={lowerIsBetter} />
        </td>
        <td className="h-10 px-3 text-center text-sm text-[#020617] tabular-nums">
          {formatSlaDetailValue(row.target)}
        </td>
        <td className="h-10 px-3 text-center">
          <StatusPill
            label={row.status_result || "-"}
            tone={achieved ? "win" : "lose"}
          />
        </td>
        <td
          className={`h-10 px-3 text-center text-sm font-semibold tabular-nums ${
            achieved ? "text-[#21a647]" : "text-[#c23837]"
          }`}
        >
          {formatAchievementLabel(row.capaian_pct_result)}
        </td>
        <td className="h-10 px-3 text-center text-sm text-[#020617] tabular-nums">
          {formatSlaDetailValue(row.gap_to_target_result)}
        </td>
      </>
    );
  };

  return (
    <Modal open={open} onClose={onClose} width={1040} bodyClassName="p-5">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 pr-8">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#020617]">
            {indicator?.performance_indicator ?? "Detail Capaian"}
          </h2>
          <p className="mt-1 text-xs text-[#64748b]">
            {[indicator?.sumber_data, indicator?.layanan, `Capaian ${formatAchievementLabel(indicator?.capaian)}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <Switch
          checked={showAll}
          onChange={(next) => {
            setShowAll(next);
            setExpandedRegion("");
          }}
          label="Show All"
        />
      </header>

      <div className="max-h-[60vh] overflow-auto rounded-lg border border-[#e2e8f0]">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr>
              {HEADERS.map((label, index) => (
                <th
                  key={label}
                  className={`h-10 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm font-medium text-[#334155] ${
                    index > 1 ? "text-center" : ""
                  }`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {regionQuery.isFetching &&
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-slate-100">
                  {HEADERS.map((label) => (
                    <td key={label} className="px-3 py-3">
                      <Skeleton />
                    </td>
                  ))}
                </tr>
              ))}

            {!regionQuery.isFetching &&
              regionRows.map((row, rowIndex) => {
                const isOpen = expandedRegion === row.region;

                return (
                  <Fragment key={`${row.region}-${row.sla_names}-${rowIndex}`}>
                    <tr className="border-b border-[#e2e8f0] transition-colors hover:bg-[#f8fafc]">
                      <td className="h-10 px-3 text-sm font-semibold text-[#020617]">
                        <button
                          type="button"
                          onClick={() => toggleRegion(row.region)}
                          className="flex cursor-pointer items-center gap-2 transition-colors hover:text-[#2563eb]"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#94a3b8]">
                            {isOpen ? (
                              <LuChevronDown size={14} />
                            ) : (
                              <LuChevronRight size={14} />
                            )}
                          </span>
                          {row.region}
                        </button>
                      </td>
                      {renderValueRow(row)}
                    </tr>

                    {isOpen && kabupatenQuery.isFetching &&
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr
                          key={`${row.region}-${rowIndex}-child-skeleton-${index}`}
                          className="border-b border-[#e2e8f0]"
                        >
                          {HEADERS.map((label, cellIndex) => (
                            <td
                              key={label}
                              className={`${cellIndex === 0 ? "pl-11" : "px-3"} py-3`}
                            >
                              <Skeleton />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {isOpen &&
                      !kabupatenQuery.isFetching &&
                      kabupatenRows.map((child, childIndex) => (
                        <tr
                          key={`${row.region}-${child.kabupaten}-${childIndex}`}
                          className="border-b border-[#e2e8f0] bg-[#fbfdff] transition-colors hover:bg-[#f8fafc]"
                        >
                          <td className="h-10 pl-11 text-sm text-[#020617]">
                            {child.kabupaten || "-"}
                          </td>
                          {renderValueRow(child, true)}
                        </tr>
                      ))}

                    {isOpen &&
                      !kabupatenQuery.isFetching &&
                      !kabupatenRows.length && (
                        <tr className="border-b border-[#e2e8f0]">
                          <td
                            colSpan={HEADERS.length}
                            className="py-3 pl-11 text-sm text-[#64748b]"
                          >
                            {kabupatenQuery.isError
                              ? "Gagal memuat detail kabupaten."
                              : "Detail kabupaten belum tersedia."}
                          </td>
                        </tr>
                      )}
                  </Fragment>
                );
              })}

            {!regionQuery.isFetching && !regionRows.length && (
              <tr>
                <td colSpan={HEADERS.length}>
                  <EmptyState
                    title={
                      regionQuery.isError
                        ? "Gagal memuat detail region."
                        : "Data belum tersedia"
                    }
                    description={
                      regionQuery.isError
                        ? undefined
                        : "Tidak ada detail region untuk indikator ini."
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
