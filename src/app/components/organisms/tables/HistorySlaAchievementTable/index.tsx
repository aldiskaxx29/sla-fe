import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";
import Pagination from "@/app/components/molecules/Pagination";

import type {
  HistorySlaIndicator,
  HistorySlaQuarter,
  HistorySlaTableMeta,
} from "@/app/types/first-insight/historySla.types";

const QUARTER_COUNT = 4;
const MONTHS_PER_QUARTER = 3;
const SKELETON_ROWS = 8;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const borderCell = "border-r border-b border-[#e2e8f0]";
const stickyNo = "sticky left-0 w-12 min-w-12";
const stickyIndicator = "sticky left-12 w-[320px] min-w-[320px]";
const stickyThreshold = "sticky left-[368px] w-[100px] min-w-[100px]";

const PLACEHOLDER_QUARTERS = Array.from({ length: QUARTER_COUNT }, (_, index) => ({
  key: `q${index + 1}`,
  label: `Q${index + 1}`,
  months: Array.from({ length: MONTHS_PER_QUARTER }, (_, monthIndex) => ({
    key: `fm_${index * MONTHS_PER_QUARTER + monthIndex + 1}`,
    label: "FM",
  })),
}));

interface HistorySlaAchievementTableProps {
  indicators: HistorySlaIndicator[];
  meta?: HistorySlaTableMeta;
  loading?: boolean;
  error?: boolean;
  onPageChange: (page: number, perPage: number) => void;
}

export function HistorySlaAchievementTable({
  indicators,
  meta,
  loading = false,
  error = false,
  onPageChange,
}: HistorySlaAchievementTableProps) {
  const quarters = indicators[0]?.quarters ?? PLACEHOLDER_QUARTERS;
  const achievementColumns = quarters.reduce(
    (count, quarter) => count + quarter.months.length + 1,
    0,
  );

  return (
    <div className="flex flex-col">
      <div className="max-h-[560px] overflow-auto rounded-lg border border-[#e2e8f0]">
        <table className="w-full min-w-[1400px] border-separate border-spacing-0 text-sm text-[#020617]">
          <thead className="sticky top-0 z-20">
            <tr>
              <th
                rowSpan={3}
                className={`${stickyNo} ${borderCell} z-10 bg-[#f3f7fd] px-3 font-medium text-[#334155]`}
              >
                No
              </th>
              <th
                rowSpan={3}
                className={`${stickyIndicator} ${borderCell} z-10 bg-[#f3f7fd] px-4 font-medium text-[#334155]`}
              >
                Performance Indicator
              </th>
              <th
                rowSpan={3}
                className={`${stickyThreshold} ${borderCell} z-10 bg-[#f3f7fd] px-3 font-medium text-[#334155]`}
              >
                Threshold
              </th>
              <th
                colSpan={achievementColumns}
                className="h-9 border-b border-[#e2e8f0] bg-[#eaf2fc] font-medium text-[#334155]"
              >
                Achievement
              </th>
            </tr>

            <tr>
              {quarters.map((quarter, index) => (
                <th
                  key={quarter.key}
                  colSpan={quarter.months.length + 1}
                  className={`h-9 border-b border-[#e2e8f0] bg-[#d9e8fa] font-medium text-[#334155] ${
                    index !== quarters.length - 1 ? "border-r" : ""
                  }`}
                >
                  {quarter.label}
                </th>
              ))}
            </tr>

            <tr>
              {quarters.map((quarter) => (
                <QuarterHeader
                  key={quarter.key}
                  months={quarter.months.map((month) => month.label)}
                />
              ))}
            </tr>
          </thead>

          <tbody>
            {loading &&
              Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: achievementColumns + 3 }).map(
                    (_, cellIndex) => (
                      <td key={cellIndex} className={`${borderCell} h-11 px-3`}>
                        <Skeleton />
                      </td>
                    ),
                  )}
                </tr>
              ))}

            {!loading &&
              indicators.map((row) => (
                <tr key={`${row.no}-${row.indicator}`} className="group">
                  <td
                    className={`${stickyNo} ${borderCell} h-11 bg-white px-3 text-center group-hover:bg-[#f8fafc]`}
                  >
                    {row.no}
                  </td>
                  <td
                    className={`${stickyIndicator} ${borderCell} bg-white px-4 font-medium group-hover:bg-[#f8fafc]`}
                  >
                    {row.indicator}
                  </td>
                  <td
                    className={`${stickyThreshold} ${borderCell} bg-white px-3 text-center whitespace-nowrap group-hover:bg-[#f8fafc]`}
                  >
                    {row.threshold || "-"}
                  </td>

                  {row.quarters.map((quarter) => (
                    <QuarterCells key={quarter.key} quarter={quarter} />
                  ))}
                </tr>
              ))}

            {!loading && !indicators.length && (
              <tr>
                <td colSpan={achievementColumns + 3}>
                  <EmptyState
                    title={
                      error ? "Gagal memuat data History SLA." : "Data belum tersedia"
                    }
                    description={
                      error
                        ? undefined
                        : "Tidak ada indikator yang cocok dengan filter ini."
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
        <div className="pt-2">
          <Pagination
            current={meta.current_page}
            pageSize={meta.per_page}
            total={meta.total}
            onChange={onPageChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}

function QuarterHeader({ months }: { months: string[] }) {
  return (
    <>
      <th className="h-9 min-w-[88px] border-r border-b border-[#1e3a5f] bg-[#1e3a5f] px-2 font-medium whitespace-nowrap text-white">
        Target
      </th>
      {months.map((month, index) => (
        <th
          key={`${month}-${index}`}
          className={`${borderCell} h-9 min-w-[88px] bg-[#bcd6f5] px-2 font-medium whitespace-nowrap text-[#1e293b]`}
        >
          {month}
        </th>
      ))}
    </>
  );
}

function QuarterCells({ quarter }: { quarter: HistorySlaQuarter }) {
  return (
    <>
      <td
        className={`${borderCell} bg-[#dbe8f8] px-2 text-center font-medium tabular-nums`}
      >
        {quarter.target}
      </td>
      {quarter.months.map((month) => (
        <td
          key={month.key}
          className={`${borderCell} bg-[#eef5fd] px-2 text-center tabular-nums ${
            month.achieved ? "text-[#020617]" : "text-[#dc2626]"
          }`}
        >
          {month.value}
        </td>
      ))}
    </>
  );
}
