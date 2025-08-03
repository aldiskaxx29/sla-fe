import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Skeleton, Spin, Table } from "antd";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";

import { MinusSquareTwoTone, PlusSquareTwoTone } from "@ant-design/icons";
import ChartMSA from "../ChartMSA";

const { Column, ColumnGroup } = Table;

// Function to categorize data
const categorizeData = (data) => {
  const sampleRecord = data[0];

  // Identify weekly & monthly keys
  const weeklyKeys = Object.keys(sampleRecord).filter((key) =>
    /^ach(_\d+)+$/.test(key)
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
    { title: "No", dataIndex: "no", key: "no", fixed: "left", width: 100 },
    {
      title: "Parameter",
      dataIndex: "parameter",
      key: "parameter",
      fixed: "left",
      width: 100,
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
      width: 100,
      fixed: "left",
    },
    {
      title: "Level SLA",
      dataIndex: "level_sla",
      key: "level_sla",
      width: 100,
      fixed: "left",
    },
  ];

  // Group weekly data under each month
  const groupedColumns = monthlyKeys.map((monthKey) => {
    const monthTitle = monthMapping[monthKey] || monthKey; // Use readable month name
    const relatedWeeks = weeklyKeys.filter(
      (weekKey, index) =>
        Math.floor(index / 4) + 1 === parseInt(monthKey.replace("ach_fm_", ""))
    );

    return {
      title: monthTitle,
      key: monthKey,
      children: [
        ...relatedWeeks.map((weekKey) => ({
          title: `W${weekKey.split("_")[2]}`,
          dataIndex: weekKey,
          key: weekKey,
          children: [
            {
              title: `W${weekKey.split("_")[2]}`,
              dataIndex: weekKey,
              key: weekKey,
            },
          ],
        })),
        {
          title: "FM",
          dataIndex: monthKey,
          key: monthKey,
        },
      ],
    };
  });

  return [...baseColumns, ...groupedColumns];
};
let identIndex = 1;

