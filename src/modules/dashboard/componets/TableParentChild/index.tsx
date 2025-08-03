import { Image, Spin, Table } from "antd";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import { useCallback, useMemo, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";

import arrowDropdown from "@/assets/arrow_dropdown.svg";

interface TableParentChildProps {
  data: Record<string, unknown>[];
  loadingMainData: boolean;
  treg: string;
}

let identIndex = 1;

const TableParentChild: React.FC<TableParentChildProps> = ({
  data,
  loadingMainData,
  treg,
}) => {
  const [loading, setLoading] = useState(false);
  const [detailParameter, setDetailParameter] = useState("");
  const [dataSource, setDataSource] = useState(data);
  const [injectedData, setInjectedData] = useState({});
  const [injectedChildData, setInjectedChildData] = useState({});
  const { getWitel, getCNP, getModalDetail } = useDashboard();
  const { menuId } = useParams();
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    []
  );
  const [filter, setFilter] = useState("by total ne");

  const dataMapping = useMemo(() => {
    const mappingData2 = dataSource.map((data, indexParent) => {
      if (
        data.coreIndex == injectedData?.coreIndex &&
        data.parameter == injectedData?.parameter
      ) {
        const mappingChildren = injectedData.children.map(
          (childData, index) => {
            let childrenMapped = [];

            if (
              injectedChildData.identIndex === childData.identIndex &&
              Array.isArray(injectedChildData.children)
            ) {
              childrenMapped = injectedChildData.children.map((grandChild) => ({
                ...grandChild,
                index,
                indexParent,
              }));
            }

            return {
              ...childData,
              index,
              indexParent,
              children: childrenMapped,
            };
          }
        );

        return {
          ...data,
          index: indexParent,
          indexParent,
          identIndex: data.identIndex || identIndex++,
          children: mappingChildren,
        };
      }

      return {
        ...data,
        indexParent,
        index: indexParent,
        identIndex: data.identIndex || identIndex++,
      };
    });

    return mappingData2;
  }, [dataSource, injectedData, injectedChildData]);

  const columns = useMemo(() => {
    if (!data) return [];
    // Extract keys dynamically
    // Extract keys dynamically
    const sampleRecord = data[0];

    const weeklyKeys = Object.keys(sampleRecord).filter((key) =>
      /^ach_\d+_\d+$/.test(key)
    );
    const monthlyKeys = Object.keys(sampleRecord).filter((key) =>
      /^ach_fm_\d+$/.test(key)
    );

    // Map months
    const monthMapping = {
      ach_fm_1: "JANUARY",
      ach_fm_2: "FEBRUARY",
      ach_fm_3: "MARCH",
      ach_fm_4: "APRIL",
      ach_fm_5: "MAY",
      ach_fm_6: "JUNE",
      ach_fm_7: "JULY",
      ach_fm_8: "AUGUSTUS",
      ach_fm_9: "SEPTEMBER",
      ach_fm_10: "OCTOBER",
      ach_fm_11: "NOVEMBER",
      ach_fm_12: "DECEMBER",
    };

    // Static columns (always shown)
    const baseColumns = [
      {
        title: "NO",
        dataIndex: "no",
        key: "no",
        fixed: "left",
        align: "center",
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3",
        }),
      },
      {
        title: "PARAMETER",
        dataIndex: "parameter",
        key: "parameter",
        fixed: "left",
        width: 250,
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3",
        }),
      },
      {
        title: "TARGET",
        dataIndex: "target",
        key: "target",
        width: 40,
        align: "center",
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3",
        }),
        render: (text, record) => {
          if (record.parameter === "PACKETLOSS RAN TO CORE") {
            // Hilangkan .00
            return parseFloat(text).toFixed(2).endsWith('.00')
              ? parseInt(text)
              : text;
          }
          return text;
        }
      },      
      {
        title: "SATUAN",
        key: "satuan",
        dataIndex: "satuan",
        align: "center",
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3",
        }),
      },
      {
        title: "WEIGTED SC",
        dataIndex: "weight",
        key: "weight",
        align: "center",
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3",
        }),
        onCell: () => {
          return {
            style: {
              height: 40, // tinggi cell
              verticalAlign: "middle",
            },
          };
        },
      },
    ];

    const rekonScore = [
      {
        title: (
          <div>
            SCORE <br /> BEFORE REKON
          </div>
        ),
        dataIndex: "score_before_rekon",
        key: "score_before_rekon",
        align: "center",
        onHeaderCell: () => ({
          // className: "!bg-blue-pacific !p-3",
          className: "!bg-[#5195d4] !p-3 !text-white",
        }),
      },
      {
        title: (
          <div>
            SCORE <br /> AFTER REKON
          </div>
        ),
        dataIndex: "score_after_rekon",
        key: "score_after_rekon",
        align: "center",
        onHeaderCell: () => ({
          // className: "!bg-blue-pacific !p-3",
          className: "!bg-[#5195d4] !p-3 !text-white",
        }),
      },
    ];

    // Group weekly data under each month
    const groupedColumns = monthlyKeys.map((monthKey) => {
      const monthNum = parseInt(monthKey.replace("ach_fm_", ""));
      const relatedWeeks = weeklyKeys.filter((weekKey) =>
        weekKey.startsWith(`ach_${monthNum}_`)
      );

      return {
        title: monthMapping[monthKey],
        key: monthKey,
        onHeaderCell: () => ({
          className: "!bg-[#bebfc1]",
          // className: "!bg-blue-pacific !p-3",
        }),
        onCell: () => ({
          // className: "!bg-[#bebfc1] !p-3",
          className: "!bg-blue-pacific !p-3",
        }),
        children: [
          ...relatedWeeks.map((weekKey) => {
            const weekNum = weekKey.split("_")[2];
            return {
              title: `W${weekNum}`,
              dataIndex: weekKey,
              align: "center",
              key: weekKey,
              onHeaderCell: () => ({
                // className: "!bg-[#F9EFEA] !p-3",
                className: "!bg-blue-pacific !p-3",
              }),
              onCell: () => ({
                // className: "!bg-[#F9EFEA] !p-3",
                className: "!bg-blue-pacific !p-3",
              }),
              compare: true,
            };
          }),
          {
            title: "REALISASI BEFORE",
            dataIndex: `realisasi_fm_before_${monthNum}`,
            align: "center",
            key: `realisasi_fm_before_${monthNum}`,
            onHeaderCell: () => ({
              // className: "!bg-[#F9EFEA] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({
              className: "!bg-[#F9EFEA] !p-3",
              // className: "!bg-blue-pacific !p-3",
            }),
            compare: true,
          },
          {
            title: "REALISASI AFTER",
            dataIndex: `realisasi_fm_after_${monthNum}`,
            align: "center",
            key: `realisasi_fm_after_${monthNum}`,
            onHeaderCell: () => ({
              // className: "!bg-[#F9EFEA] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({
              className: "!bg-[#F9EFEA] !p-3",
              // className: "!bg-blue-pacific !p-3",
            }),
            compare: true,
          },
          {
            title: "ACHIEVEMENT",
            dataIndex: `ach_fm_${monthNum}`,
            align: "center",
            key: `ach_fm_${monthNum}`,
            onHeaderCell: () => ({
              // className: "!bg-[#F9EFEA] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({
              className: "!bg-[#F9EFEA] !p-3",
              // className: "!bg-blue-pacific !p-3",
            }),
          },
        ],
      };
    });
    const findLastKey = parseInt(groupedColumns[0].key.split("_")[2]);

    const lastMonth = [
      {
        title: monthMapping[`ach_fm_${findLastKey}`],
        key: `ach_fm_${findLastKey}`,
        onHeaderCell: () => ({
          className: "!bg-[#bebfc1] !p-3",
          // className: "!bg-blue-pacific !p-3",
        }),
        onCell: () => ({
          // className: "!bg-[#bebfc1] !p-3",
          className: "!bg-blue-pacific !p-3",
        }),
        children: [
          {
            title: "REALISASI BEFORE",
            dataIndex: `realisasi_fm_before_${findLastKey}`,
            align: "center",
            key: `realisasi_fm_before_${findLastKey}`,
            onHeaderCell: () => ({
              // className: "!bg-[#FFF7E8] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({
              // className: "!bg-[#FFF7E8] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            compare: true,
          },
          {
            title: "REALISASI AFTER",
            dataIndex: `realisasi_fm_after_${findLastKey}`,
            align: "center",
            key: `realisasi_fm_after_${findLastKey}`,
            onHeaderCell: () => ({
              // className: "!bg-[#FFF7E8] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({
              // className: "!bg-[#FFF7E8] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            compare: true,
          },
          {
            title: "ACHIEVEMENT",
            dataIndex: `ach_fm_${findLastKey}`,
            align: "center",
            key: `ach_fm_${findLastKey}`,
            onHeaderCell: () => ({
              // className: "!bg-[#FFF7E8] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({
              className: "!bg-[#FFF7E8] !p-3",
              // className: "!bg-blue-pacific !p-3",
            }),
          },
          {
            title: "SCORE",
            dataIndex: `score_fm_${findLastKey}`,
            align: "center",
            key: `score_fm_${findLastKey}`,
            onHeaderCell: () => ({
              className: "!bg-[#5195d4] !p-3 !text-slate-100",
              // className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({
              // className: "!bg-[#FFF7E8] !p-3",
              className: "!bg-blue-pacific !p-3",
            }),
          },
        ],
      },
    ];
    groupedColumns.shift();

    return [...baseColumns, ...lastMonth, ...groupedColumns, ...rekonScore];
  }, [data]);

  const fetchWitelData = useCallback(
    async (record) => {
      setLoading(true);
      try {
        let res;
        const mini_parameter = record.parameter.toLocaleLowerCase();
        if (record.main_parent) {
          res = await getCNP({
            query: {
              type: menuId,
              filter,
              parameter: record.parameter.toLocaleLowerCase(),
              sort: "asc",
              treg,
            },
          }).unwrap();
        } else {
          res = await getWitel({
            query: {
              parameter: detailParameter
                ?.replace(/%20/g, " ")
                .toLocaleLowerCase(),
              region: record.parameter,
              level: "witel",
              filter,
              type: menuId,
              treg,
            },
          }).unwrap();
        }

        if (record.main_parent) {
          const findData = dataMapping.find(
            (data) =>
              data.coreIndex == record.coreIndex &&
              data.parameter == record.parameter
          );
          const newData = res.data?.map((data) => ({
            ...data,
            mini_parameter,
            identIndex: data.identIndex || identIndex++,
          }));
          const injectData = { ...findData, children: newData };
          setInjectedData(injectData);
        } else {
          const findData = dataMapping[record.indexParent];
          const newData = res.data?.map((data) => ({
            ...data,
            mini_parameter: findData.parameter,
            identIndex: data.identIndex || identIndex++,
          }));
          const childDataInject = findData?.children[record.index];
          const injectData = {
            ...childDataInject,
            children: newData,
          };
          setInjectedChildData(injectData);
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [dataMapping, detailParameter, filter, getCNP, getWitel, menuId, treg]
  );

  const handleExpandCollaps = useCallback(
    async (record) => {
      if (record.parameter.toLowerCase().includes("core"))
        setDetailParameter(record.parameter);
      if (record.parent || record.main_parent) {
        const key = record.identIndex;
        setExpandedRowKeys((prevKeys) => {
          const isExpanded = prevKeys.includes(key);
          if (isExpanded) {
            return prevKeys.filter((k) => k !== key);
          } else {
            return [...prevKeys, key];
          }
        });

        const isExpandedNow = expandedRowKey.includes(key);

        if (!isExpandedNow) {
          const success = await fetchWitelData(record);
          setTimeout(async () => {
            setDataSource(dataMapping);
            if (!success) await fetchWitelData(record);
            setDataSource(dataMapping);
          }, 500);
        }
      }
    },
    [dataMapping, expandedRowKey, fetchWitelData]
  );

  return (
    <div>
      {loadingMainData ||
        (loading && <Spin fullscreen tip="Sedang Memuat Data..." />)}

      <Table
        size="small"
        dataSource={dataMapping}
        bordered
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        className="rounded-xl "
        rowKey={(record) => record.identIndex}
        scroll={{ x: "max-content" }}
        expandable={{
          expandedRowKeys: expandedRowKey,
          rowExpandable: (record) =>
            record.children && record.children.length > 0,
          expandIcon: () => <div></div>,
        }}
      >
        {columns.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={column.onHeaderCell}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  onHeaderCell={child.onHeaderCell}
                  onCell={(record, index) => {
                    const isLastTwo =
                      record.parameter.toLowerCase().includes("service") ||
                      record.parameter.toLowerCase().includes("weighted");
                    const isRealColumn = child?.dataIndex
                      ?.toString()
                      .toLowerCase()
                      .includes("real");
                    const baseOnCell =
                      typeof column.onCell === "function"
                        ? column.onCell()
                        : {};
                    if (isLastTwo && child.dataIndex.includes("score"))
                      return {
                        ...baseOnCell,
                        style: {
                          fontSize: record.main_parent
                            ? ""
                            : record.parent
                            ? "12px"
                            : "11px",
                        },
                      };
                    else if (isLastTwo) {
                      return {
                        className: "!bg-blue-pacific ",
                      };
                    }
                    if (isRealColumn) {
                      return {
                        style: {
                          backgroundColor: "#f7f7f7",
                          fontWeight: "bold",
                          fontSize: record.main_parent
                            ? ""
                            : record.parent
                            ? "12px"
                            : "11px",
                        },
                      };
                    }
                    return {
                      style: {
                        fontSize: record.main_parent
                          ? ""
                          : record.parent
                          ? "12px"
                          : "11px",
                      },
                    };
                  }}
                  align={child.align}
                  fixed={child.fixed}
                  render={(text, record) => {
                    const isLastTwo =
                      record.parameter.toLowerCase().includes("service") ||
                      record.parameter.toLowerCase().includes("weighted");
                    const isBelowTarget = Number(text) < Number(record.target);
                    if (!text) return text;
                    if (!record.target && !isLastTwo) {
                      return <span>{text}</span>;
                    }
                    if (
                      (child.dataIndex?.startsWith("ach") ||
                        child.dataIndex?.includes("_fm_")) &&
                      child.compare &&
                      !isLastTwo
                    ) {
                      if (
                        record.parameter
                          .toLowerCase()
                          .includes("packetloss ran to core") ||
                        record.mini_parameter
                          ?.toLowerCase()
                          .includes("packetloss ran to core")
                      )
                        return (
                          <span
                            className={`${
                              !isBelowTarget
                                ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                                : "!text-green-500 p-1 bg-green-50 rounded-sm"
                            } curcor-pointer`}
                          >
                            {record.satuan === "%"
                              ? text + "%"
                              : parseFloat(text).toString()}
                          </span>
                        );

                      return (
                        <span
                          className={`${
                            isBelowTarget
                              ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                              : "!text-green-500 p-1 bg-green-50 rounded-sm"
                          } cursor-pointer `}
                        >
                          {record.satuan === "%"
                            ? text ?? "" + "%"
                            : text ?? ""}
                        </span>
                      );
                    }
                    if (isLastTwo && child.dataIndex.includes("score")) {
                      return (
                        <span
                          className={`${
                            isBelowTarget
                              ? "!text-red-500 p-1 !bg-red-50 rounded-sm"
                              : "!text-green-500 p-1 !bg-green-50 rounded-sm"
                          } cursor-pointer text-[15px] font-bold`}
                        >
                          {record.satuan === "%" ? text + "%" : text}
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
              onHeaderCell={column.onHeaderCell}
              onCell={(record, index) => {
                const isLastTwo =
                  record.parameter.toLowerCase().includes("service") ||
                  record.parameter.toLowerCase().includes("weighted");
                if (isLastTwo)
                  return {
                    className: "!bg-blue-pacific !p-3",
                    style: {
                      fontSize: record.main_parent
                        ? ""
                        : record.parent
                        ? "12px"
                        : "11px",
                    },
                  };
                return {
                  style: {
                    fontSize: record.main_parent
                      ? ""
                      : record.parent
                      ? "12px"
                      : "11px",
                  },
                };
              }}
              align={column.align}
              fixed={column.fixed}
              render={(text, record, index) => {
                const isBelowTarget = Number(text) < Number(record.target);
                if (column.dataIndex == "parameter") {
                  return (
                    <div
                      className="cursor-pointer text-primary-500"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleExpandCollaps(record)}
                    >
                      <div
                        className={`flex gap-2 items-center ${
                          record.main_parent
                            ? "ml-0"
                            : record.parent
                            ? "ml-2 !text-[13px]"
                            : "ml-4 !text-xs"
                        }`}
                      >
                        <Image
                          className={`${
                            record.main_parent || record.parent
                              ? "block"
                              : "hidden"
                          } `}
                          width={10}
                          src={arrowDropdown}
                          preview={false}
                        />
                        <p
                          className={
                            text === "WEIGHTED ACHIEVEMENT" ||
                            text === "SERVICE CREDIT"
                              ? "text-white p-2 bg-[#04d1de] rounded-md text-[15px] font-bold"
                              : ""
                          }
                        >
                          {text}
                        </p>
                      </div>
                    </div>
                  );
                }
                if (
                  record.parameter.toLowerCase().includes("service") &&
                  text
                ) {
                  return (
                    <span
                      className={`${
                        isBelowTarget
                          ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                          : "!text-green-500 p-1 bg-green-50 rounded-sm "
                      } cursor-pointer text-[15px] font-bold`}
                    >
                      {record.satuan === "%" ? text + "%" : text}
                    </span>
                  );
                }
                if (
                  record.parameter.toLowerCase().includes("weighted") &&
                  text
                ) {
                  return (
                    <span
                      className={`${
                        isBelowTarget
                          ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                          : "!text-green-500 p-1 bg-green-50 rounded-sm"
                      } cursor-pointer text-[15px] font-bold`}
                    >
                      {record.satuan === "%" ? text + "%" : text}
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

export { TableParentChild };
