import { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import type EChartsReactCore from "echarts-for-react/lib/core";
import type { EChartsOption, LineSeriesOption } from "echarts";
import {
  LuDownload,
  LuImage,
  LuMaximize2,
  LuMinimize2,
} from "react-icons/lu";
import * as XLSX from "xlsx";

import {
  SERIES_COLORS,
  formatSeriesName,
} from "@/app/components/organism/panels/TrendPerformancePanel/trendChart.shared";
import { useTrendQualityQuery } from "@/app/hooks/query/monday/trendQuality";
import type {
  TrendKind,
  TrendMetric,
  TrendScope,
} from "@/app/types/monday/trendQuality.types";

/** Berapa titik terakhir yang tampil sebelum slider digeser. */
const VISIBLE_WEEKS = 12;

interface TrendChartCardProps {
  title: string;
  kind: TrendKind;
  /** Metrik, level, dan legend dikendalikan panel supaya kedua chart seragam. */
  metric: TrendMetric;
  scope: TrendScope;
  hiddenSeries: string[];
  /** Sudut kartu mengikuti desain awal panel. */
  roundedClassName?: string;
}

export function TrendChartCard({
  title,
  kind,
  metric,
  scope,
  hiddenSeries,
  roundedClassName = "rounded-2xl",
}: TrendChartCardProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const chartRef = useRef<EChartsReactCore>(null);

  const trend = useTrendQualityQuery(kind, metric, scope);
  const series = useMemo(() => trend.data?.series ?? [], [trend.data]);

  // Esc keluar dari mode layar penuh.
  useEffect(() => {
    if (!fullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen]);

  const fileBaseName = `trend_${kind}_${scope}_${metric}`;

  /** Unduh chart apa adanya sebagai PNG. */
  const handleDownloadImage = () => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;

    const link = document.createElement("a");
    link.href = instance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#FFFFFF",
    });
    link.download = `${fileBaseName}.png`;
    link.click();
  };

  /** Unduh data yang sedang tampil (minggu x seri) sebagai XLSX. */
  const handleDownloadData = () => {
    const data = trend.data;
    if (!data?.weeks.length) return;

    const visible = series.filter((item) => !hiddenSeries.includes(item.name));
    const rows = data.weeks.map((week, index) => {
      const row: Record<string, string | number | null> = {
        Week: week,
        Periode: data.weekInfo[index] ?? "",
      };

      visible.forEach((item) => {
        row[formatSeriesName(item.name)] = item.data[index] ?? null;
      });

      return row;
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      "Trend",
    );
    XLSX.writeFile(workbook, `${fileBaseName}.xlsx`);
  };

  const option = useMemo<EChartsOption>(() => {
    const data = trend.data;
    const weeks = data?.weeks ?? [];
    const weekInfo = data?.weekInfo ?? [];
    const unit = data?.unit ?? "";

    const chartSeries: LineSeriesOption[] = series
      .map((item, index) => ({
        name: formatSeriesName(item.name),
        type: "line" as const,
        data: item.data,
        smooth: true,
        symbol: "circle" as const,
        symbolSize: 6,
        showSymbol: false,
        connectNulls: true,
        lineStyle: {
          width: 2,
          color: SERIES_COLORS[index % SERIES_COLORS.length],
        },
        itemStyle: { color: SERIES_COLORS[index % SERIES_COLORS.length] },
      }))
      .filter((_, index) => !hiddenSeries.includes(series[index].name));

    // Default tampilkan minggu terbaru saja; sisanya lewat slider.
    const total = weeks.length;
    const zoomStart =
      total > VISIBLE_WEEKS ? ((total - VISIBLE_WEEKS) / total) * 100 : 0;

    return {
      // Margin dalam piksel, bukan persen: waktu kartunya memanjang, ruang
      // ekstra jatuh ke area garis — bukan jadi celah kosong di bawah.
      grid: {
        top: 16,
        left: 8,
        right: 16,
        bottom: 44,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: "#CBD5E1" } },
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
        borderWidth: 1,
        padding: [6, 10],
        textStyle: { color: "#213c52", fontSize: 11 },
        formatter: (params) => {
          const points = Array.isArray(params) ? params : [params];
          const index = Number(points[0]?.dataIndex ?? 0);
          const info = weekInfo[index];
          const header = info
            ? `${weeks[index]} · ${info}`
            : (weeks[index] ?? "");

          const rows = points
            .map((point) => {
              const value = point.value;
              const text =
                value === null || value === undefined
                  ? "-"
                  : `${Number(value).toFixed(2)} ${unit}`;

              return `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px"><span>${point.marker ?? ""} ${point.seriesName ?? ""}</span><b>${text}</b></div>`;
            })
            .join("");

          return `<div style="font-weight:700;margin-bottom:4px">${header}</div>${rows}`;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: weeks,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#E2E8F0" } },
        axisLabel: { color: "#64748B", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: { lineStyle: { color: "#F1F5F9" } },
        axisLabel: { color: "#64748B", fontSize: 10 },
      },
      dataZoom: [
        {
          type: "slider",
          height: 12,
          bottom: 6,
          start: zoomStart,
          end: 100,
          textStyle: { color: "transparent" },
          handleSize: 8,
          fillerColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "#E2E8F0",
        },
        { type: "inside", start: zoomStart, end: 100 },
      ],
      series: chartSeries,
    };
  }, [trend.data, series, hiddenSeries]);

  const actionButtonClass =
    "flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#213c52] disabled:cursor-not-allowed disabled:opacity-50";

  const card = (
    <div
      className={`flex flex-1 min-h-0 flex-col border border-slate-200 bg-white p-3 shadow-xs ${roundedClassName}`}
    >
      <header className="mb-1 flex flex-wrap items-center justify-between gap-2 px-1">
        <h3 className="text-xs font-bold text-[#213c52]">{title}</h3>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={!series.length}
            title="Download PNG"
            aria-label="Download PNG"
            className={actionButtonClass}
          >
            <LuImage size={12} />
          </button>
          <button
            type="button"
            onClick={handleDownloadData}
            disabled={!series.length}
            title="Download data (XLSX)"
            aria-label="Download data"
            className={actionButtonClass}
          >
            <LuDownload size={12} />
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((current) => !current)}
            title={fullscreen ? "Keluar layar penuh" : "Layar penuh"}
            aria-label={fullscreen ? "Keluar layar penuh" : "Layar penuh"}
            className={actionButtonClass}
          >
            {fullscreen ? <LuMinimize2 size={12} /> : <LuMaximize2 size={12} />}
          </button>
        </div>
      </header>

      {/* Canvas echarts dipasang absolut supaya ukurannya tidak ikut
          menentukan tinggi alami kartu — kalau tidak, tinggi hasil render
          sebelumnya "mengunci" kartu dan kolom kiri ikut memanjang. */}
      <div className="relative w-full flex-1 min-h-40">
        <div className="absolute inset-0">
          <ReactECharts
            ref={chartRef}
            option={option}
            notMerge
            style={{ height: "100%", width: "100%" }}
          />
        </div>
        {(trend.isPending || trend.isError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] font-semibold text-slate-500">
            {trend.isError
              ? `Gagal memuat ${title.toLowerCase()}.`
              : "Memuat data trend..."}
          </div>
        )}
      </div>

    </div>
  );

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 p-4 backdrop-blur-sm"
        role="presentation"
        onClick={() => setFullscreen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white p-1 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {card}
        </div>
      </div>
    );
  }

  return card;
}
