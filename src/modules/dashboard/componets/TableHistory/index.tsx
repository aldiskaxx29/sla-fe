// Antd
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { Table } from "antd";
import { useMemo } from "react";

const { Column, ColumnGroup } = Table;

interface TableHistoryProps {
  dataSource: Record<string, unknown>[];
}

const TableHistory: React.FC<TableHistoryProps> = ({ dataSource }) => {
  const columns = useMemo(() => {
    if (!dataSource) return [];

    // 1) Static “region” / “parameter” / etc.
    const baseColumns = [
      { title: "No.", dataIndex: "no", key: "no", fixed: "left" },
      {
        title: "Parameter",
        dataIndex: "parameter",
        key: "parameter",
        fixed: "left",
      },
      {
        title: "Satuan",
        key: "satuan",
        dataIndex: "satuan",
        align: "center",
      },
      {
        title: "Weigted SC",
        dataIndex: "weight",
        align: "center",
        key: "weight",
      },
    ];

    // 2) Quarter ⇒ month numbers
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

    // 3) Now build the alternating [ target_Q*, monthGroup, target_Q*, monthGroup, … ]
    const dynamic: Array<any> = [];

    for (const [q, months] of Object.entries(quarterMap)) {
      // — first, the target column (a leaf)
      dynamic.push({
        title: q,
        dataIndex: `target_${q.toLowerCase()}`,
        key: `target_${q.toLowerCase()}`,
        align: "center",
        onHeaderCell: () => ({ className: "!bg-gray-200 !p-3" }),
        render: (text) => text, // your formatting if any
      });

      // — then each month as a ColumnGroup
      for (const m of months) {
        dynamic.push({
          title: monthNames[m],
          key: `fm_${m}`,
          children: [
            {
              title: "Real",
              dataIndex: `real_fm_${m}`,
              key: `real_fm_${m}`,
              align: "center",
              onHeaderCell: () => ({ className: "!bg-blue-pacific !p-2" }),
              render: (text, record) => {
                console.log(text, "ERTET");
                console.log(record, "RECORD");
                return text + "knjut";
              },
            },
            {
              title: "Ach",
              dataIndex: `ach_fm_${m}`,
              key: `ach_fm_${m}`,
              align: "center",
              onHeaderCell: () => ({ className: "!bg-blue-pacific !p-2" }),
            },
            {
              title: "Score",
              dataIndex: `score_fm_${m}`,
              key: `score_fm_${m}`,
              align: "center",
              onHeaderCell: () => ({
                className: "!bg-[#5195d4] !p-2 !text-white",
              }),
            },
          ],
        });
      }
    }

    return [...baseColumns, ...dynamic];
  }, [dataSource]);

  const formatNumber = (value) => {
    const number = parseFloat(value);
    return Number.isInteger(number) ? number.toString() : number.toFixed(2);
  };

  return (
    <div>
      <Table
        dataSource={dataSource}
        bordered
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        className="rounded-xl "
      >
        {columns.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={() => ({
                className: "!bg-[#bebfc1]",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  align={child.align}
                  // onHeaderCell={() => ({
                  //   className: "!bg-blue-pacific",
                  // })}
                  onHeaderCell={child.onHeaderCell}
                  fixed={child.fixed}
                  onCell={(_, index) => {
                    const isLastTwo = index >= dataSource.length - 2;
                    return {
                      className: isLastTwo ? "!bg-blue-pacific !p-3" : "!p-3",
                    };
                  }}
                  render={(text, record, index) => {
                    const isLastTwo = index >= dataSource.length - 2;
                    if (isLastTwo) {
                      return (
                        <span className={`${text ? "font-bold" : ""}`}>
                          {text}
                        </span>
                      );
                    }
                    // only for the "real_fm_X" columns:
                    if (child.dataIndex?.startsWith("real_fm_")) {
                      // 1) extract the month number from "real_fm_3" → 3
                      const month = Number(child.dataIndex.split("_")[2]);

                      // 2) figure out which quarter it belongs to
                      const quarter = Math.ceil(month / 3); // months 1–3 → Q1, 4–6 → Q2, etc.

                      // 3) grab that target from the record
                      const targetValue = Number(record[`target_q${quarter}`]);

                      // 4) compare
                      const isBelowTarget = Number(text) < targetValue;

                      // 5) apply your coloring logic
                      if (
                        record.parameter
                          ?.toLowerCase()
                          .includes("packetloss") &&
                        !record.parameter?.toLowerCase().includes("internet")
                      ) {
                        return (
                          <span
                            className={`${
                              !isBelowTarget
                                ? "!text-red-500 p-2 bg-red-50 rounded-sm"
                                : "!text-green-500 p-2 bg-green-50 rounded-sm"
                            }`}
                          >
                            {isNaN(formatNumber(text))
                              ? "-"
                              : formatNumber(text)}
                          </span>
                        );
                      }

                      return (
                        <span
                          className={`${
                            isBelowTarget
                              ? "!text-red-500 p-2 bg-red-50 rounded-sm"
                              : "!text-green-500 p-2 bg-green-50 rounded-sm"
                          }`}
                        >
                          {isNaN(formatNumber(text)) ? "-" : formatNumber(text)}
                        </span>
                      );
                    }
                    return text;
                  }}
                />
              ))}
            </ColumnGroup>
          ) : (
            <Column
              key={column.dataIndex}
              title={column.title}
              dataIndex={column.dataIndex}
              width={column.width}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
              fixed={column.fixed}
              align={column.align}
              onCell={(_, index) => {
                const isLastTwo = index >= dataSource.length - 2;
                return {
                  className: isLastTwo ? "!bg-blue-pacific !p-3" : "!p-3",
                };
              }}
              render={(text, record, index) => {
                const isLastTwo = index >= dataSource.length - 2;
                if (column.dataIndex === "parameter" && !isLastTwo) {
                  return <span>{snakeToPascal_Utils(text)}</span>;
                }
                if (column.dataIndex === "no" && !isLastTwo) {
                  return <span>{index + 1}</span>;
                }
                if (isLastTwo) {
                  return (
                    <span className={`${text ? "font-bold" : ""}`}>
                      {snakeToPascal_Utils(text)}
                    </span>
                  );
                }
                if (column.dataIndex?.startsWith("ach")) {
                  const isBelowTarget = Number(text) < Number(record.target);
                  return (
                    <span
                      className={`${
                        !isBelowTarget ? "text-red" : "text-brand-secondary"
                      }`}
                    >
                      {text}
                    </span>
                  );
                }
                return text;
              }}
            />
          )
        )}
      </Table>
    </div>
  );
};

export { TableHistory };
