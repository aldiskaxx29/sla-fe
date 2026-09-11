import { LuCircleAlert, LuGauge, LuRocket } from "react-icons/lu";

// Molecules
import { SummaryStatCard } from "@/app/components/molecules/SummaryStatCard";

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
      icon: <LuGauge size={18} />,
      label: "Total Performance Indicator",
      value: total,
    },
    {
      key: "achieved",
      icon: <LuRocket size={18} />,
      label: "Indicators Achieved",
      value: achieved,
    },
    {
      key: "not-achieved",
      icon: <LuCircleAlert size={18} />,
      label: "Indicators Not Achieved",
      value: notAchieved,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <SummaryStatCard
          key={card.key}
          icon={card.icon}
          label={card.label}
          value={card.value}
          loading={loading}
        />
      ))}
    </div>
  );
}
