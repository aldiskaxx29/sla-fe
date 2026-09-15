import { useMemo, useState } from "react";
import { LuSearch } from "react-icons/lu";

import { useHistorySlaQuery } from "@/app/hooks";

import { SelectMenu } from "@/app/components/molecules/SelectMenu";

import { HistorySlaTrendChart } from "@/app/components/organism/charts/HistorySlaTrendChart";
import { HistorySlaHighlightPanel } from "@/app/components/organism/panels/HistorySlaHighlightPanel";
import { HistorySlaAchievementTable } from "@/app/components/organism/tables/HistorySlaAchievementTable";

const ALL_KPI = "";

const HistorySlaPage = () => {
  const [search, setSearch] = useState("");
  const [kpi, setKpi] = useState(ALL_KPI);

  const { data, isFetching } = useHistorySlaQuery();

  const indicators = useMemo(() => data?.indicators ?? [], [data]);

  const kpiOptions = useMemo(
    () => [
      { label: "All KPI", value: ALL_KPI },
      ...Array.from(new Set(indicators.map((row) => row.kpi))).map(
        (value) => ({ label: value, value }),
      ),
    ],
    [indicators],
  );

  const filteredIndicators = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return indicators.filter(
      (row) =>
        (kpi === ALL_KPI || row.kpi === kpi) &&
        (!keyword || row.indicator.toLowerCase().includes(keyword)),
    );
  }, [indicators, kpi, search]);

  return (
    <main className="flex flex-1 flex-col px-6 pt-2 pb-6">
      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[36px] border border-[#e2e8f0] bg-white p-4">
        <div className="grid shrink-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <HistorySlaHighlightPanel
            totalNotAchieved={data?.total_not_achieved ?? 0}
            totalKpi={data?.total_kpi ?? 0}
            segments={data?.segments ?? []}
            loading={isFetching}
          />
          <HistorySlaTrendChart
            points={data?.trend ?? []}
            loading={isFetching}
          />
        </div>

        <section className="flex flex-col gap-4 rounded-[19px] border border-[#e2e8f0] bg-white p-4 shadow-[0px_1px_1.75px_0px_rgba(0,0,0,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-10 w-full items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 focus-within:border-[#cbd5e1] sm:w-[320px]">
                <LuSearch className="size-4 shrink-0 text-[#64748b]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent text-sm text-[#020617] outline-none placeholder:text-[#64748b]"
                />
              </label>

              <SelectMenu
                value={kpi}
                options={kpiOptions}
                onChange={setKpi}
                className="relative z-50 [&_button]:h-10 [&_button]:w-[200px] [&_button]:rounded-full [&_button]:border-[#e2e8f0] [&_button]:px-4 [&_button]:text-sm [&_button]:text-[#020617]"
              />
            </div>

            <span className="flex h-9 shrink-0 items-center rounded-full bg-[#f1f5f9] px-3 text-sm font-medium text-[#64748b]">
              Showing {filteredIndicators.length} entries
            </span>
          </div>

          <HistorySlaAchievementTable
            indicators={filteredIndicators}
            loading={isFetching}
          />
        </section>
      </div>
    </main>
  );
};

export default HistorySlaPage;
