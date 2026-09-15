import { useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { LuX } from "react-icons/lu";

import { useBaselineTrendQuery } from "@/app/hooks/query/monday/baselinePerformance";
import type { BaselineRegionRow } from "@/app/types/monday/baseline.types";

interface BaselineTrendModalProps {
  region: BaselineRegionRow | null;
  onClose: () => void;
}

const VISIBLE_WEEKS = 20;

export function BaselineTrendModal({ region, onClose }: BaselineTrendModalProps) {
  const trend = useBaselineTrendQuery(Boolean(region));

  useEffect(() => {
    if (!region) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [region, onClose]);

  const key = region?.region.toUpperCase() ?? "";
  const weeks = useMemo(() => trend.data?.weeks ?? [], [trend.data]);
  const latency = useMemo(
    () => trend.data?.latency[key] ?? [],
    [trend.data, key],
  );
  const packetloss = useMemo(
    () => trend.data?.packetloss[key] ?? [],
    [trend.data, key],
  );

  const option = useMemo<EChartsOption>(() => {
    const total = weeks.length;
    const zoomStart =
      total > VISIBLE_WEEKS ? ((total - VISIBLE_WEEKS) / total) * 100 : 0;

    return {
      grid: { top: 32, left: 8, right: 16, bottom: 56, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: "#CBD5E1" } },
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        textStyle: { color: "#213c52", fontSize: 11 },
        valueFormatter: (value) =>
          value === null || value === undefined
            ? "-"
            : `${Number(value).toLocaleString("id-ID")} site`,
      },
      legend: {
        data: ["Latency", "Packetloss"],
        top: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { fontSize: 11, color: "#64748B" },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: weeks,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#E2E8F0" } },
        axisLabel: { color: "#64748B", fontSize: 9, rotate: 30 },
      },
      yAxis: {
        type: "value",
        name: "Jumlah Site",
        nameTextStyle: { color: "#94A3B8", fontSize: 10 },
        splitLine: { lineStyle: { color: "#F1F5F9" } },
        axisLabel: { color: "#64748B", fontSize: 10 },
      },
      dataZoom: [
        {
          type: "slider",
          height: 12,
          bottom: 16,
          start: zoomStart,
          end: 100,
          textStyle: { color: "transparent" },
          handleSize: 10,
          fillerColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "#E2E8F0",
        },
        { type: "inside", start: zoomStart, end: 100 },
      ],
      series: [
        {
          name: "Latency",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          showSymbol: false,
          data: latency,
          lineStyle: { width: 2, color: "#0EA5E9" },
          itemStyle: { color: "#0EA5E9" },
        },
        {
          name: "Packetloss",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          showSymbol: false,
          data: packetloss,
          lineStyle: { width: 2, color: "#F59E0B" },
          itemStyle: { color: "#F59E0B" },
        },
      ],
    };
  }, [weeks, latency, packetloss]);

  if (!region) return null;

  const hasData = Boolean(latency.length || packetloss.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tren baseline ${region.region}`}
        className="flex max-h-[82vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-[#213c52]">
                {region.region}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  region.status === "critical"
                    ? "bg-red-50 text-red-500"
                    : region.status === "warning"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {region.status}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              Tren mingguan jumlah site not clear
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <LuX size={16} />
          </button>
        </header>

        <div className="grid grid-cols-3 gap-3 border-b border-slate-100 px-5 py-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Total Site
            </p>
            <p className="text-sm font-extrabold text-[#213c52]">
              {region.total.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-sky-500">
              Latency Not Clear
            </p>
            <p className="text-sm font-extrabold text-[#213c52]">
              {region.latency.toLocaleString("id-ID")}{" "}
              <span className="text-[11px] font-bold text-slate-400">
                ({region.latPersen}% · WoW {region.latWow > 0 ? "+" : ""}
                {region.latWow}%)
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">
              Packetloss Not Clear
            </p>
            <p className="text-sm font-extrabold text-[#213c52]">
              {region.packetlos.toLocaleString("id-ID")}{" "}
              <span className="text-[11px] font-bold text-slate-400">
                ({region.pacPersen}% · WoW {region.pacWow > 0 ? "+" : ""}
                {region.pacWow}%)
              </span>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-3">
          {trend.isPending ? (
            <p className="py-16 text-center text-[11px] font-semibold text-slate-400">
              Memuat tren {region.region}...
            </p>
          ) : trend.isError ? (
            <p className="py-16 text-center text-[11px] font-semibold text-red-500">
              Gagal memuat tren baseline.
            </p>
          ) : !hasData ? (
            <p className="py-16 text-center text-[11px] font-semibold text-slate-400">
              Tren untuk region ini belum tersedia.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ReactECharts
                option={option}
                notMerge
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BaselineTrendModal;
