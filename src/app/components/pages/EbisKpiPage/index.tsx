import { useMemo, useState } from "react";
import { LuCalendarDays } from "react-icons/lu";

import { SampleDataBadge } from "@/app/components/molecules/SampleDataBadge";
import { DashboardToolbar } from "@/app/components/molecules/DashboardToolbar";
import { SectionCard } from "@/app/components/molecules/SectionCard";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { FbbSlaSummaryPanel } from "@/app/components/organisms/panels/FbbSlaSummaryPanel";
import { FbbSlaIndicatorTable } from "@/app/components/organisms/tables/FbbSlaIndicatorTable";

import DashboardContentTemplate from "@/app/components/templates/DashboardContentTemplate";

import {
  buildPeriodLabel,
  formatYearWeek,
  formatYearWeekShort,
  summarizeAchievements,
} from "@/app/utils/fbbSla.utils";
import { getStoredUserName, toInitials } from "@/app/utils/user.utils";

import { SAMPLE_EBIS_WEEKS, buildSampleEbisKpi } from "@/app/api/ebis";

const EbisKpiPage = () => {
  const [yearweek, setYearweek] = useState(SAMPLE_EBIS_WEEKS[0]);

  const rows = useMemo(() => buildSampleEbisKpi(yearweek), [yearweek]);

  const weekOptions = useMemo(
    () =>
      SAMPLE_EBIS_WEEKS.map((week) => ({
        label: formatYearWeek(week),
        value: week,
      })),
    [],
  );

  const summary = summarizeAchievements(rows);
  const periodLabel = buildPeriodLabel(rows, yearweek);
  const columnLabel = formatYearWeekShort(rows[0]?.yearweek ?? yearweek);

  return (
    <DashboardContentTemplate
      toolbar={
        <DashboardToolbar
          initials={toInitials(getStoredUserName())}
          actions={
            <SelectMenu
              value={yearweek}
              options={weekOptions}
              onChange={setYearweek}
              placeholder="Select Week"
              size="sm"
              className="[&_button]:h-8 [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:bg-[#f8fafc] [&_button]:px-3 [&_button]:text-sm [&_button]:font-medium"
            />
          }
        >
          <div className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.06)]">
            <LuCalendarDays className="size-5 shrink-0 text-[#64748b]" />
            <span className="text-sm font-medium whitespace-nowrap text-[#64748b]">
              {periodLabel}
            </span>
          </div>
        </DashboardToolbar>
      }
    >
      <FbbSlaSummaryPanel
        total={summary.total}
        achieved={summary.achieved}
        notAchieved={summary.notAchieved}
      />

      <SectionCard
        as="div"
        className="@container flex min-h-0 flex-1 flex-col gap-4 p-4"
      >
        <div className="flex w-full flex-wrap items-center justify-end gap-3">
          <SampleDataBadge />
          <span className="flex h-9 shrink-0 items-center rounded-full bg-[#f1f5f9] px-3 text-sm font-medium text-[#64748b]">
            Showing {rows.length} entries
          </span>
        </div>

        <FbbSlaIndicatorTable
          indicators={rows}
          periodLabel={columnLabel}
        />
      </SectionCard>
    </DashboardContentTemplate>
  );
};

export default EbisKpiPage;
