import { Skeleton } from "@/app/components/atoms";

import { EmptyState } from "@/app/components/molecules/EmptyState";

import type {
  HistorySlaIndicator,
  HistorySlaValueType,
} from "@/app/types/first-insight/historySla.types";

const QUARTER_COUNT = 4;
const SKELETON_ROWS = 8;

const borderCell = "border-r border-b border-[#e2e8f0]";
const stickyNo = "sticky left-0 w-12 min-w-12";
const stickyIndicator = "sticky left-12 w-[320px] min-w-[320px]";
const stickyThreshold = "sticky left-[368px] w-[100px] min-w-[100px]";

const formatValue = (value: number, type: HistorySlaValueType) =>
  type === "percent"
    ? `${value.toLocaleString("en-US", {
        minimumFractionDigits: value === 100 ? 0 : 2,
        maximumFractionDigits: 2,
      })}%`
    : value.toLocaleString("en-US");

interface HistorySlaAchievementTableProps {
  indicators: HistorySlaIndicator[];
  loading?: boolean;
}

export function HistorySlaAchievementTable({
  indicators,
  loading = false,
}: HistorySlaAchievementTableProps) {
  const quarterLabels =
    indicators[0]?.quarters.map((quarter) => quarter.label) ??
    Array.from({ length: QUARTER_COUNT }, (_, index) => `Q${index + 1}`);
  const monthLabels =
    indicators[0]?.quarters.map((quarter) =>
      quarter.months.map((month) => month.label),
    ) ?? Array.from({ length: QUARTER_COUNT }, () => ["", "", ""]);

  const achievementColumns = quarterLabels.length * 4;

  return (
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
            {quarterLabels.map((label, index) => (
              <th
                key={label}
                colSpan={4}
                className={`h-9 border-b border-[#e2e8f0] bg-[#d9e8fa] font-medium text-[#334155] ${
                  index !== quarterLabels.length - 1 ? "border-r" : ""
                }`}
              >
                {label}
              </th>
            ))}
          </tr>

          <tr>
            {monthLabels.map((months, quarterIndex) => (
              <QuarterHeader
                key={quarterLabels[quarterIndex]}
                months={months}
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
              <tr key={row.no} className="group">
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
                  {row.threshold}
                </td>

                {row.quarters.map((quarter) => (
                  <QuarterCells
                    key={quarter.label}
                    quarter={quarter}
                    valueType={row.value_type}
                  />
                ))}
              </tr>
            ))}

          {!loading && !indicators.length && (
            <tr>
              <td colSpan={achievementColumns + 3}>
                <EmptyState
                  title="Data belum tersedia"
                  description="Tidak ada indikator yang cocok dengan filter ini."
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

function QuarterCells({
  quarter,
  valueType,
}: {
  quarter: HistorySlaIndicator["quarters"][number];
  valueType: HistorySlaValueType;
}) {
  return (
    <>
      <td
        className={`${borderCell} bg-[#dbe8f8] px-2 text-center font-medium tabular-nums`}
      >
        {formatValue(quarter.target, valueType)}
      </td>
      {quarter.months.map((month) => (
        <td
          key={month.label}
          className={`${borderCell} bg-[#eef5fd] px-2 text-center tabular-nums ${
            month.achieved ? "text-[#020617]" : "text-[#dc2626]"
          }`}
        >
          {formatValue(month.value, valueType)}
        </td>
      ))}
    </>
  );
}
