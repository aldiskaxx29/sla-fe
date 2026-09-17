import { useMemo } from "react";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import Modal from "@/app/components/molecules/Modal";
import Select from "@/app/components/molecules/Select";

import { PeHsiGatewayTrendCard } from "@/app/components/organisms/charts/PeHsiGatewayTrendCard";

import { usePeHsiTrendVerifierQuery } from "@/app/hooks";

import type { PeHsiGranularity } from "@/app/types/network/peHsi.types";

const RANGE_OPTIONS: Array<{ label: string; value: PeHsiGranularity }> = [
  { label: "Hourly", value: "hourly" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

interface PeHsiGatewayTrendModalProps {
  open: boolean;
  date?: string;
  hour?: number;
  peOptions: string[];
  selectedPe: string;
  totalPe?: number;
  range: PeHsiGranularity;
  onRangeChange: (value: PeHsiGranularity) => void;
  onSelectedPeChange: (value: string) => void;
  onClose: () => void;
}

export function PeHsiGatewayTrendModal({
  open,
  date,
  hour,
  peOptions,
  selectedPe,
  totalPe,
  range,
  onRangeChange,
  onSelectedPeChange,
  onClose,
}: PeHsiGatewayTrendModalProps) {
  const verifierTrend = usePeHsiTrendVerifierQuery(
    { date, hour, peHsi: selectedPe, filter: range },
    open,
  );

  const options = useMemo(
    () => [
      { label: "Semua PE", value: "" },
      ...peOptions.map((option) => ({ label: option, value: option })),
    ],
    [peOptions],
  );

  const trends = verifierTrend.data ?? [];

  return (
    <Modal open={open} onClose={onClose} width={1040} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          Trend Not Degrade Per Gateway
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

        <div className="flex items-center gap-1 rounded-full bg-[#f1f5f9] p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onRangeChange(option.value)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                range === option.value
                  ? "bg-[#2563eb] text-white"
                  : "text-[#475569] hover:text-[#0f172a]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[62vh] overflow-y-auto pr-1">
        {verifierTrend.isFetching ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-[#e2e8f0] bg-white p-4"
              >
                <Skeleton height={210} />
              </div>
            ))}
          </div>
        ) : trends.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {trends.map((trend) => (
              <PeHsiGatewayTrendCard
                key={trend.verifier_name}
                trend={trend}
                totalPe={totalPe}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              verifierTrend.isError
                ? "Gagal memuat trend per gateway."
                : "Data belum tersedia"
            }
            description={
              verifierTrend.isError
                ? undefined
                : "Coba pilih PE atau rentang waktu yang lain."
            }
          />
        )}
      </div>
    </Modal>
  );
}
