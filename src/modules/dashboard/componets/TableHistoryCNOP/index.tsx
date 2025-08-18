// Antd
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { Table } from "antd";
import { useMemo } from "react";

const { Column, ColumnGroup } = Table;

interface TableHistoryCNOPProps {
  dataSource: Record<string, unknown>[];
  parameter: string;
  filter: string;
}

const TableHistoryCNOP: React.FC<TableHistoryCNOPProps> = ({
  dataSource,
  parameter,
  filter,
}) => {
  const columns = useMemo(() => {
    if (!dataSource || dataSource.length === 0) return [];

    const baseColumns = [
      { title: "No.", dataIndex: "no", key: "no", fixed: "left" },
      {
        title: "Region",
        dataIndex: "region_tsel",
        key: "region_tsel",
        fixed: "left",
      },
      {
        title: "Treshold %",
        dataIndex: "treshold",
        key: "treshold",
        align: "center",
      },
    ];

    // 2) Grab all your ach_* keys
    const sample = dataSource[0];
    const weeklyKeys = Object.keys(sample)
      .filter((k) => /^ach_\d+_\d+$/.test(k))
      .sort((a, b) => {
        const [, mA, wA] = a.split("_").map(Number);
        const [, mB, wB] = b.split("_").map(Number);
        return mA === mB ? wA - wB : mA - mB;
      });
    const monthlyKeys = Object.keys(sample)
      .filter((k) => /^ach_fm_\d+$/.test(k))
      .sort((a, b) => {
        const mA = +a.split("_").pop()!;
        const mB = +b.split("_").pop()!;
        return mA - mB;
      });

    // 3) Quarter ⇒ month numbers
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

    // 4) Build dynamicColumns by quarter → month → weeks + FM
    const dynamicColumns: any[] = [];

    for (const [q, months] of Object.entries(quarterMap)) {
      // 4a) Target Q✕
      dynamicColumns.push({
        title: `Target ${q}`,
        dataIndex: `target_${q.toLowerCase()}`,
        key: `target_${q.toLowerCase()}`,
        align: "center",
        onHeaderCell: () => ({ className: "!bg-gray-200 !p-2" }),
        children: [
          {
            title: "Site",
            dataIndex: `target_${q.toLowerCase()}`,
            key: `target_${q}_site`,
          },
        ],
      });

      // 4b) For each month in this quarter...
      for (const m of months) {
        // — collect week keys for month m
        const weeks = weeklyKeys
          .filter((k) => k.startsWith(`ach_${m}_`))
          .map((k) => ({
            title: `W${+k.split("_")[2]}`,
            dataIndex: k,
            key: k,
            children: [
              {
                title: `W${+k.split("_")[2]} ${monthNames[m].slice(0, 3)}`,
                dataIndex: k,
                key: `${k}-leaf`,
              },
            ],
          }));

        // — monthly "FM" key
        const fmKey = `ach_fm_${m}`;
        const fmCol = {
          title: `FM`,
          dataIndex: fmKey,
          key: fmKey,
          children: [
            {
              title: monthNames[m],
              dataIndex: fmKey,
              key: `${fmKey}-leaf`,
            },
          ],
        };

        // append all week cols, then FM col
        dynamicColumns.push(...weeks, fmCol);
      }
    }

    // 5) Your final Gap WoW
    const gapColumn = {
      title: "Gap WoW",
      dataIndex: "graph",
      key: "graph",
      align: "center",
    };

    return [...baseColumns, ...dynamicColumns, gapColumn];
  }, [dataSource]);

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
                className: column.title.includes("FM")
                  ? "!bg-[#5195d4] !text-white !p-3"
                  : "!bg-blue-pacific !p-3",
              })}
              align="center"
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  align="center"
                  onHeaderCell={() => ({
                    className:
                      !child.title.includes("W") && !child.title.includes("Si")
                        ? "!bg-[#5195d4] !text-white !p-3"
                        : "!bg-blue-pacific !p-3",
                  })}
                  fixed={child.fixed}
                  onCell={(_, index) => {
                    const isLastTwo = index >= dataSource.length - 1;
                    return {
                      className: isLastTwo ? "!bg-blue-pacific !p-3" : "!p-3",
                    };
                  }}
                  render={(text, record, index) => {
                    const isLastTwo = index >= dataSource.length - 1;
                    if (isLastTwo) {
                      return (
                        <span className={`${text ? "font-bold" : ""}`}>
                          {text}
                        </span>
                      );
                    }

                    // only for any ach_* or ach_fm_* column
                    if (child.dataIndex?.startsWith("ach_")) {
                      // 1) figure out the month number
                      let month: number;
                      if (child.dataIndex.startsWith("ach_fm_")) {
                        // ach_fm_X  → month X
                        month = Number(child.dataIndex.split("_")[2]);
                      } else {
                        // ach_M_W  → month M
                        month = Number(child.dataIndex.split("_")[1]);
                      }

                      // 2) compute the quarter 1–4
                      const quarter = Math.ceil(month / 3);

                      // 3) grab the corresponding target_qX from your record
                      const targetValue = Number(record[`target_q${quarter}`]);

                      // 4) compare!
                      const isBelowTarget = Number(text) < targetValue;
                      const packetloss = parameter
                        ?.toLowerCase()
                        .includes("pl");
                      const notPacketloss =
                        parameter?.toLowerCase().includes("jitter") ||
                        parameter?.toLowerCase().includes("latency");

                      if (!text) return text;

                      if (packetloss) {
                        return (
                          <span
                            className={
                              isBelowTarget
                                ? "!text-green-500 p-1 bg-green-50 rounded-sm"
                                : "!text-red-500 p-1 bg-red-50 rounded-sm"
                            }
                          >
                            {text}
                          </span>
                        );
                      }
                      if (notPacketloss && filter.includes("by total ne")) {
                        return (
                          <span
                            className={
                              isBelowTarget
                                ? "!text-green-500 p-1 bg-green-50 rounded-sm"
                                : "!text-red-500 p-1 bg-red-50 rounded-sm"
                            }
                          >
                            {text}
                          </span>
                        );
                      } else {
                        return (
                          <span
                            className={
                              isBelowTarget
                                ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                                : "!text-green-500 p-1 bg-green-50 rounded-sm"
                            }
                          >
                            {text}
                          </span>
                        );
                      }
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
                className: "!bg-blue-pacific !p-3",
              })}
              align={column.align}
              fixed={column.fixed}
              onCell={(_, index) => {
                const isLastTwo = index >= dataSource.length - 1;
                return {
                  className: isLastTwo ? "!bg-blue-pacific !p-3" : "!p-3",
                };
              }}
              render={(text, record, index) => {
                const isLastTwo = index >= dataSource.length - 1;
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
                if (column.dataIndex === "graph") {
                  const upZero = Number(record.graph) < 0;
                  const packetloss = parameter?.toLowerCase().includes("pl");
                  const notPacketloss =
                    parameter?.toLowerCase().includes("jitter") ||
                    parameter?.toLowerCase().includes("latency");
                  if (packetloss) {
                    return (
                      <span
                        className={
                          upZero
                            ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                            : "!text-green-500 p-1 bg-green-50 rounded-sm"
                        }
                      >
                        {text}
                      </span>
                    );
                  }
                  if (notPacketloss) {
                    return (
                      <span
                        className={
                          upZero
                            ? "!text-green-500 p-1 bg-green-50 rounded-sm"
                            : "!text-red-500 p-1 bg-red-50 rounded-sm"
                        }
                      >
                        {text}
                      </span>
                    );
                  }
                  return text;
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

export { TableHistoryCNOP };
