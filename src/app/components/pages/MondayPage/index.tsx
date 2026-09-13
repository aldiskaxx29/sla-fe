// React Icons
import { LuCalendar } from "react-icons/lu";

// Hooks
import { useLatestPacketLossWeekQuery } from "@/app/hooks/query/monday/slaPerformance";

// Organism
import { SlaPerformancePanel } from "@/app/components/organism/panels/SlaPerformancePanel";
import { TrendPerformancePanel } from "@/app/components/organism/panels/TrendPerformancePanel";
import { BaselinePerformancePanel } from "@/app/components/organism/panels/BaselinePerformancePanel";
import { WinningBenchmarkPanel } from "@/app/components/organism/panels/WinningBenchmarkPanel";

// Templates
import MondayTemplate from "@/app/components/templates/MondayTemplate";

// Utils
import { formatMondayWeekLabel } from "@/app/utils/monday.utils";

/** Monday Monitoring — sebelumnya iframe, kini komponen sendiri. */
const MondayPage = () => {
  // Minggu terakhir yang datanya sudah ada di server, dipakai juga oleh panel
  // SLA Performance — jadi keterangan periodenya ikut data, bukan ditulis tangan.
  const { data: latestWeek } = useLatestPacketLossWeekQuery();
  const weekLabel = formatMondayWeekLabel(latestWeek);

  const leftContent = (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-medium text-slate-500">
      <LuCalendar className="text-slate-400" size={13} />
      <span>Last Updated : {weekLabel || "memuat periode..."}</span>
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
