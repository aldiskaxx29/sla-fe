// React
import { useState } from "react";

// React Icons
import { LuCalendar, LuDownload } from "react-icons/lu";

// Molecules
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

// Organism
import { SlaPerformancePanel } from "@/app/components/organism/panels/SlaPerformancePanel";
import { TrendPerformancePanel } from "@/app/components/organism/panels/TrendPerformancePanel";
import { BaselinePerformancePanel } from "@/app/components/organism/panels/BaselinePerformancePanel";
import { WinningBenchmarkPanel } from "@/app/components/organism/panels/WinningBenchmarkPanel";

// Templates
import MondayTemplate from "@/app/components/templates/MondayTemplate";

const NATIONWIDE_OPTIONS = [
  { label: "Nationwide", value: "Nationwide" },
  { label: "Region 1", value: "Region 1" },
  { label: "Region 2", value: "Region 2" },
];

const WEEK_OPTIONS = [
  { label: "Select Week", value: "Select Week" },
  { label: "Week 24", value: "Week 24" },
  { label: "Week 23", value: "Week 23" },
];

/** Monday Monitoring — sebelumnya iframe, kini komponen sendiri. */
const MondayPage = () => {
  const [nationwide, setNationwide] = useState("Nationwide");
  const [week, setWeek] = useState("Select Week");

  const leftContent = (
    <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-medium text-slate-500">
      <LuCalendar className="text-slate-400" size={13} />
      <span>Last Updated : Week 24 (12 Juni 2026 - 18 Juni 2026)</span>
    </div>
  );

  const rightContent = (
    <>
      <SelectMenu
        value={nationwide}
        options={NATIONWIDE_OPTIONS}
        onChange={setNationwide}
        size="md"
      />
      <SelectMenu
        value={week}
        options={WEEK_OPTIONS}
        onChange={setWeek}
        size="md"
      />
      <button
        type="button"
        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white transition-all hover:from-purple-700 hover:to-indigo-700"
      >
        <LuDownload size={24} />
        <span>Export Report</span>
      </button>
    </>
  );

  return (
    <MondayTemplate
      leftContent={leftContent}
      rightContent={rightContent}
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
