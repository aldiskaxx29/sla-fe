import { useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { FaExclamationTriangle } from "react-icons/fa";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";
import { NotchedCard } from "@/app/components/molecules/NotchedCard";
import {
  useLatestPacketLossWeekQuery,
  useSlaPerformanceQuery,
} from "@/app/hooks/query/monday/slaPerformance";
import type {
  SlaPeriod,
  SlaRekon,
} from "@/app/types/monday/slaPerformance.types";
import type {
  MetricSubCard,
  SLAMetricCard,
  SlaCardDetail,
} from "@/app/types/monday/ticketQuality.types";
import { SlaDetailModal } from "@/app/components/organism/panels/SlaPerformancePanel/SlaDetailModal";

/**
 * Tiap grup menempati kolom sesuai jumlah sub-kartunya, jadi barisnya terbagi
 * 3:2 (Packet Loss vs Latency) dan 2:3 (Jitter vs MTTR) seperti desain.
 */
const GROUP_ROWS: { title: string; span: string }[][] = [
  [
    { title: "Packet Loss", span: "lg:col-span-3" },
    { title: "Latency", span: "lg:col-span-2" },
  ],
  [
    { title: "Jitter", span: "lg:col-span-2" },
    { title: "MTTR", span: "lg:col-span-3" },
  ],
];

/** Angka Before/Current menyesuaikan lebar layar, lihat SubCard. */
const VALUE_FONT_SIZE = "clamp(11px, 1.05vw, 20px)";

/** Ikon status di kepala sub-kartu. */
function StatusBadge({ status }: { status: MetricSubCard["status"] }) {
  if (status === "success") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
        <LuCheck size={9} />
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
        <FaExclamationTriangle size={8} />
      </span>
    );
  }

  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
      <LuX size={9} />
    </span>
  );
}

