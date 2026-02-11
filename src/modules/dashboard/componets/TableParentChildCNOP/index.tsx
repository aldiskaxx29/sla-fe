import { Image, Spin, Table } from "antd";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";

import arrowDropdown from "@/assets/arrow_dropdown.svg";

interface TableParentChildCNOPProps {
  data: Record<string, unknown>[];
  loadingMainData: boolean;
  treg: string;
  filter: string;
}

let identIndex = 1;

const TableParentChildCNOP: React.FC<TableParentChildCNOPProps> = ({
  data,
  loadingMainData,
  treg,
  filter,
}) => {
  const [loading, setLoading] = useState(false);
  const [detailParameter, setDetailParameter] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [injectedData, setInjectedData] = useState({});
  const [injectedChildData, setInjectedChildData] = useState({});
  const { getWitel, getCNP, getModalDetail } = useDashboard();
  const { menuId } = useParams();
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    []
  );

  useEffect(() => {
    if (!data) return;
    setDataSource(data);
  }, [data]);

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
    const sampleRecord = data[1];

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
        width: 100,
        align: "center",
        onHeaderCell: () => ({
          className: "!bg-blue-pacific !p-3",
        }),
      },
      {
        title: "LEVEL SLA",
        key: "level_sla",
        dataIndex: "level_sla",
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
          className: "!bg-[#bebfc1] !p-3",
          // className: "!bg-blue-pacific !p-3",
        }),
        onCell: () => ({
          // className: "!bg-[#F9EFEA] !p-3",
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
            title: "Ach Before",
            dataIndex: `ach_fm_before_${monthNum}`,
            align: "center",
            key: `ach_fm_${monthNum}`,
            onHeaderCell: () => ({
              className: "!bg-[#5195d4] !text-white !p-3",
              // className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({}),
            // className: "!bg-[#F9EFEA] !p-3",
            className: "!bg-blue-pacific !p-3",
          },
          {
            title: "Ach After",
            dataIndex: `ach_fm_after_${monthNum}`,
            align: "center",
            key: `ach_fm_${monthNum}`,
            onHeaderCell: () => ({
              className: "!bg-[#5195d4] !text-white !p-3",
              // className: "!bg-blue-pacific !p-3",
            }),
            onCell: () => ({}),
            // className: "!bg-[#F9EFEA] !p-3",
            className: "!bg-blue-pacific !p-3",
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
          // className: "!bg-[#FFF7E8] !p-3",
          className: "!bg-blue-pacific !p-3",
        }),
        align: "center",
        children: [
          {
            title: "FM",
            dataIndex: `ach_fm_${findLastKey}`,
            align: "center",
            key: `ach_fm_${findLastKey}`,
            onHeaderCell: () => ({
              className: "!bg-[#5195d4] !text-white !p-3",
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

    return [...baseColumns, ...lastMonth, ...groupedColumns];
  }, [data]);

  const fetchWitelData = useCallback(
    async (record) => {
      setLoading(true);
      try {
        const mini_parameter = record.parameter;
        let res;
        if (record.main_parent) {
          res = await getCNP({
            query: {
              type: menuId,
              filter,
              parameter: record.parameter.toLocaleLowerCase(),
              treg,
              sort: "asc",
            },
          }).unwrap();
        } else {
          res = await getWitel({
            query: {
              parameter: record.mini_parameter
                ?.replace(/%20/g, " ")
                .toLocaleLowerCase(),
              region: record.parameter,
              level: "witel",
              filter,
              treg,
              type: menuId,
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

          const injectData = {
            ...findData.children[record.index],
            children: newData,
          };
          setInjectedChildData(injectData);
        }
        return res;
      } catch (error) {
        return error;
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
              align={column.align}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  onHeaderCell={child.onHeaderCell}
                  onCell={(record, index) => {
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
                    if (child.dataIndex?.startsWith("ach") && text) {
                      const parseNumber = (value?: string) => {
                        const lengthVal = value?.toString().split(" ").length;
                        if (lengthVal && lengthVal > 1) {
                          return Number(value?.toString().split(" ")[0]);
                        } else return Number(value);
                      };

                      let textBigger;
                      if (
                        record.parameter?.includes("PACKETLOSS")
                        // record.parameter?.includes("LATENCY RAN TO CORE")
                      ) {
                        textBigger =
                          parseNumber(text) < parseNumber(record.target);
                        if (!record.target) {
                          return <span>{text}</span>;
                        }
                      } else {
                        textBigger =
                          parseNumber(text) > parseNumber(record.target);
                        // if (!record.target) {
                        if (record.target === '' ||
                          record.target === null ||
                          record.target === undefined) {
                          return <span>{text}</span>;
                        }
                      }
                      if (
                        record.mini_parameter?.includes("PACKETLOSS") ||
                        ((record.mini_parameter?.includes(
                          "JITTER RAN TO CORE"
                        ) ||
                          record.mini_parameter?.includes(
                            "LATENCY RAN TO CORE"
                          )) &&
                          filter.includes("by total ne") &&
                          text)
                      )
                        return (
                          <span
                            className={`${
                              textBigger
                                ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                                : "!text-green-500 p-1 bg-green-50 rounded-sm"
                            } cursor-pointer`}
                          >
                            {text}
                          </span>
                        );
                      return (
                        <span
                          className={`${
                            textBigger
                              ? "!text-green-500 p-1 bg-green-50 rounded-sm"
                              : "!text-red-500 p-1 bg-red-50 rounded-sm"
                          } cursor-pointer`}
                        >
                          {text}
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
                if (column.dataIndex?.startsWith("ach")) {
                  const isBelowTarget = Number(text) < Number(record.target);
                  return (
                    <span
                      className={`${
                        !isBelowTarget ? "!text-red" : "!text-brand-secondary"
                      }`}
                    >
                      {text}
                    </span>
                  );
                }
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
                            ? "ml-2 "
                            : "ml-4 "
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
                          className={`${record.bold ? "font-bold -ml-4" : ""}`}
                        >
                          {text}
                        </p>
                      </div>
                    </div>
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

export { TableParentChildCNOP };
