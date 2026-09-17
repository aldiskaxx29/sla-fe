import { useMemo, useState } from "react";
import { LuCircleCheck, LuTriangleAlert } from "react-icons/lu";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import Modal from "@/app/components/molecules/Modal";
import Select from "@/app/components/molecules/Select";

import { PeHsiLatencyTrendChart } from "@/app/components/organisms/charts/PeHsiLatencyTrendChart";

import type { PeHsiLinkDetail } from "@/app/types/network/peHsi.types";

type TrendView = "chart" | "detail";

const headCell =
  "h-10 border-b border-[#e2e8f0] px-3 text-center text-xs font-medium text-[#475569]";
const bodyCell =
  "h-10 border-b border-[#e2e8f0] px-3 text-center text-sm text-[#0f172a] tabular-nums";
/** Tabel gateway hanya 4 baris, jadi tinggi barisnya disesuaikan agar
 * total tingginya sama dengan tabel traceroute yang punya 5 baris. */
const gatewayBodyCell =
  "h-[50px] border-b border-[#e2e8f0] px-3 text-center text-sm text-[#0f172a] tabular-nums";

const statusToneClass = (status: string) =>
  status === "OK" ? "text-[#16a34a]" : "text-[#dc2626]";

const formatMs = (value: number | null) =>
  value === null || value === undefined ? "-" : `${value} ms`;

interface PeHsiLinkDetailModalProps {
  open: boolean;
  detail?: PeHsiLinkDetail;
  peOptions: string[];
  selectedPe: string;
  onSelectedPeChange: (value: string) => void;
  onClose: () => void;
}

export function PeHsiLinkDetailModal({
  open,
  detail,
  peOptions,
  selectedPe,
  onSelectedPeChange,
  onClose,
}: PeHsiLinkDetailModalProps) {
  const [trendView, setTrendView] = useState<TrendView>("chart");

  const options = useMemo(
    () => peOptions.map((option) => ({ label: option, value: option })),
    [peOptions],
  );

  const gateways = detail?.gateways ?? [];

  return (
    <Modal open={open} onClose={onClose} width={1040} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          {detail?.pe_hsi || selectedPe || "Detail PE-HSI"}
        </h2>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          searchable
          value={selectedPe}
          options={options}
          onChange={(next) => onSelectedPeChange(String(next))}
          placeholder="Pilih PE"
          className="w-full sm:w-[280px]"
          triggerClassName="flex h-11 w-full cursor-pointer items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 text-left text-sm text-[#0f172a]"
        />
      </div>

      {detail ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-[#0f172a]">
                <LuCircleCheck className="size-4 text-[#2563eb]" />
                Traceroute
              </span>
              <span className="text-sm font-semibold text-[#16a34a]">
                {detail.best_path_status}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-[#0f172a]">
                <LuTriangleAlert className="size-4 text-[#dc2626]" />
                Link Degrade
              </span>
              <span className="text-sm font-semibold text-[#dc2626]">
                {detail.link_degrade}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#0f172a]">
                  Traceroute
                </h3>
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                  {detail.best_path}
                </span>
              </div>

              <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc]">
                      <th className={`${headCell} w-[20%] border-r`}>No</th>
                      <th className={`${headCell} border-r`}>IP Address</th>
                      <th className={headCell}>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.traceroute.map((hop) => (
                      <tr key={hop.no} className="last:[&>td]:border-b-0">
                        <td className={`${bodyCell} border-r`}>{hop.no}</td>
                        <td className={`${bodyCell} border-r`}>
                          {hop.ip_address}
                        </td>
                        <td className={bodyCell}>{formatMs(hop.latency_ms)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-[#e2e8f0] bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-[#0f172a]">
                Gateway Performance Overview
              </h3>

              <div className="overflow-hidden rounded-lg border border-[#e2e8f0]">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc]">
                      <th className={`${headCell} border-r`}>Gateway</th>
                      <th className={`${headCell} border-r`}>Latency</th>
                      <th className={`${headCell} border-r`}>Jitter</th>
                      <th className={`${headCell} border-r`}>Packet Loss</th>
                      <th className={headCell}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gateways.map((gateway) => (
                      <tr
                        key={gateway.gateway}
                        className="last:[&>td]:border-b-0"
                      >
                        <td className={`${gatewayBodyCell} border-r`}>
                          {gateway.gateway}
                        </td>
                        <td className={`${gatewayBodyCell} border-r`}>
                          {formatMs(gateway.latency_ms)}
                        </td>
                        <td className={`${gatewayBodyCell} border-r`}>
                          {formatMs(gateway.jitter_ms)}
                        </td>
                        <td
                          className={`${gatewayBodyCell} border-r font-medium text-[#16a34a]`}
                        >
                          {gateway.packet_loss}%
                        </td>
                        <td
                          className={`${gatewayBodyCell} font-medium ${statusToneClass(
                            gateway.status,
                          )}`}
                        >
                          {gateway.status}
                        </td>
                      </tr>
                    ))}

                    {!gateways.length && (
                      <tr>
                        <td colSpan={5}>
                          <EmptyState title="Gateway tidak ditemukan" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-[#e2e8f0] bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#0f172a]">
                {trendView === "chart"
                  ? "Latency Trend by Gateway"
                  : "Latency Detail by Gateway"}
              </h3>

              <div className="flex items-center gap-1 rounded-lg bg-[#f1f5f9] p-1">
                {(["chart", "detail"] as TrendView[]).map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setTrendView(view)}
                    className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                      trendView === view
                        ? "bg-[#2563eb] text-white"
                        : "text-[#475569] hover:text-[#0f172a]"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {trendView === "chart" ? (
              <PeHsiLatencyTrendChart trend={detail.latency_trend} />
            ) : (
              <div className="max-h-[320px] overflow-auto rounded-lg border border-[#e2e8f0]">
                <table className="w-full min-w-[520px] table-fixed border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#f8fafc]">
                      <th className={`${headCell} border-r bg-[#f8fafc]`}>
                        Tanggal
                      </th>
                      {detail.latency_trend.gateways.map((gateway) => (
                        <th
                          key={gateway.gateway}
                          className={`${headCell} border-r bg-[#f8fafc] last:border-r-0`}
                        >
                          {gateway.gateway} Latency
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.latency_trend.categories.map((category, index) => (
                      <tr key={category} className="last:[&>td]:border-b-0">
                        <td className={`${bodyCell} border-r font-medium`}>
                          {category}
                        </td>
                        {detail.latency_trend.gateways.map((gateway) => (
                          <td
                            key={`${gateway.gateway}-${category}`}
                            className={`${bodyCell} border-r last:border-r-0`}
                          >
                            {formatMs(gateway.series[index] ?? null)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          title="Detail belum tersedia"
          description="Pilih PE-HSI lain untuk melihat detail link."
        />
      )}
    </Modal>
  );
}
