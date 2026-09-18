import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import * as echarts from "echarts";

import { Skeleton } from "@/app/components/atoms";

import { SectionCard } from "@/app/components/molecules/SectionCard";

import type {
  PeHsiGranularity,
  PeHsiTrendPoint,
  PeHsiUnachievedItem,
} from "@/app/types/network/peHsi.types";

const RANGE_OPTIONS: Array<{ label: string; value: PeHsiGranularity }> = [
  { label: "Hourly", value: "hourly" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

const LINE_COLOR = "#7c3aed";
const AREA_TOP = "rgba(124, 58, 237, 0.22)";
const AREA_BOTTOM = "rgba(124, 58, 237, 0.01)";

/** Jumlah baris link yang terlihat di tooltip; sisanya bisa di-scroll. */
const TOOLTIP_VISIBLE_ROWS = 4;
const TOOLTIP_ROW_HEIGHT = 30;
const TOOLTIP_ROW_GAP = 4;
const TOOLTIP_LIST_MAX_HEIGHT =
  TOOLTIP_VISIBLE_ROWS * TOOLTIP_ROW_HEIGHT +
  (TOOLTIP_VISIBLE_ROWS - 1) * TOOLTIP_ROW_GAP;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[char] ?? char;
  });

const renderUnachievedRow = (item: PeHsiUnachievedItem) => `
  <div style="display:flex;flex:none;align-items:center;justify-content:space-between;gap:12px;height:${TOOLTIP_ROW_HEIGHT}px;border-radius:8px;background:#f4f4f6;padding:0 10px;">
    <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#1f2937;">${escapeHtml(item.hostname)}</span>
    <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600;color:${LINE_COLOR};">${escapeHtml(item.verifierid)}</span>
  </div>
`;

interface PeHsiTrendChartProps {
  points: PeHsiTrendPoint[];
  /** Total link terpantau, dipakai sebagai penyebut "Not degrade: x/total". */
  totalLink?: number;
  range: PeHsiGranularity;
  onRangeChange: (value: PeHsiGranularity) => void;
  loading?: boolean;
  error?: boolean;
  onViewDetail?: () => void;
}

export function PeHsiTrendChart({
  points,
  totalLink,
  range,
  onRangeChange,
  loading = false,
  error = false,
  onViewDetail,
}: PeHsiTrendChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const values = points.map((point) => point.value);
    const maxValue = Math.max(0, ...values);
    const minValue = Math.min(...(values.length ? values : [0]));

    /** Sumbu dipersempit di sekitar data supaya naik-turunnya terbaca. */
    const padding = Math.max(4, Math.round((maxValue - minValue) * 0.6) || 4);

    return {
      grid: { top: 40, left: 8, right: 24, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: "#e9d5ff", width: 2 } },
        /** Bisa dimasuki kursor supaya daftar link panjang tetap bisa di-scroll. */
        enterable: true,
        appendToBody: true,
        backgroundColor: "transparent",
        borderWidth: 0,
        padding: 0,
        extraCssText: "box-shadow:none;padding:0;",
        formatter: (params) => {
          const first = Array.isArray(params) ? params[0] : params;
          const index = Number(first?.dataIndex ?? 0);
          const point = points[index];

          if (!point) return "";

          const unachieved = point.unachieved ?? [];
          const denominator = totalLink ?? point.value + unachieved.length;
          const rangeLabel =
            RANGE_OPTIONS.find((option) => option.value === range)?.label ??
            "Hourly";
          const isScrollable = unachieved.length > TOOLTIP_VISIBLE_ROWS;

          return `
            <div style="min-width:260px;border-radius:16px;border:1px solid #ece9f5;background:#ffffff;box-shadow:0 12px 28px rgba(15,23,42,0.12);padding:14px 16px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;font-weight:700;color:#0f172a;">${escapeHtml(point.label)}</span>
                <span style="border-radius:999px;background:#f1f0f6;padding:3px 10px;font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;">${escapeHtml(rangeLabel)}</span>
              </div>

              <div style="margin:10px 0;height:1px;background:#eef0f4;"></div>

              <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#475569;">
                Not degrade: <b style="color:#059669;">${point.value}</b>/${denominator}
                &nbsp;&nbsp;Issue: <b style="color:#dc2626;">${unachieved.length}</b> link
              </div>

              ${
                unachieved.length
                  ? `
                    <div style="margin:10px 0 6px;font-size:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;">
                      PE Bermasalah &middot; ${unachieved.length} PE
                    </div>
                    <div style="display:flex;flex-direction:column;gap:${TOOLTIP_ROW_GAP}px;max-height:${TOOLTIP_LIST_MAX_HEIGHT}px;overflow-y:auto;padding-right:${isScrollable ? 6 : 0}px;">
                      ${unachieved.map(renderUnachievedRow).join("")}
                    </div>
                    ${
                      isScrollable
                        ? `<div style="margin-top:6px;font-size:11px;color:#94a3b8;">Scroll untuk melihat semua link</div>`
                        : ""
                    }
                  `
                  : `<div style="margin-top:10px;font-size:11px;color:#94a3b8;">Semua link achieve pada periode ini.</div>`
              }
            </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: points.map((point) => point.label),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11, margin: 14 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: Math.max(0, minValue - padding),
        max: maxValue + padding,
        splitNumber: 3,
        axisLabel: { show: false },
        splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: values,
          symbol: "circle",
          symbolSize: 10,
          lineStyle: { color: LINE_COLOR, width: 3 },
          itemStyle: {
            color: "#ffffff",
            borderColor: LINE_COLOR,
            borderWidth: 3,
          },
          emphasis: {
            scale: 1.25,
            itemStyle: { borderColor: LINE_COLOR, borderWidth: 4 },
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: AREA_TOP },
              { offset: 1, color: AREA_BOTTOM },
            ]),
          },
          label: {
            show: true,
            position: "top",
            distance: 12,
            color: "#0f172a",
            fontSize: 12,
            fontWeight: 700,
          },
        },
      ],
    };
  }, [points, range, totalLink]);

  return (
    <SectionCard className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#020617]">
          Trend Summary Not Degrade
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-[#f1f5f9] p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onRangeChange(option.value)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                  range === option.value
                    ? "bg-white text-[#7c3aed] shadow-sm"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onViewDetail}
            className="cursor-pointer rounded-lg border border-[#e2e8f0] px-4 py-1.5 text-sm font-medium text-[#2563eb] transition-colors hover:bg-[#eff6ff]"
          >
            View Detail
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[240px] items-center">
          <Skeleton height={210} />
        </div>
      ) : error || !points.length ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-[#64748b]">
          {error ? "Gagal memuat trend summary." : "Data trend belum tersedia."}
        </div>
      ) : (
        <ReactECharts
          option={option}
          style={{ height: 260, width: "100%" }}
          notMerge
        />
      )}
    </SectionCard>
  );
}