const TableCNOP = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { getDetailCNP, getChartMonitoring, dataChartMonitoring } =
    useDashboard();
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    []
  );
  const [dataSoure, setDataSource] = useState(data);
  const [injectedData, setInjectedData] = useState([]);
  const [injectedDataChild, setInjectedDataChild] = useState([]);
  const [distribution_pl, setDistribution_pl] = useState("");
  const [mttrq, setmttrq] = useState("");
  const [loading, setLoading] = useState(false);

  const dataWithIndex = useMemo(() => {
    let coreIndex = 1;
    let subIndex = "a".charCodeAt(0);

    const mappedData = dataSoure.map((item, index) => {
      if (!isNaN(item.parameter.split(" ")[0])) {
        subIndex = "a".charCodeAt(0);
        return {
          ...item,
          no: coreIndex++,
          index,
          coreIndex,
          is_parent: true,
        };
      }

      const letter = String.fromCharCode(subIndex++).toLowerCase();
      return {
        ...item,
        parameter: `${letter}. ${item.parameter}`,
        no: null,
        index,
        coreIndex,
        is_parent: true,
      };
    });

    const mappingData1 = dataSoure[0].is_parent ? dataSoure : mappedData;

    const mappingData2 = mappingData1.map((data, indexParent) => {
      if (
        data.coreIndex == injectedData?.coreIndex &&
        data.parameter == injectedData?.parameter
      ) {
        let subIndex = "a".charCodeAt(0);
        const mappingChildren = injectedData.children.map(
          (childData, index) => {
            const letter = String.fromCharCode(subIndex++).toLowerCase();

            let childrenMapped = [];
            if (
              injectedDataChild.region_tsel === childData.region_tsel &&
              Array.isArray(injectedDataChild.children)
            ) {
              childrenMapped = injectedDataChild.children.map((grandChild) => ({
                ...grandChild,
                parameter: grandChild.witel || grandChild.region_tsel,
                is_parent: false,
                index,
                indexParent,
                is_detail: true,
              }));
            }

            return {
              ...childData,
              parameter: `${letter}. ${
                childData.witel || childData.region_tsel
              }`,
              is_parent: false,
              index,
              indexParent,
              children: childrenMapped,
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
      }

      return {
        ...data,
        indexParent,
        index: indexParent,
        identIndex: data.identIndex || identIndex++,
      };
    });

    return mappingData2;
  }, [dataSoure, injectedData, injectedDataChild]);

  const categorizedData = useMemo(() => categorizeData(dataSoure), [dataSoure]);

  const checkMTTRQ = (parameter, record) => {
    if (
      parameter[dataWithIndex[record.indexParent].coreIndex - 2]?.includes(
        "mttr"
      ) &&
      record.is_parent
    ) {
      if (record.parameter.includes("Non")) {
        setmttrq("non jawa");
        return "non jawa";
      } else {
        setmttrq("jawa");
        return "jawa";
      }
    }
    return mttrq;
  };

  const fetchChildData = useCallback(
    async (record) => {
      const parameter = [
        "packetloss ran to core",
        "latency ran to core",
        "jitter ran to core",
        "packetloss core to internet",
        "latency core to internet",
        "jitter core to internet",
        "mttrq to core major",
        "mttrq to core minor",
      ];
      setLoading(true);

      try {
        const res = await getDetailCNP({
          query: {
            parameter: record.is_parent
              ? parameter[record.coreIndex - 2]
              : parameter[dataWithIndex[record.indexParent].coreIndex - 2],
            region: record.coreIndex
              ? record.parameter.split(" ").slice(1, 3).join(" ").toLowerCase()
              : !record.is_parent
              ? record.parameter.split(" ").slice(1, 3).join(" ").toLowerCase()
              : "",
            mttr: checkMTTRQ(parameter, record),
            type: record.is_parent ? "region" : "witel",
            distribution_pl:
              record.coreIndex < 3
                ? record.parameter.split(" ")[2]
                : distribution_pl || "",
          },
        }).unwrap();
        if (record.coreIndex < 3) {
          setDistribution_pl(record.parameter.split(" ")[2]);
        }

        if (record.is_parent) {
          const findData = dataWithIndex.find(
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
        } else {
          const findData = dataWithIndex[record.indexParent];
          const newData = res.data?.map((data) => ({
            ...data,
            identIndex: data.identIndex || identIndex++,
            is_detail: true,
          }));
          const injectData = {
            ...findData.children[record.index],
            children: newData,
          };
          setInjectedDataChild(injectData);
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [dataWithIndex, distribution_pl, mttrq]
  );

  const fetchChart = async (record) => {
    const parameter = [
      "packetloss ran to core",
      "latency ran to core",
      "jitter ran to core",
      "packetloss core to internet",
      "latency core to internet",
      "jitter core to internet",
      "mttrq to core major",
      "mttrq to core minor",
    ];
    try {
      const res = await getChartMonitoring({
        query: {
          region: record.parameter
            .replace(/^[a-zA-Z]\.\s*/, "") // Remove leading "a. ", "b. ", etc.
            .split(" ")
            .slice(0, 2)
            .join(" ")
            .toLowerCase(),

          parameter: record.is_parent
            ? parameter[record.coreIndex - 2]
            : parameter[dataWithIndex[record.indexParent].coreIndex - 2],
          distribution_pl:
            record.coreIndex < 3
              ? record.parameter.split(" ")[2]
              : distribution_pl || "",
          mttr: checkMTTRQ(parameter, record),
          type:
            record.is_parent || (record.scop && !record.scop.includes("Witel"))
              ? "region"
              : "witel",
        },
      }).unwrap();
      const title = record.is_parent
        ? parameter[record.coreIndex - 2]
        : parameter[dataWithIndex[record.indexParent].coreIndex - 2];
      if (title.includes("packetloss")) {
        setDescription("Lower Better");
      } else {
        setDescription("Higher Better");
      }
      setTitle(snakeToPascal_Utils(title));
    } catch (error) {
      console.log(error);
    }
  };

  const openModal = (record) => {
    fetchChart(record);
    setIsOpen(!isOpen);
  };

  const handleRowDetail = (record) => {
    const parameter = ["packetloss", "latency", "jitter", "mttrq"];

    const isMatch = parameter.some((p) =>
      record.parameter.toLowerCase().includes(p)
    );

    if (isMatch) {
      console.log("tidak masuk");
    } else if (record.is_detail) {
      openModal(record);
    }
  };

  const handleExpandCollaps = useCallback(
    async (record) => {
      if (record.scop) {
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
          const success = await fetchChildData(record);
          setDataSource(dataWithIndex);
          if (!success) await fetchChildData(record);
          setDataSource(dataWithIndex);
        }
      }
    },
    [expandedRowKey, dataWithIndex, distribution_pl]
  );

  const transformedData = (rawData) => {
    const sampleRecord = rawData[0];
    // Regex to match week pattern: ach_<number>_<number>
    const weekKeys = Object.keys(sampleRecord).filter((key) =>
      /^ach_\d+_\d+$/.test(key)
    );

    // Optionally sort the weekKeys for consistent ordering
    weekKeys.sort((a, b) => {
      const [_, a1, a2] = a.split("_").map(Number);
      const [__, b1, b2] = b.split("_").map(Number);
      return a1 - b1 || a2 - b2;
    });

    return {
      week: weekKeys,
      data: [
        {
          name: "realisasi",
          data: weekKeys.map((key) => rawData[0][key] || "0"),
        },
        {
          name: "target",
          data: weekKeys.map(() => rawData[0].target),
        },
      ],
    };
  };

  useEffect(() => {
    setDataSource(data);
  }, [data]);

  return (
    <>
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <Table
        dataSource={dataWithIndex}
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        scroll={{
          x: "calc-size(calc-size(max-content, size), size + 400px)",
          y: 55 * 10,
        }}
        onRow={(record) => ({
          onClick: () => handleRowDetail(record),
        })}
        rowKey={(record) => record.identIndex}
        expandable={{
          expandedRowKeys: expandedRowKey,
          rowExpandable: (record) => !!record?.scop,
          expandIcon: ({ expanded, record }) =>
            record.scop ? (
              expanded ? (
                <MinusSquareTwoTone
                  className="m-2"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the event here
                    handleExpandCollaps(record);
                  }}
                />
              ) : (
                <PlusSquareTwoTone
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
        {categorizedData.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={() => ({
                className: "!bg-[#EEF0F2]",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  onHeaderCell={() => ({
                    className: "!bg-[#C5E3E6]",
                  })}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  className={
                    child.dataIndex?.includes("fm") ? "bg-[#EDF6F7]" : ""
                  }
                  render={(text, record) => {
                    if (child.dataIndex?.startsWith("ach")) {
                      const isBelowTarget =
                        Number(text) < Number(record.target);
                      if (
                        (record.parameter?.includes("packetloss") ||
                          record.indexParent < 3) &&
                        !record.parameter?.includes("internet")
                      )
                        return (
                          <span
                            style={{ color: !isBelowTarget ? "red" : "black" }}
                          >
                            {record.satuan === "%" ? text + "%" : text}
                          </span>
                        );
                      return (
                        <span
                          style={{ color: isBelowTarget ? "red" : "black" }}
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
              onHeaderCell={() => ({
                className: "!bg-[#EEF0F2]",
              })}
              render={(text, record, index) => {
                if (column.dataIndex?.startsWith("ach")) {
                  const isBelowTarget = Number(text) < Number(record.target);
                  return (
                    <span style={{ color: isBelowTarget ? "red" : "inherit" }}>
                      {text}
                    </span>
                  );
                } else if (
                  column.dataIndex?.includes("parameter") &&
                  !text?.includes("%")
                ) {
                  return text?.replace(/[0-9]/g, "");
                } else if (
                  column.dataIndex == "no" &&
                  column.dataIndex?.toLowerCase().includes("core")
                ) {
                  return index + 1;
                }
                return text;
              }}
            />
          )
        )}
      </Table>
      <Modal
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={"90%"}
      >
        {dataChartMonitoring ? (
          <div>
            <p className="text-xl font-medium text-center">
              Trend Chart Detail
            </p>

            <ChartMSA
              title={title}
              description={description}
              data={transformedData(dataChartMonitoring?.data)}
            />
          </div>
        ) : (
          <Skeleton active />
        )}
      </Modal>
    </>
  );
};

export default TableCNOP;
