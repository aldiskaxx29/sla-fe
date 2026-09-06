import { Skeleton, Table } from "antd";
import { useMemo } from "react";

interface TableHistoryWeeklyProps {
  dataSource: Record<string, any>[];
  loadingMainData?: boolean;
}

const TableHistoryWeekly: React.FC<TableHistoryWeeklyProps> = ({
  dataSource: data,
  loadingMainData = false,
}) => {
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

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: "No.",
        dataIndex: "no",
        key: "no",
        fixed: "left" as const,
        render: (_text: any, record: any, index: number) => {
          if (isSkeletonRow(record)) {
            return (
              <Skeleton.Input active size="small" style={{ width: "40px" }} />
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
        render: (text: any, record: any) => {
          if (isSkeletonRow(record)) {
            return (
              <Skeleton.Input active size="small" style={{ width: "120px" }} />
            );
          }
          return text;
        },
      },
    ];

    if (!data || data.length === 0) {
      return baseColumns;
    }

    // Find all real_week_X keys in the first record
    const sample = data[0];
    const weeklyKeys = Object.keys(sample)
      .filter((k) => /^real_week_(\d+)$/.test(k))
      .sort((a, b) => {
        const numA = Number(a.split("_")[2]);
        const numB = Number(b.split("_")[2]);
        return numA - numB;
      });

    const quarterMap: Record<string, number> = {
      Q1: 1,
      Q2: 2,
      Q3: 3,
      Q4: 4,
    };

    const dynamic: Array<any> = [];

    const formatNumber = (value: any) => {
      const number = parseFloat(value);
      if (isNaN(number)) return "-";
      return Number.isInteger(number) ? number.toString() : number.toFixed(2);
    };

    for (const [q, qNum] of Object.entries(quarterMap)) {
      // Math.ceil(w / 13) === qNum determines the quarter of the week
      const weeksInQuarter = weeklyKeys.filter((k) => {
        const w = Number(k.split("_")[2]);
        return Math.ceil(w / 13) === qNum;
      });

      const hasTarget = `target_${q.toLowerCase()}` in sample;
      const hasWeeks = weeksInQuarter.length > 0;

      if (hasTarget || hasWeeks) {
        // Add Target column
        dynamic.push({
          title: q,
          dataIndex: `target_${q.toLowerCase()}`,
          key: `target_${q.toLowerCase()}`,
          align: "center" as const,
          onHeaderCell: () => ({ className: "!bg-gray-200 !p-3" }),
          render: (text: any, record: any) => {
            if (isSkeletonRow(record)) {
              return (
                <Skeleton.Input active size="small" style={{ width: "40px" }} />
              );
            }
            return text ?? "-";
          },
        });

        // Add Week columns under the quarter
        weeksInQuarter.forEach((k) => {
          const wNum = k.split("_")[2];
          dynamic.push({
            title: `W${wNum}`,
            dataIndex: k,
            key: k,
            align: "center" as const,
            onHeaderCell: () => ({ className: "!bg-blue-pacific !p-2" }),
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

              const targetValue = Number(record[`target_${q.toLowerCase()}`]);
              const val = Number(text);
              const isBelowTarget = val <= targetValue;

              // Color coding (packetloss: lower is better. so if <= target, green; if > target, red)
              return (
                <span
                  className={`${
                    isBelowTarget
                      ? "!text-green-500 p-2 bg-green-50 rounded-sm"
                      : "!text-red-500 p-2 bg-red-50 rounded-sm"
                  }`}
                >
                  {formatNumber(text)}
                </span>
              );
            },
          });
        });
      }
    }

    return [...baseColumns, ...dynamic];
  }, [data]);

  return (
    <div>
      <Table
        dataSource={tableData}
        bordered
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        className="rounded-xl"
        rowKey={(record) => record.key ?? record.region_tsel ?? record.id}
        scroll={{ x: "max-content" }}
      >
        {columns.map((column) => (
          <Table.Column
            key={column.key || column.dataIndex}
            title={column.title}
            dataIndex={column.dataIndex}
            align={column.align}
            fixed={column.fixed}
            onHeaderCell={column.onHeaderCell}
            onCell={() => ({ className: "!p-3" })}
            render={column.render}
          />
        ))}
      </Table>
    </div>
  );
};

export { TableHistoryWeekly };
