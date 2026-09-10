import {
  DashboardOutlined,
  ExclamationCircleOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

interface SlaStatCardsProps {
  total: number;
  achieved: number;
  notAchieved: number;
  loading?: boolean;
}

interface StatCard {
  key: string;
  icon: ReactNode;
  label: string;
  value: string;
}

const SlaStatCards = ({
  total,
  achieved,
  notAchieved,
  loading = false,
}: SlaStatCardsProps) => {
  const cards: StatCard[] = [
    {
      key: "total",
      icon: <DashboardOutlined />,
      label: "Total Performance Indicator",
      value: String(total),
    },
    {
      key: "achieved",
      icon: <RocketOutlined />,
      label: "Indicators Achieved",
      value: String(achieved),
    },
    {
      key: "not-achieved",
      icon: <ExclamationCircleOutlined />,
      label: "Indicators Not Achieved",
      value: String(notAchieved),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#EBEBEB] bg-white px-5 py-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-lg text-[#18181B]">{card.icon}</span>
            <span className="truncate text-[15px] font-semibold text-[#18181B]">
              {card.label}
            </span>
          </div>
          {loading ? (
            <span className="h-6 w-10 shrink-0 animate-pulse rounded-full bg-[#F1F1F2]" />
          ) : (
            <span className="shrink-0 rounded-full bg-[#F4F4F5] px-2.5 py-1 text-xs font-medium text-[#71717A]">
              {card.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SlaStatCards;
