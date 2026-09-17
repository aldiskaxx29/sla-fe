import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import Modal from "@/app/components/molecules/Modal";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { PeHsiGatewayTrendCard } from "@/app/components/organisms/charts/PeHsiGatewayTrendCard";

import { usePeHsiTrendVerifierQuery } from "@/app/hooks";

interface PeHsiGatewayTrendModalProps {
  open: boolean;
  date?: string;
  hour?: number;
  peOptions: string[];
  selectedPe: string;
  totalPe?: number;
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
  onSelectedPeChange,
  onClose,
}: PeHsiGatewayTrendModalProps) {
  const [search, setSearch] = useState("");

  const verifierTrend = usePeHsiTrendVerifierQuery(
    { date, hour, peHsi: selectedPe },
    open,
  );

  const options = useMemo(
    () => [
      { label: "Semua PE", value: "" },
      ...peOptions.map((option) => ({ label: option, value: option })),
    ],
    [peOptions],
  );

  const trends = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const list = verifierTrend.data ?? [];

    if (!keyword) return list;

    return list.filter((item) =>
      item.verifier_name.toLowerCase().includes(keyword),
    );
  }, [search, verifierTrend.data]);

  return (
    <Modal open={open} onClose={onClose} width={1040} bodyClassName="p-6">
      <header className="mb-4 pr-8">
        <h2 className="text-lg font-semibold text-[#0f172a]">
          Trend Not Degrade Per Gateway
        </h2>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex h-11 w-full items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 focus-within:border-[#cbd5e1] sm:w-[280px]">
          <LuSearch className="size-4 shrink-0 text-[#64748b]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-sm text-[#020617] outline-none placeholder:text-[#64748b]"
          />
        </label>

        <SelectMenu
          value={selectedPe}
          options={options}
          onChange={onSelectedPeChange}
          placeholder="Pilih PE"
          className="[&>div]:w-[220px] [&_button]:h-11 [&_button]:w-[220px] [&_button]:justify-between [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:px-4 [&_button]:text-sm [&_button]:text-[#0f172a] [&_button>span]:truncate"
        />
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
                : "Tidak ada gateway yang cocok dengan pencarian ini."
            }
          />
        )}
      </div>
    </Modal>
  );
}
