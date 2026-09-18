import { LuTriangleAlert } from "react-icons/lu";

import { Skeleton } from "@/app/components/atoms";

import { SectionCard } from "@/app/components/molecules/SectionCard";

import ResumeRcaStackedChart from "@/app/components/organisms/charts/ResumeRcaStackedChart";

interface ResumeRcaHighlightPanelProps {
  nationalTotal: number;
  labels: string[];
  ogp: number[];
  closed: number[];
  loadingTotal?: boolean;
  loadingChart?: boolean;
  error?: boolean;
  onBarClick: (label: string, status: string) => void;
}

export function ResumeRcaHighlightPanel({
  nationalTotal,
  labels,
  ogp,
  closed,
  loadingTotal = false,
  loadingChart = false,
  error = false,
  onBarClick,
}: ResumeRcaHighlightPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <SectionCard className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[#020617]">Nasional</h2>
          <span className="flex size-9 items-center justify-center rounded-full bg-[#fdebe1] text-[#e2560d]">
            <LuTriangleAlert size={18} />
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-[#e8f2fd] to-[#f8fafc] py-6">
          {loadingTotal ? (
            <Skeleton height={44} width={96} />
          ) : (
            <span className="text-4xl font-bold text-[#dc2626]">
              {nationalTotal}
            </span>
          )}
          <span className="text-xs font-semibold tracking-wide text-[#475569]">
            SITE NOT CLEAR
          </span>
        </div>
      </SectionCard>

      <SectionCard className="flex min-w-0 flex-col gap-3 p-4">
        <h2 className="text-base font-semibold text-[#020617]">
          Progress RCA per Kategori
        </h2>

        <ResumeRcaStackedChart
          labels={labels}
          ogp={ogp}
          closed={closed}
          loading={loadingChart}
          error={error}
          onBarClick={onBarClick}
        />
      </SectionCard>
    </div>
  );
}

export default ResumeRcaHighlightPanel;
