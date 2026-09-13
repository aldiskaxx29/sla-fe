import { LuGauge, LuMonitorCheck, LuMonitorX } from "react-icons/lu";

// Molecules
import { KpiStatCard } from "@/app/components/molecules/KpiStatCard";

interface FbbSlaSummaryPanelProps {
  total: number;
  achieved: number;
  notAchieved: number;
  loading?: boolean;
}

/** Tiga kartu ringkasan di atas tabel indikator SLA WISA FBB. */
export function FbbSlaSummaryPanel({
  total,
  achieved,
  notAchieved,
  loading = false,
}: FbbSlaSummaryPanelProps) {
  const cards = [
    {
      key: "total",
      icon: LuGauge,
      label: "Total Performance Indicator",
      value: total,
      valueClassName: "text-[#050505]",
    },
    {
      key: "achieved",
      icon: LuMonitorCheck,
      label: "Indicators Achieved",
      value: achieved,
      valueClassName: "text-[#21a647]",
    },
    {
      key: "not-achieved",
      icon: LuMonitorX,
      label: "Indicators Not Achieved",
      value: notAchieved,
      valueClassName: "text-[#c23837]",
    },
  ];

  return (
    <div className="flex shrink-0 flex-wrap gap-3">
      {cards.map((card) => (
        <KpiStatCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={card.value}
          valueClassName={card.valueClassName}
          loading={loading}
        />
      ))}
    </div>
  );
}
