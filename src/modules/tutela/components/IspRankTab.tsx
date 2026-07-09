import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { normalizeProviderId } from "../constants/providers";

// Provider colors matching the reference app
const PROVIDER_COLORS: Record<string, string> = {
  indihome: "#E42313",
  "wifi.id": "#72120A",
  "telkomsel wifi": "#ED1D61",
  biznet: "#F05422",
  myrepublic: "#922A8F",
  cbn: "#0066B3",
  mnc: "#F0D12C",
  firstmedia: "#E9C874",
  iconnets: "#0293AE",
  "oxygen.id": "#0B8344",
  oxygen: "#0B8344",
  "xl home": "#00B38F",
  xlhome: "#00B38F",
  starlink: "#262626",
  megavision: "#0a5e9a",
  "indosat hifi": "#d9117c",
  indosathifi: "#d9117c",
};

const getColor = (operator: string) =>
  PROVIDER_COLORS[operator?.toLowerCase()] ?? "#94a3b8";

const getOrdinalSuffix = (n: number) => {
  if (!n) return "–";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

interface KpiCardDef {
  title: string;
  key: string;
  unit: string;
  icon: string;
  lowerIsBetter: boolean;
}

const KPI_CARDS: KpiCardDef[] = [
  { title: "Latency", key: "latency", unit: "ms", icon: "⏱", lowerIsBetter: true },
  { title: "Jitter", key: "jitter", unit: "ms", icon: "〰️", lowerIsBetter: true },
  { title: "Packet Loss", key: "packetloss", unit: "%", icon: "📡", lowerIsBetter: true },
];

interface RankEntry {
  operator: string;
  mean: number | null;
  rank: number | null;
  previous?: { mean: number | null; rank: number | null };
}

interface IspRankTabProps {
  ispRankData: Record<string, RankEntry[]> | null;
  providerPriority: "nine" | "all";
  granularity: string;
  level: string;
  location: string;
}

const LIST_SIZE = 6;

const KpiBarChart: React.FC<{ data: RankEntry[] }> = ({ data }) => {
  const ranked = [...data]
    .filter((d) => d.mean != null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  // Always show 6 providers, but keep Indihome pinned: if Indihome ranks beyond
  // the top 6, show the top 5 plus Indihome at its real rank (e.g. 1-5 + #7).
  const isIndihome = (d: RankEntry) => normalizeProviderId(d.operator) === "indihome";
  let sorted = ranked.slice(0, LIST_SIZE);
  const indihome = ranked.find(isIndihome);
  if (indihome && !sorted.some(isIndihome)) {
    sorted = ranked.slice(0, LIST_SIZE - 1).concat(indihome);
  }

  // Pad to LIST_SIZE
  while (sorted.length < LIST_SIZE) {
    sorted.push({ operator: "", mean: null, rank: sorted.length + 1 });
  }

  const reversed = [...sorted].reverse();
  const maxVal = Math.max(...sorted.map((d) => d.mean ?? 0), 1);

  const option = {
    grid: { left: 90, right: 50, top: 6, bottom: 6 },
    xAxis: {
      type: "value",
      max: maxVal * 1.2,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: reversed.map((d) => d.operator || ""),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        fontSize: 11,
        fontWeight: "bold",
        color: "#475569",
        formatter: (val: string, idx: number) => {
          const item = reversed[idx];
          const rk = item.rank ?? (sorted.length - idx);
          return item.mean == null ? `${rk}. –` : `${rk}. ${val || "–"}`;
        },
      },
    },
    series: [
      {
        type: "bar",
        data: reversed.map((d) => ({
          value: d.mean != null ? Number(d.mean.toFixed(2)) : null,
          itemStyle: {
            color: getColor(d.operator),
            opacity: d.mean != null ? 1 : 0,
          },
        })),
        barWidth: 14,
        showBackground: true,
        backgroundStyle: { color: "#f1f5f9" },
        label: {
          show: true,
          position: "right",
          fontSize: 10,
          color: "#64748b",
          fontWeight: "bold",
          formatter: (p: any) => (p.value != null ? String(p.value) : ""),
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "none" },
      formatter: (params: any) => {
        if (!Array.isArray(params) || !params[0]) return "";
        const item = reversed[params[0].dataIndex];
        if (item.mean == null) return "";
        const color = getColor(item.operator);
        return `<div style="display:flex;align-items:center;gap:6px;font-size:12px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span>
          <b>${item.operator}</b>: ${item.mean?.toFixed(2)}
        </div>`;
      },
    },
  };

  return (
    <ReactECharts
      style={{ height: "100%", width: "100%" }}
      option={option}
      opts={{ renderer: "canvas" }}
    />
  );
};

const KpiCard: React.FC<{ cardDef: KpiCardDef; data: RankEntry[] | undefined }> = ({
  cardDef,
  data,
}) => {
  const indihomeEntry = useMemo(
    () => data?.find((d) => d.operator?.toLowerCase() === "indihome"),
    [data]
  );

  const curRank = indihomeEntry?.rank ?? null;
  const prevRank = indihomeEntry?.previous?.rank ?? null;
  const curMean = indihomeEntry?.mean ?? null;
  const prevMean = indihomeEntry?.previous?.mean ?? null;

  const rankChanged =
    curRank != null && prevRank != null ? curRank - prevRank : null;
  const meanChanged =
    curMean != null && prevMean != null ? curMean - prevMean : null;

  const rankArrow =
    rankChanged == null
      ? "→"
      : rankChanged < 0
      ? "↑"
      : rankChanged > 0
      ? "↓"
      : "→";
  const rankColor =
    rankChanged == null
      ? "text-slate-400"
      : rankChanged < 0
      ? "text-green-600"
      : rankChanged > 0
      ? "text-red-500"
      : "text-slate-400";

  const meanArrow =
    meanChanged == null
      ? "→"
      : cardDef.lowerIsBetter
      ? meanChanged < 0
        ? "↑"
        : meanChanged > 0
        ? "↓"
        : "→"
      : meanChanged > 0
      ? "↑"
      : meanChanged < 0
      ? "↓"
      : "→";

  const meanGoodDown = cardDef.lowerIsBetter ? meanChanged != null && meanChanged < 0 : meanChanged != null && meanChanged > 0;
  const meanBadUp = cardDef.lowerIsBetter ? meanChanged != null && meanChanged > 0 : meanChanged != null && meanChanged < 0;
  const meanColor = meanGoodDown ? "text-green-600" : meanBadUp ? "text-red-500" : "text-slate-400";

  return (
    <div className="flex flex-col border-2 border-blue-100 bg-white rounded-xl overflow-hidden shadow-sm min-h-[220px]">
      {/* Header */}
      <div className="px-4 pt-3 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="text-base">{cardDef.icon}</span>
          <span>{cardDef.title}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-start justify-between px-4 py-2">
        {/* Rank */}
        <div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Rank</div>
          <div className="text-3xl font-black text-slate-800">
            {getOrdinalSuffix(curRank ?? 0)}
          </div>
          <div className={`text-xs font-semibold mt-0.5 flex items-center gap-1 ${rankColor}`}>
            <span>{rankArrow}</span>
            <span>
              {prevRank != null && curRank != null && prevRank !== curRank
                ? getOrdinalSuffix(prevRank)
                : "No Change"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-slate-100 self-stretch mx-2" />

        {/* Value */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{cardDef.unit}</div>
          <div className="text-3xl font-black text-slate-800">
            {curMean != null ? curMean.toFixed(2) : "–"}
          </div>
          {meanChanged != null && prevMean != null && prevMean > 0 ? (
            <div className={`text-xs font-semibold mt-0.5 flex items-center gap-1 justify-end ${meanColor}`}>
              <span>{meanArrow}</span>
              <span>
                {meanChanged >= 0 ? "+" : ""}{meanChanged.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-300 mt-0.5">–</div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 mx-3" />

      {/* Bar Chart */}
      <div className="flex-1 min-h-[110px] px-1 py-1">
        {data && data.some((d) => d.mean != null) ? (
          <KpiBarChart data={data} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300 text-sm">
            No Data
          </div>
        )}
      </div>
    </div>
  );
};

export const IspRankTab: React.FC<IspRankTabProps> = ({
  ispRankData,
}) => {
  // Show 4 cards per page (first 4 KPIs)
  const displayCards = KPI_CARDS.slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      {/* First page: 4 KPIs in 2×2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayCards.map((card) => (
          <KpiCard
            key={card.key}
            cardDef={card}
            data={ispRankData?.[card.key]}
          />
        ))}
      </div>

      {/* Second page: remaining KPIs */}
      {KPI_CARDS.length > 4 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {KPI_CARDS.slice(4).map((card) => (
            <KpiCard
              key={card.key}
              cardDef={card}
              data={ispRankData?.[card.key]}
            />
          ))}
        </div>
      )}
    </div>
  );
};
