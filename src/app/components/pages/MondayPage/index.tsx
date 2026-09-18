import { LuCalendar } from "react-icons/lu";

import { SlaPerformancePanel } from "@/app/components/organisms/panels/SlaPerformancePanel";
import { TrendPerformancePanel } from "@/app/components/organisms/panels/TrendPerformancePanel";
import { BaselinePerformancePanel } from "@/app/components/organisms/panels/BaselinePerformancePanel";
import { WinningBenchmarkPanel } from "@/app/components/organisms/panels/WinningBenchmarkPanel";

import MondayTemplate from "@/app/components/templates/MondayTemplate";

import {
  formatMondayWeekLabel,
  getLatestCompletedMondayYearWeek,
} from "@/app/utils/monday.utils";

const MondayPage = () => {
  // Label periode dihitung dari kalender (Jumat s/d Kamis terakhir yang sudah
  // selesai), bukan dari asset accessPl — asset kerap terbit terlambat
  // sehingga labelnya ketinggalan satu minggu.
  const latestWeek = getLatestCompletedMondayYearWeek();
  const weekLabel = formatMondayWeekLabel(latestWeek);

  const week = Number(String(latestWeek).slice(4));
  const prevWeek = Number.isFinite(week) && week > 1 ? week - 1 : null;

  const leftContent = (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-medium text-slate-500">
      <LuCalendar className="text-slate-400" size={13} />
      <span>Last Updated : {weekLabel || "memuat periode..."}</span>
      {prevWeek !== null && (
        <span className="text-cyan-500">
          , Untuk Access Week {prevWeek}
        </span>
      )}
    </div>
  );

  return (
    <MondayTemplate
      leftContent={leftContent}
      className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12"
    >
      <div className="col-span-12 flex flex-col lg:col-span-4">
        <SlaPerformancePanel />
      </div>

      <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
        <TrendPerformancePanel />
      </div>

      <div className="col-span-12 flex flex-col gap-4 lg:col-span-4">
        <BaselinePerformancePanel />
        <WinningBenchmarkPanel />
      </div>
    </MondayTemplate>
  );
};

export default MondayPage;
