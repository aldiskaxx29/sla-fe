// Antd
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Spin, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";
import { ModalDetail } from "../ModalDetail";

const { Column, ColumnGroup } = Table;

interface TableDetailParameterCNOPProps {
  data: Record<string, unknown>[];
  loadingMainData?: boolean;
  filterBy: string;
}
let identIndex = 1;

const TableDetailParameterCNOP: React.FC<TableDetailParameterCNOPProps> = ({
  data,
  loadingMainData,
  filterBy,
}) => {
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    []
  );

  const [injectedData, setInjectedData] = useState([]);
  const [dataSource, setDataSource] = useState(data);
  const { getWitel, getModalDetail, dataModalDetail } = useDashboard();
  const { detailParameter } = useParams();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const columns = useMemo(() => {
    if (!dataSource) return [];
    // Extract keys dynamically
    // Extract keys dynamically
    const sampleRecord = dataSource[0];

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
      },
      {
        title: "Target",
        dataIndex: "target",
        key: "target",
        align: "center",
      },
      {
        title: "Level SLA",
        dataIndex: "level_sla",
        key: "weight",
      },
    ];

    const getCellStyles = (data) => {
      const extractNumber = (str) => {
        if (!str) return NaN;
        const match = str.toString().match(/^\d+/);
        return match ? Number(match.input) : NaN;
      };

      const targetValue = extractNumber(data.target);

      const achievementKeys = Object.keys(data).filter((key) =>
        key.startsWith("ach_")
      );

      const cellStyles = {};

      achievementKeys.forEach((key) => {
        const achValue = extractNumber(data[key]);
        const isBelowTargetPL = achValue <= targetValue;
        const isBelowTarget = achValue < targetValue;
        let style = "";

        if (
          detailParameter?.toLowerCase().includes("pl") ||
          filterBy.includes("ne")
        ) {
          style =
            !isBelowTargetPL && data.is_parent
              ? "bg-red-100 !p-3 text-center"
              : "!p-3 text-center";
        } else {
          style =
            isBelowTarget && data.is_parent
              ? "bg-red-100 !p-3 text-center"
              : "!p-3 text-center";
        }

        cellStyles[key] = {
          className: style,
        };
      });

      return cellStyles;
    };

    const getOnCell = (dataIndex) => (record, rowIndex) => {
      const cellStyles = getCellStyles(record);
      const achievementKeys = Object.keys(record).filter((key) =>
        key.startsWith("ach_")
      );

      if (achievementKeys.includes(dataIndex) && cellStyles[dataIndex]) {
        return cellStyles[dataIndex];
      }

      return {};
    };

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
              onCell: getOnCell(weekKey),
              key: weekKey,
              align: "center",
            };
          }),
          {
            title: "FM",
            dataIndex: `ach_fm_${monthNum}`,
            key: `ach_fm_${monthNum}`,
            onCell: getOnCell(`ach_fm_${monthNum}`),
            align: "center",
          },
        ],
      };
    });
    const findLastKey = parseInt(groupedColumns[0].key.split("_")[2]);

    const lastMonth = [
      {
        title: monthMapping[`ach_fm_${findLastKey}`],
        key: `ach_fm_${findLastKey}`,
        dataIndex: `ach_fm_${findLastKey}`,
        onCell: getOnCell(`ach_fm_${findLastKey}`),
      },
    ];
    groupedColumns.shift();

    return [...baseColumns, ...lastMonth, ...groupedColumns];
  }, [dataSource]);

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
          filter: filterBy,
          type: "cnop",
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
      if (record.is_parent && record.index > 0) {
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
        }
      }
    },
    [expandedRowKey, dataMapping]
  );

  const controlModalDetail = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const fetchModalDetail = useCallback(async (record, col) => {
    try {
      setLoading(true);
      console.log(detailParameter?.includes("%3"));

      const res = await getModalDetail({
        query: {
          parameter: detailParameter?.includes("%3")
            ? "pl >5% ran to core"
            : detailParameter?.replace(/%20/g, " "),
          filter: record.parameter,
          week: col,
          level: record.is_parent ? "region" : "witel",
        },
      });

      controlModalDetail();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const openModalDetail = (record, col) => {
    if (col.startsWith("ach_fm_")) {
      return;
    }
    if (!record.index && record.is_parent) return;

    fetchModalDetail(record, col);
  };

  useEffect(() => {
    if (data) setDataSource(data);
  }, [data]);

  return (
    <div>
      {(loadingMainData || loading) && (
        <Spin fullscreen tip="Sedang Memuat Data..." />
      )}

      <Table
        dataSource={dataMapping}
        bordered
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        className="rounded-xl"
        rowKey={(record) => record?.identIndex}
        expandable={{
          expandedRowKeys: expandedRowKey,
          rowExpandable: (record) => !!record?.scop,
          expandIcon: ({ expanded, record }) =>
            record.index > 0 && record?.is_parent ? (
              expanded ? (
                <UpOutlined
                  className="m-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event here
                    handleExpandCollaps(record);
                  }}
                />
              ) : (
                <DownOutlined
                  className="m-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event here
                    handleExpandCollaps(record);
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
                className: "!bg-blue-pacific !p-3 text-center",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  onCell={child.onCell}
                  onHeaderCell={() => ({
                    className: "!bg-blue-pacific !p-3 text-center",
                  })}
                  align={child.align}
                  fixed={child.fixed}
                  render={(text, record) => {
                    if (child.dataIndex?.startsWith("ach")) {
                      const extractNumber = (str) => {
                        if (!str) return NaN;
                        const match = str.toString().match(/^\d+/);
                        return match ? Number(match.input) : NaN;
                      };
                      const isBelowTarget =
                        extractNumber(text) < extractNumber(record.target);
                      const isBelowTargetPl =
                        extractNumber(text) <= extractNumber(record.target);
                      if (
                        detailParameter?.toLocaleLowerCase().includes("pl") ||
                        filterBy.includes("ne")
                      )
                        return (
                          <span
                            onClick={() =>
                              openModalDetail(record, child.dataIndex)
                            }
                            className={`${
                              !isBelowTargetPl && record.is_parent
                                ? "text-red-500"
                                : "text-brand-secondary"
                            } cursor-pointer`}
                          >
                            {text}
                          </span>
                        );
                      return (
                        <span
                          className={`${
                            isBelowTarget && record.is_parent
                              ? "text-red-500"
                              : "text-brand-secondary"
                          }`}
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
              onCell={column.onCell}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific !p-3 text-center",
              })}
              align={column.align}
              fixed={column.fixed}
              render={(text, record, index) => {
                if (column.dataIndex?.startsWith("ach")) {
                  const extractNumber = (str) => {
                    if (!str) return NaN;
                    const match = str.toString().match(/^\d+/);
                    return match ? Number(match.input) : NaN;
                  };
                  const isBelowTarget =
                    extractNumber(text) < extractNumber(record.target);
                  const isBelowTargetPL =
                    extractNumber(text) <= extractNumber(record.target);
                  if (
                    detailParameter?.toLocaleLowerCase().includes("pl") ||
                    filterBy.includes("ne")
                  )
                    return (
                      <span
                        className={`${
                          !isBelowTargetPL && record.is_parent
                            ? "text-red-500"
                            : "text-brand-secondary"
                        }`}
                      >
                        {text}
                      </span>
                    );
                  return (
                    <span
                      className={`${
                        isBelowTarget && record.is_parent
                          ? "text-red-500"
                          : "text-brand-secondary"
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
      <ModalDetail
        dataSource={dataModalDetail?.data}
        title="Detail CNOP"
        isOpen={isOpen}
        handleCancel={controlModalDetail}
      />
    </div>
  );
};

export { TableDetailParameterCNOP };
