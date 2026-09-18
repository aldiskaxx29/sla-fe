import { Fragment, useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import { SectionCard } from "@/app/components/molecules/SectionCard";

import type {
  ActionPlanData,
  ActionPlanEntry,
} from "@/app/types/resume-rca/resumeRca.types";
import {
  RCA_TRAFFIC_REGIONS,
  sumActionPlanEntry,
  toRegionKey,
} from "@/app/utils/resumeRca.utils";

const GRID = "grid grid-cols-[32px_minmax(0,1fr)_64px_64px_64px] items-center";

interface ActionPlanTarget {
  rca: string;
  rca2: string;
  status: "OGP" | "CLOSED";
  region?: string;
}

interface RcaActionPlanPanelProps {
  data: ActionPlanData;
  loading?: boolean;
  error?: boolean;
  onCellClick: (target: ActionPlanTarget) => void;
}

export function RcaActionPlanPanel({
  data,
  loading = false,
  error = false,
  onCellClick,
}: RcaActionPlanPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setExpanded((current) => ({ ...current, [key]: !current[key] }));

  const groups = Object.keys(data);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SectionCard
            key={`action-plan-skeleton-${index}`}
            className="flex flex-col gap-3 p-4"
          >
            <Skeleton height={20} width="40%" />
            <Skeleton height={140} />
          </SectionCard>
        ))}
      </div>
    );
  }

  if (!groups.length) {
    return (
      <EmptyState
        title={error ? "Gagal memuat action plan." : "Data belum tersedia"}
        description={error ? undefined : "Tidak ada data untuk filter yang dipilih."}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {groups.map((group) => {
        const plans = Object.keys(data[group]).filter(
          (plan) => !["OGP", "CLOSED"].includes(plan),
        );

        const groupOgp = sumActionPlanEntry(data[group] as ActionPlanEntry, "OGP");
        const groupClosed = sumActionPlanEntry(data[group] as ActionPlanEntry, "CLOSED");

        return (
          <SectionCard key={group} className="flex flex-col gap-3 p-4">
            <h3 className="text-sm font-semibold text-[#020617] uppercase">
              {group} Issue
            </h3>

            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0]">
              <div
                className={`${GRID} border-b border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-[11px] font-semibold text-[#334155] uppercase`}
              >
                <span />
                <span>Action Plan</span>
                <span className="text-center">OGP</span>
                <span className="text-center">Close</span>
                <span className="text-center">Total</span>
              </div>

              {plans.map((plan, index) => {
                const entry = data[group][plan];
                const ogp = sumActionPlanEntry(entry, "OGP");
                const closed = sumActionPlanEntry(entry, "CLOSED");
                const key = `${group}-${plan}`;
                const isOpen = Boolean(expanded[key]);

                return (
                  <Fragment key={key}>
                    <div
                      className={`${GRID} border-b border-[#eef2f7] px-3 py-2 text-xs text-[#0f172a]`}
                    >
                      <span className="text-center text-slate-400">
                        {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="flex cursor-pointer items-center gap-1.5 text-left font-medium uppercase hover:text-[#4338ca]"
                      >
                        {isOpen ? (
                          <LuChevronDown size={14} />
                        ) : (
                          <LuChevronRight size={14} />
                        )}
                        {plan}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onCellClick({ rca: group, rca2: plan, status: "OGP" })
                        }
                        className="cursor-pointer text-center font-semibold text-[#4338ca] hover:underline"
                      >
                        {ogp}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onCellClick({
                            rca: group,
                            rca2: plan,
                            status: "CLOSED",
                          })
                        }
                        className="cursor-pointer text-center font-semibold text-[#4338ca] hover:underline"
                      >
                        {closed}
                      </button>

                      <span className="text-center font-semibold">
                        {ogp + closed}
                      </span>
                    </div>

                    {isOpen
                      ? RCA_TRAFFIC_REGIONS.map((region) => {
                          const regionOgp = Number(entry?.OGP?.[region] ?? 0);
                          const regionClosed = Number(
                            entry?.CLOSED?.[region] ?? 0,
                          );

                          if (regionOgp + regionClosed === 0) return null;

                          return (
                            <div
                              key={`${key}-${region}`}
                              className={`${GRID} border-b border-[#eef2f7] bg-[#f8fafc] px-3 py-1.5 text-[11px] text-[#475569]`}
                            >
                              <span />
                              <span className="pl-5">{toRegionKey(region)}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  onCellClick({
                                    rca: group,
                                    rca2: plan,
                                    status: "OGP",
                                    region: toRegionKey(region),
                                  })
                                }
                                className="cursor-pointer text-center hover:text-[#4338ca] hover:underline"
                              >
                                {regionOgp}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  onCellClick({
                                    rca: group,
                                    rca2: plan,
                                    status: "CLOSED",
                                    region: toRegionKey(region),
                                  })
                                }
                                className="cursor-pointer text-center hover:text-[#4338ca] hover:underline"
                              >
                                {regionClosed}
                              </button>

                              <span className="text-center">
                                {regionOgp + regionClosed}
                              </span>
                            </div>
                          );
                        })
                      : null}
                  </Fragment>
                );
              })}

              <div
                className={`${GRID} bg-[#f1f5f9] px-3 py-2 text-xs font-semibold text-[#0f172a]`}
              >
                <span />
                <span className="uppercase">Total</span>

                <button
                  type="button"
                  onClick={() =>
                    onCellClick({ rca: group, rca2: "", status: "OGP" })
                  }
                  className="cursor-pointer text-center text-[#4338ca] hover:underline"
                >
                  {groupOgp}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onCellClick({ rca: group, rca2: "", status: "CLOSED" })
                  }
                  className="cursor-pointer text-center text-[#4338ca] hover:underline"
                >
                  {groupClosed}
                </button>

                <span className="text-center">{groupOgp + groupClosed}</span>
              </div>
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}

export default RcaActionPlanPanel;