/** Satu kolom metrik di dalam grup, mis. "Packet Loss Core". */
function SubCard({
  card,
  onOpenDetail,
}: {
  card: MetricSubCard;
  onOpenDetail: (detail: SlaCardDetail) => void;
}) {
  const headerTone =
    card.status === "success"
      ? "bg-emerald-50"
      : card.status === "warning"
        ? "bg-amber-50"
        : "bg-red-50";

  return (
    <div
      onClick={() => card.detail && onOpenDetail(card.detail)}
      className={`flex min-w-0 flex-col border-l border-slate-200 bg-white first:border-l-0 ${
        card.detail ? "cursor-pointer hover:bg-slate-50/70" : ""
      }`}
    >
      <header
        className={`flex items-center justify-center gap-1.5 px-2 py-1.5 ${headerTone}`}
      >
        <StatusBadge status={card.status} />
        <span className="truncate text-[11px] font-extrabold text-navy">
          {card.name}
        </span>
      </header>

      <div className="flex flex-1 flex-col px-2 py-2">
        {card.beforeValue || card.currentValue ? (
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <div className="flex flex-col items-center">
              <span
                className="font-extrabold leading-none text-navy"
                style={{ fontSize: VALUE_FONT_SIZE }}
              >
                {card.beforeValue}
              </span>
              <span className="mt-1 text-[9px] font-bold text-slate-400">
                {card.beforeLabel ?? "(Before)"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-baseline justify-center gap-0.5">
                <span
                  className="font-extrabold leading-none text-navy"
                  style={{ fontSize: VALUE_FONT_SIZE }}
                >
                  {card.currentValue}
                </span>
                {card.trend && (
                  <span
                    className={`text-[9px] font-bold ${
                      card.trend.color === "green"
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {card.trend.direction === "up" ? "↑" : "↓"}
                    {card.trend.value}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[9px] font-bold text-slate-400">
                {card.currentLabel ?? "(Current)"}
              </span>
            </div>
          </div>
        ) : null}

        {card.tableData && (
          <table className="mt-1 w-full table-fixed text-left text-[9px]">
            <thead>
              <tr className="border-b border-slate-100 font-semibold text-slate-400">
                <th className="py-1">Area</th>
                <th className="py-1 text-center">Target</th>
                <th className="py-1 text-right">Ach</th>
              </tr>
            </thead>
            <tbody>
              {card.tableData.map((row) => (
                <tr
                  key={row.area}
                  className="font-extrabold text-slate-700 last:border-0"
                >
                  <td className="py-0.5 truncate">{row.area}</td>
                  <td className="py-0.5 text-center">{row.target}</td>
                  <td
                    className={`py-0.5 text-right ${
                      row.ach >= row.target ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {row.ach}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {card.nestedData && card.nestedData.total !== undefined && (
          <div className="mt-2 flex items-center justify-between gap-2 text-[9px] font-bold text-slate-500">
            <span className="whitespace-nowrap">
              {card.nestedData.totalLabel ?? "T"}: {card.nestedData.total} Site
            </span>
            {card.nestedData.regNotClear !== undefined && (
              <span className="whitespace-nowrap text-red-500">
                Reg Not Clear: {card.nestedData.regNotClear}
              </span>
            )}
          </div>
        )}

        {card.worstText && (
          <div className="mt-1.5 text-center text-[9px] font-extrabold text-red-500">
            {card.worstText}
          </div>
        )}

        {card.nestedData?.worstReg && (
          <div className="mt-1.5 text-center text-[9px] font-extrabold text-red-500">
            Worst Reg: {card.nestedData.worstReg}
          </div>
        )}
      </div>
    </div>
  );
}

/** Kartu satu metrik: judul grup di atas, sub-kartu berjajar di bawahnya. */
function MetricGroupCard({
  group,
  className = "",
  onOpenDetail,
}: {
  group: SLAMetricCard;
  className?: string;
  onOpenDetail: (detail: SlaCardDetail) => void;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs ${className}`}
    >
      <div className="shrink-0 border-b border-slate-200 bg-white py-1.5 text-center text-[12px] font-extrabold text-navy">
        {group.title}
      </div>

      <div
        className="grid flex-1 border-t border-slate-100"
        style={{
          gridTemplateColumns: `repeat(${group.subCards.length}, minmax(0, 1fr))`,
        }}
      >
        {group.subCards.map((card) => (
          <SubCard key={card.id} card={card} onOpenDetail={onOpenDetail} />
        ))}
      </div>
    </div>
  );
}

export function SlaPerformancePanel() {
  const [period, setPeriod] = useState<SlaPeriod>("week");
  const [rekon, setRekon] = useState<SlaRekon>("before");
  const [activeDetail, setActiveDetail] = useState<SlaCardDetail | null>(null);

  // Periode di-anchor ke minggu terakhir yang datanya ada di server.
  const { data: latestWeek } = useLatestPacketLossWeekQuery();

  const {
    data: metrics = [],
    isPending,
    isError,
  } = useSlaPerformanceQuery(latestWeek ?? null, rekon, period);

  const headerLeft = (
    <>
      <SelectMenu
        value={period}
        onChange={(value) => setPeriod(value as SlaPeriod)}
        options={[
          { label: "Week", value: "week" },
          { label: "Month", value: "month" },
        ]}
        size="sm"
        variant="gray"
        className="text-[11px] font-semibold"
      />
      <SelectMenu
        value={rekon}
        onChange={(value) => setRekon(value as SlaRekon)}
        options={[
          { label: "Before Rekon", value: "before" },
          { label: "After Rekon", value: "after" },
        ]}
        size="sm"
        variant="gray"
        className="text-[11px] font-semibold"
      />
    </>
  );

  const headerRight = (
    <div className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[9px] font-semibold whitespace-nowrap text-slate-600 shadow-2xs select-none">
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
          <LuCheck size={8} />
        </span>
        <span>Achievement</span>
      </div>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
          <FaExclamationTriangle size={8} />
        </span>
        <span>MSA Ach &amp; CNOP Not Ach</span>
      </div>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <LuX size={8} />
        </span>
        <span>Not Achievement</span>
      </div>
    </div>
  );

  return (
    <NotchedCard
      title="SLA Performance"
      notchWidth={330}
      headerLeft={headerLeft}
      headerRight={headerRight}
    >
      {(isPending || isError) && (
        <div className="mt-3 flex min-h-52 flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 text-[11px] font-semibold text-slate-500">
          {isError
            ? "Gagal memuat data SLA Performance."
            : "Memuat data SLA Performance..."}
        </div>
      )}

      {!isPending && !isError && (
        <div className="mt-3 flex flex-1 flex-col gap-3">
          {GROUP_ROWS.map((row, rowIndex) => {
            const groups = row
              .map((item) => ({
                span: item.span,
                group: metrics.find((metric) => metric.title === item.title),
              }))
              .filter(
                (item): item is { span: string; group: SLAMetricCard } =>
                  Boolean(item.group),
              );

            if (!groups.length) return null;

            return (
              <div
                key={rowIndex}
                className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-5"
              >
                {groups.map(({ group, span }) => (
                  <MetricGroupCard
                    key={group.title}
                    group={group}
                    className={span}
                    onOpenDetail={setActiveDetail}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      <SlaDetailModal
        detail={activeDetail}
        onClose={() => setActiveDetail(null)}
      />
    </NotchedCard>
  );
}
