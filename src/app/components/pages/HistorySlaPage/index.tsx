import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";

import { useDebouncedSearch } from "@/app/hooks/custom/pacer";
import {
  useHistorySlaHighlightSummaryQuery,
  useHistorySlaTableQuery,
  useHistorySlaTrendQuery,
  useUrlPagination,
} from "@/app/hooks";

import { SectionCard } from "@/app/components/molecules/SectionCard";
import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { HistorySlaTrendChart } from "@/app/components/organisms/charts/HistorySlaTrendChart";
import { HistorySlaHighlightPanel } from "@/app/components/organisms/panels/HistorySlaHighlightPanel";
import { HistorySlaAchievementTable } from "@/app/components/organisms/tables/HistorySlaAchievementTable";

import DashboardContentTemplate from "@/app/components/templates/DashboardContentTemplate";

const ALL_KPI = "";
const ALL_KPI_LABEL = "All KPI";
const TABLE_PER_PAGE = 10;

const HistorySlaPage = () => {
  const [search, setSearch] = useState("");
  const [kpiCategory, setKpiCategory] = useState(ALL_KPI);
  const pagination = useUrlPagination({ defaultPerPage: TABLE_PER_PAGE });

  const debouncedSearch = useDebouncedSearch(search.trim());

  const highlight = useHistorySlaHighlightSummaryQuery();
  const trend = useHistorySlaTrendQuery();
  const table = useHistorySlaTableQuery({
    kpiCategory,
    search: debouncedSearch,
    page: pagination.page,
    perPage: pagination.perPage,
  });

  const kpiOptions = useMemo(() => {
    const categories = (table.data?.categoryOptions ?? []).filter(
      (option) => option.toLowerCase() !== ALL_KPI_LABEL.toLowerCase(),
    );

    return [
      { label: ALL_KPI_LABEL, value: ALL_KPI },
      ...categories.map((category) => ({ label: category, value: category })),
    ];
  }, [table.data?.categoryOptions]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    pagination.resetPage();
  };

  const handleKpiCategoryChange = (value: string) => {
    setKpiCategory(value);
    pagination.resetPage();
  };

  return (
    <DashboardContentTemplate>
      <div className="grid shrink-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <HistorySlaHighlightPanel
          totalNotAchieved={highlight.data?.total_kpi_not_achieved.value ?? 0}
          totalKpi={highlight.data?.total_kpi_not_achieved.total ?? 0}
          breakdown={highlight.data?.breakdown ?? []}
          loading={highlight.isFetching}
          error={highlight.isError}
        />
        <HistorySlaTrendChart
          points={trend.data?.points ?? []}
          activeMonth={trend.data?.activeMonth}
          loading={trend.isFetching}
          error={trend.isError}
        />
      </div>

      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-10 w-full items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 focus-within:border-[#cbd5e1] sm:w-[320px]">
              <LuSearch className="size-4 shrink-0 text-[#64748b]" />
              <input
                type="search"
                value={search}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-[#020617] outline-none placeholder:text-[#64748b]"
              />
            </label>

            <SelectMenu
              value={kpiCategory}
              options={kpiOptions}
              onChange={handleKpiCategoryChange}
              className="relative z-50 [&_button]:h-10 [&_button]:w-[200px] [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:px-4 [&_button]:text-sm [&_button]:text-[#020617]"
            />
          </div>

          <span className="flex h-9 shrink-0 items-center rounded-full bg-[#f1f5f9] px-3 text-sm font-medium text-[#64748b]">
            Showing {table.data?.meta?.total ?? 0} entries
          </span>
        </div>

        <HistorySlaAchievementTable
          indicators={table.data?.rows ?? []}
          meta={table.data?.meta}
          loading={table.isFetching}
          error={table.isError}
          onPageChange={pagination.setPagination}
        />
      </SectionCard>
    </DashboardContentTemplate>
  );
};

export default HistorySlaPage;
