import { Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

interface TableHistoryWeeklyProps {
  dataSource: Record<string, any>[] | { data?: Record<string, any>[] };
  loadingMainData?: boolean;
  weeklyKpi?: string;
}

interface ParsedWeek {
  key: string;
  weekNum: number;
  monthNum: number;
}

const TableHistoryWeekly: React.FC<TableHistoryWeeklyProps> = ({
  dataSource,
  loadingMainData = false,
  weeklyKpi,
}) => {
  const data: Record<string, any>[] = useMemo(() => {
    if (Array.isArray(dataSource)) return dataSource;
    if (Array.isArray((dataSource as any)?.data)) return (dataSource as any).data;
    if (Array.isArray((dataSource as any)?.rows)) return (dataSource as any).rows;
    return [];
  }, [dataSource]);

  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => ({
        __skeleton: true,
        key: `skeleton-${index}`,
      })),
    []
  );

  const isSkeletonRow = (record: Record<string, any>) =>
    Boolean(record.__skeleton);

  const tableData = loadingMainData ? skeletonRows : data;

  const columns: ColumnsType<Record<string, any>> = useMemo(() => {
    const baseColumns: ColumnsType<Record<string, any>> = [
      {
        title: "No.",
        dataIndex: "no",
        key: "no",
        fixed: "left" as const,
        align: "center" as const,
        width: 60,
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3 font-semibold text-center",
        }),
        render: (_text: any, record: any, index: number) => {
          if (isSkeletonRow(record)) {
            return (
              <Skeleton.Input active size="small" style={{ width: "30px" }} />
            );
          }
          return index + 1;
        },
      },
      {
        title: "Region",
        dataIndex: "region_tsel",
        key: "region_tsel",
        fixed: "left" as const,
        width: 160,
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3 font-semibold",
        }),
        render: (text: any, record: any) => {
          if (isSkeletonRow(record)) {
            return (
              <Skeleton.Input active size="small" style={{ width: "120px" }} />
            );
          }
          const isNationWide =
            record.region_tsel?.toUpperCase() === "NATION WIDE" ||
            record.region_tsel?.toUpperCase() === "NATIONWIDE";
          return (
            <span className={isNationWide ? "font-bold text-[#0E2133]" : ""}>
              {text ?? "-"}
            </span>
          );
        },
      },
    ];

    if (!data || data.length === 0) {
      return baseColumns;
    }

    // Default month derivation if key has no explicit month
    const getMonthFromWeek = (w: number): number => {
      if (w <= 4) return 1;
      if (w <= 8) return 2;
      if (w <= 13) return 3;
      if (w <= 17) return 4;
      if (w <= 21) return 5;
      if (w <= 26) return 6;
      if (w <= 30) return 7;
      if (w <= 35) return 8;
      if (w <= 39) return 9;
      if (w <= 43) return 10;
      if (w <= 48) return 11;
      return 12;
    };

    // Find all weekly keys across records
    const weekMap = new Map<string, ParsedWeek>();

    data.forEach((row) => {
      if (!row || typeof row !== "object") return;
      Object.keys(row).forEach((k) => {
        // e.g. real_week_1_month_1
        const matchRealMonth = k.match(/^real_week_(\d+)_month_(\d+)$/i);
        if (matchRealMonth) {
          const weekNum = parseInt(matchRealMonth[1], 10);
          const monthNum = parseInt(matchRealMonth[2], 10);
          if (!weekMap.has(k)) {
            weekMap.set(k, { key: k, weekNum, monthNum });
          }
          return;
        }

        // e.g. week_1_month_1 or ach_week_1_month_1
        const matchWeekMonth = k.match(/^(?:ach_)?week_(\d+)_month_(\d+)$/i);
        if (matchWeekMonth) {
          const weekNum = parseInt(matchWeekMonth[1], 10);
          const monthNum = parseInt(matchWeekMonth[2], 10);
          if (!weekMap.has(k)) {
            weekMap.set(k, { key: k, weekNum, monthNum });
          }
          return;
        }

        // e.g. real_week_1 (legacy)
        const matchReal = k.match(/^real_week_(\d+)$/i);
        if (matchReal) {
          const weekNum = parseInt(matchReal[1], 10);
          const monthNum = getMonthFromWeek(weekNum);
          if (!weekMap.has(k)) {
            weekMap.set(k, { key: k, weekNum, monthNum });
          }
          return;
        }
      });
    });

    const parsedWeeks = Array.from(weekMap.values()).sort(
      (a, b) => a.weekNum - b.weekNum
    );

    const quarterMap: Record<string, number[]> = {
      Q1: [1, 2, 3],
      Q2: [4, 5, 6],
      Q3: [7, 8, 9],
      Q4: [10, 11, 12],
    };

    const monthNames: Record<number, string> = {
      1: "Januari",
      2: "Februari",
      3: "Maret",
      4: "April",
      5: "Mei",
      6: "Juni",
      7: "Juli",
      8: "Agustus",
      9: "September",
      10: "Oktober",
      11: "November",
      12: "Desember",
    };

    const dynamic: Array<any> = [];

    const formatNumber = (value: any) => {
      const number = parseFloat(value);
      if (isNaN(number)) return "-";
      return Number.isInteger(number) ? number.toString() : number.toFixed(2);
    };

    for (const [q, months] of Object.entries(quarterMap)) {
      const targetKey = `target_${q.toLowerCase()}`;
      const hasTarget = data.some(
        (row) =>
          row[targetKey] !== undefined &&
          row[targetKey] !== null &&
          row[targetKey] !== ""
      );

      const quarterWeeks = parsedWeeks.filter((wk) =>
        months.includes(wk.monthNum)
      );

      if (hasTarget || quarterWeeks.length > 0) {
        // Add Target column
        dynamic.push({
          title: q,
          dataIndex: targetKey,
          key: targetKey,
          align: "center" as const,
          width: 70,
          onHeaderCell: () => ({
            className: "!bg-gray-200 !p-3 font-semibold text-center",
          }),
          render: (text: any, record: any) => {
            if (isSkeletonRow(record)) {
              return (
                <Skeleton.Input active size="small" style={{ width: "40px" }} />
              );
            }
            return text !== undefined && text !== null && text !== ""
              ? text
              : "-";
          },
        });

        // Add Month columns with week sub-columns under each month
        months.forEach((m) => {
          const weeksInMonth = quarterWeeks.filter((wk) => wk.monthNum === m);
          if (weeksInMonth.length > 0) {
            dynamic.push({
              title: monthNames[m],
              key: `month_${m}`,
              align: "center" as const,
              onHeaderCell: () => ({
                className: "!bg-[#bebfc1] !p-2 text-center font-semibold",
              }),
              children: weeksInMonth.map((wk) => ({
                title: `W${wk.weekNum}`,
                dataIndex: wk.key,
                key: wk.key,
                align: "center" as const,
                width: 65,
                onHeaderCell: () => ({
                  className: "!bg-blue-pacific !p-2 text-center",
                }),
                render: (text: any, record: any) => {
                  if (isSkeletonRow(record)) {
                    return (
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "40px" }}
                      />
                    );
                  }
                  if (text === undefined || text === null || text === "") {
                    return "-";
                  }

                  const targetValue = Number(record[targetKey]);
                  const val = Number(text);

                  if (isNaN(val)) {
                    return text;
                  }

                  const isBelowTarget = !isNaN(targetValue)
                    ? val <= targetValue
                    : true;

                  return (
                    <span
                      className={`${
                        isBelowTarget
                          ? "!text-green-500 p-1.5 bg-green-50 rounded-sm font-medium"
                          : "!text-red-500 p-1.5 bg-red-50 rounded-sm font-medium"
                      }`}
                    >
                      {formatNumber(text)}
                    </span>
                  );
                },
              })),
            });
          }
        });
      }
    }

    return [...baseColumns, ...dynamic];
  }, [data]);

  return (
    <div>
      <Table
        dataSource={tableData}
        columns={columns}
        bordered
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        className="rounded-xl"
        rowKey={(record, index) =>
          record.key ?? record.region_tsel ?? record.id ?? `weekly-row-${index}`
        }
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export { TableHistoryWeekly };
