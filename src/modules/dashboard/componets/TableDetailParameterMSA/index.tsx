// Antd
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Spin, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";

const { Column, ColumnGroup } = Table;

interface TableDetailParameterMSAProps {
  data: Record<string, unknown>[];
  loadingMainData: boolean;
}

let identIndex = 1;

const TableDetailParameterMSA: React.FC<TableDetailParameterMSAProps> = ({
  data,
  loadingMainData,
}) => {
  const [dataSource, setDataSource] = useState(data);
  const [injectedData, setInjectedData] = useState([]);
  const { getWitel, getModalDetail } = useDashboard();
  const { detailParameter } = useParams();
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    []
  );

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
      ach_fm_1: "January",
      ach_fm_2: "February",
      ach_fm_3: "March",
      ach_fm_4: "April",
      ach_fm_5: "May",
      ach_fm_6: "June",
      ach_fm_7: "July",
      ach_fm_8: "August",
      ach_fm_9: "September",
      ach_fm_10: "October",
      ach_fm_11: "November",
      ach_fm_12: "December",
    };

    // Static columns (always shown)
    const baseColumns = [
      {
        title: "Parameter",
        dataIndex: "parameter",
        key: "parameter",
        fixed: "left",
        width: 250,
      },
      {
        title: "Target",
        dataIndex: "target",
        key: "target",
        width: 200,
        align: "center",
      },
      {
        title: "Satuan",
        key: "satuan",
        dataIndex: "satuan",
      },
      {
        title: "Weigted SC",
        dataIndex: "weight",
        key: "weight",
        align: "center",
      },
    ];

    const rekonScore = [
      {
        title: "Score Before Rekon",
        dataIndex: "score_before_rekon",
        key: "score_before_rekon",
        align: "center",
      },
      {
        title: "Score After Rekon",
        dataIndex: "score_after_rekon",
        key: "score_after_rekon",
        align: "center",
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
        children: [
          ...relatedWeeks.map((weekKey) => {
            const weekNum = weekKey.split("_")[2];
            return {
              title: `W${weekNum}`,
              dataIndex: weekKey,
              align: "center",
              key: weekKey,
            };
          }),
          {
            title: "Real",
            dataIndex: `realisasi_fm_${monthNum}`,
            align: "center",
            key: `realisasi_fm_${monthNum}`,
          },
          {
            title: "Ach",
            dataIndex: `ach_fm_${monthNum}`,
            align: "center",
            key: `ach_fm_${monthNum}`,
          },
        ],
      };
    });
    const findLastKey = parseInt(groupedColumns[0].key.split("_")[2]);

    const lastMonth = [
      {
        title: monthMapping[`ach_fm_${findLastKey}`],
        key: `ach_fm_${findLastKey}`,
        children: [
          {
            title: "Realisasi",
            dataIndex: `realisasi_fm_${findLastKey}`,
            align: "center",
            key: `realisasi_fm_${findLastKey}`,
          },
          {
            title: "Achivement",
            dataIndex: `ach_fm_${findLastKey}`,
            align: "center",
            key: `ach_fm_${findLastKey}`,
          },
          {
            title: "Score",
            dataIndex: `score_fm_${findLastKey}`,
            align: "center",
            key: `score_fm_${findLastKey}`,
          },
        ],
      },
    ];
    groupedColumns.shift();

    return [...baseColumns, ...lastMonth, ...groupedColumns, ...rekonScore];
  }, [data]);

  const dataMapping = useMemo(() => {
    let coreIndex = 1;
    if (!dataSource) return;

    const mappedData = dataSource.map((item, index) => {
      return {
        ...item,
        no: coreIndex++,
        index,
        coreIndex,
        is_parent: true,
      };
    });

    const mappingData = dataSource[0].is_parent ? dataSource : mappedData;
    const mappingData2 = mappingData.map((data, indexParent) => {
      if (
        data.coreIndex == injectedData?.coreIndex &&
        data.parameter == injectedData?.parameter
      ) {
        const mappingChildren = injectedData.children.map(
          (childData, index) => {
            return {
              ...childData,
              is_parent: false,
              index,
              indexParent,
              is_detail: true,
            };
          }
        );

        return {
          ...data,
          index: indexParent,
          indexParent,
          identIndex: data.identIndex || identIndex++,
          children: mappingChildren,
          is_detail: true,
        };
      } else {
        return {
          ...data,
          indexParent,
          index: indexParent,
          identIndex: data.identIndex || identIndex++,
        };
      }
    });
    return mappingData2;
  }, [dataSource, injectedData]);

  const fetchWitelData = async (record) => {
    try {
      const res = await getWitel({
        query: {
          parameter: detailParameter?.replace(/%20/g, " "),
          region: record.parameter,
          level: "witel",
          type: "msa",
        },
      }).unwrap();
      const findData = dataMapping?.find(
        (data) =>
          data.coreIndex == record.coreIndex &&
          data.parameter == record.parameter
      );
      const newData = res.data?.map((data) => ({
        ...data,
        identIndex: data.identIndex || identIndex++,
      }));
      const injectData = { ...findData, children: newData };
      setInjectedData(injectData);
      return res;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const handleExpandCollaps = useCallback(
    async (record) => {
      if (record.is_parent) {
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
          setDataSource(dataMapping);
          if (!success) await fetchWitelData(record);
          setDataSource(dataMapping);
        }
      }
    },
    [dataMapping, expandedRowKey]
  );

  const fetchModalDetail = useCallback(async (record, col) => {
    try {
      const res = await getModalDetail({
        query: {
          parameter: detailParameter?.replace(/%20/g, " "),
          filter: record.parameter,
          week: col,
          level: record.is_parent ? "region" : "witel",
        },
      }).unwrap();
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const openModalDetail = (record, col) => {
    if (!record.index && record.is_parent) return;

    fetchModalDetail(record, col);
  };

  useEffect(() => {
    if (data) setDataSource(data);
  }, [data]);

  return (
    <div>
      {loadingMainData && <Spin fullscreen tip="Sedang Memuat Data..." />}

      <Table
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
          expandIcon: ({ expanded, record }) =>
            record.index > 0 && record?.is_parent ? (
              expanded ? (
                <UpOutlined
                  className="m-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event here
                    handleExpandCollaps(record, expanded);
                  }}
                />
              ) : (
                <DownOutlined
                  className="m-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event here
                    handleExpandCollaps(record, expanded);
                  }}
                />
              )
            ) : (
              <div></div>
            ),
        }}
      >
        {columns.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific !p-3",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  onHeaderCell={() => ({
                    className: "!bg-blue-pacific !p-3",
                  })}
                  onCell={() => ({
                    className: "!p-3",
                  })}
                  align={child.align}
                  fixed={child.fixed}
                  render={(text, record) => {
                    if (child.dataIndex?.startsWith("ach")) {
                      const isBelowTarget =
                        Number(text) < Number(record.target);
                      if (
                        record.parameter.includes("packetloss") &&
                        !record.parameter.includes("internet")
                      )
                        return (
                          <span
                            onClick={() =>
                              openModalDetail(record, child.dataIndex)
                            }
                            className={`${
                              !isBelowTarget
                                ? "!text-red"
                                : "!text-brand-secondary"
                            } curcor-pointer`}
                          >
                            {record.satuan === "%" ? text + "%" : text}
                          </span>
                        );
                      return (
                        <span
                          onClick={() =>
                            openModalDetail(record, child.dataIndex)
                          }
                          className={`${
                            isBelowTarget
                              ? "!text-red"
                              : "!text-brand-secondary"
                          } cursor-pointer`}
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
              onHeaderCell={() => ({
                className: "!bg-blue-pacific !p-3",
              })}
              onCell={() => ({
                className: "!p-3",
              })}
              align={column.align}
              fixed={column.fixed}
              render={(text, record, index) => {
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

export { TableDetailParameterMSA };
