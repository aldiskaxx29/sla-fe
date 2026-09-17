import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { toast } from "react-toastify";

import {
  buildPeHsiLinkDetailSample,
  PE_HSI_SUMMARY_SAMPLE,
} from "@/app/api/network/peHsi.sample";
import { usePeHsiPivotQuery, usePeHsiTrendSummaryQuery } from "@/app/hooks";

import { SampleDataBadge } from "@/app/components/molecules/SampleDataBadge";
import { SectionCard } from "@/app/components/molecules/SectionCard";

import { PeHsiTrendChart } from "@/app/components/organisms/charts/PeHsiTrendChart";
import { PeHsiToolbar } from "@/app/components/organisms/forms/PeHsiToolbar";
import { PeHsiSummaryPanel } from "@/app/components/organisms/panels/PeHsiSummaryPanel";
import { PeHsiGatewayTrendModal } from "@/app/components/organisms/popup/PeHsiGatewayTrendModal";
import { PeHsiLinkDetailModal } from "@/app/components/organisms/popup/PeHsiLinkDetailModal";
import { PeHsiPivotTable } from "@/app/components/organisms/tables/PeHsiPivotTable";

const pad = (value: number) => String(value).padStart(2, "0");

const toLocalInput = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:00`;

const splitDateTime = (value: string) => {
  const [date = "", time = ""] = value.split("T");
  const hour = Number(time.slice(0, 2));

  return { date, hour: Number.isFinite(hour) ? hour : undefined };
};

const PeHsiMonitoringPage = () => {
  const [search, setSearch] = useState("");
  const [selectedAt, setSelectedAt] = useState(() => toLocalInput(new Date()));
  const [gatewayTrendOpen, setGatewayTrendOpen] = useState(false);
  const [selectedPe, setSelectedPe] = useState("");
  const [linkDetailOpen, setLinkDetailOpen] = useState(false);
  const [detailPe, setDetailPe] = useState("");

  const { date, hour } = splitDateTime(selectedAt);

  const pivot = usePeHsiPivotQuery({ date, hour });
  const trend = usePeHsiTrendSummaryQuery({ date, hour });

  const areas = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const allAreas = pivot.data ?? [];

    if (!keyword) return allAreas;

    return allAreas
      .map((area) => ({
        ...area,
        items: area.items.filter(
          (item) =>
            item.pe_hsi.toLowerCase().includes(keyword) ||
            area.area_name.toLowerCase().includes(keyword),
        ),
      }))
      .filter((area) => area.items.length > 0);
  }, [pivot.data, search]);

  const visiblePeCount = areas.reduce((total, area) => total + area.items.length, 0);
  const totalLink = (pivot.data ?? []).reduce(
    (total, area) => total + (area.pe_count ?? area.items.length),
    0,
  );

  const peOptions = useMemo(
    () =>
      (pivot.data ?? []).flatMap((area) =>
        area.items.map((item) => item.pe_hsi),
      ),
    [pivot.data],
  );

  const openGatewayTrend = (peHsi = "") => {
    setSelectedPe(peHsi);
    setGatewayTrendOpen(true);
  };

  const openLinkDetail = (peHsi: string) => {
    setDetailPe(peHsi);
    setLinkDetailOpen(true);
  };

  const linkDetail = useMemo(() => {
    const item = (pivot.data ?? [])
      .flatMap((area) => area.items)
      .find((row) => row.pe_hsi === detailPe);

    return item ? buildPeHsiLinkDetailSample(item) : undefined;
  }, [detailPe, pivot.data]);

  const notAvailable = () =>
    toast.info("Fitur ini belum tersedia.", { position: "top-right" });

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <PeHsiToolbar
        lastUpdated={PE_HSI_SUMMARY_SAMPLE.last_updated}
        selectedAt={selectedAt}
        onSelectedAtChange={setSelectedAt}
        onExport={notAvailable}
      />

      <div className="flex flex-wrap items-center gap-2">
        <SampleDataBadge />
        <span className="text-xs text-[#64748b]">
          Jumlah Link & Issue Link masih data contoh.
        </span>
      </div>

      <PeHsiSummaryPanel
        totalLink={totalLink || PE_HSI_SUMMARY_SAMPLE.total_link}
        bestPath={PE_HSI_SUMMARY_SAMPLE.best_path}
        issueLink={PE_HSI_SUMMARY_SAMPLE.issue_link}
        issueBreakdown={PE_HSI_SUMMARY_SAMPLE.issue_breakdown}
        loading={pivot.isFetching}
      />

      <PeHsiTrendChart
        points={trend.data ?? []}
        loading={trend.isFetching}
        error={trend.isError}
        onViewDetail={() => openGatewayTrend()}
      />

      <SectionCard className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#020617]">
            List PE-HSI · Pivot Latency
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-10 w-full items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 focus-within:border-[#cbd5e1] sm:w-[280px]">
              <LuSearch className="size-4 shrink-0 text-[#64748b]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-[#020617] outline-none placeholder:text-[#64748b]"
              />
            </label>

            <span className="flex h-9 shrink-0 items-center rounded-full bg-[#f1f5f9] px-3 text-sm font-medium text-[#64748b]">
              Showing {visiblePeCount} PE
            </span>
          </div>
        </div>

        <PeHsiPivotTable
          areas={areas}
          loading={pivot.isFetching}
          error={pivot.isError}
          onValueClick={openLinkDetail}
        />
      </SectionCard>

      <PeHsiGatewayTrendModal
        open={gatewayTrendOpen}
        date={date}
        hour={hour}
        peOptions={peOptions}
        selectedPe={selectedPe}
        totalPe={totalLink}
        onSelectedPeChange={setSelectedPe}
        onClose={() => setGatewayTrendOpen(false)}
      />

      <PeHsiLinkDetailModal
        open={linkDetailOpen}
        detail={linkDetail}
        peOptions={peOptions}
        selectedPe={detailPe}
        onSelectedPeChange={setDetailPe}
        onClose={() => setLinkDetailOpen(false)}
      />
    </main>
  );
};

export default PeHsiMonitoringPage;
