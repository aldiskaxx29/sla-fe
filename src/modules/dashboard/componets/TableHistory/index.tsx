// Antd
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Image, Spin, Table } from "antd";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDashboard } from "../../hooks/dashboard.hooks";

const { Column, ColumnGroup } = Table;

import arrowDropdown from "@/assets/arrow_dropdown.svg";

interface TableHistoryProps {
  dataSource: Record<string, unknown>[];
  treg: string;
}

let identIndex = 1;

const TableHistory: React.FC<TableHistoryProps> = ({ dataSource:data, treg }) => {
  const [dataSource, setDataSource] = useState(data);
  const [loading, setLoading] = useState(false);
  const [injectedData, setInjectedData] = useState([]);
  const { getHistoryData } = useDashboard();
  const [detailParameter, setDetailParameter] = useState("");
  const [injectedChildData, setInjectedChildData] = useState({});
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    []
  );
  const dataSourceWithKeys = useMemo(() => {
    return (
      dataSource?.map((item, index) => ({
        ...item,
        key: item.key || item.id || `row-${index}`,
      })) || []
    );
  }, [dataSource]);

  const dataMapping = useMemo(() => {
     const mappingData2 = dataSource.map((data, indexParent) => {
       if (
         data.coreIndex == injectedData?.coreIndex &&
         data.parameter == injectedData?.parameter
       ) {
         const mappingChildren = injectedData?.children?.map(
           (childData, index) => {
             let childrenMapped = [];
 
             if (
               injectedChildData.identIndex === childData.identIndex &&
               Array.isArray(injectedChildData.children)
             ) {
               childrenMapped = injectedChildData?.children?.map((grandChild) => ({
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

  const fetchWitelData = useCallback(
     async (record) => {
       setLoading(true);
       try {
         let res;
         const mini_parameter = record.parameter.toLocaleLowerCase();
         if (record.main_parent) {
           res = await getHistoryData({
             query: {
               type: mini_parameter,
               kpi: record.parameter.toLocaleLowerCase(),
               sort: "asc",
               treg,
               level: "region"
             },
           }).unwrap();
         } else {
           res = await getHistoryData({
             query: {
               kpi: detailParameter
                 ?.replace(/%20/g, " ")
                 .toLocaleLowerCase(),
               region: record.parameter,
               level: "witel",
               type: 'msa',
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
           const newData = res?.map((data) => ({
             ...data,
             mini_parameter,
             identIndex: data.identIndex || identIndex++,
           }));
           const injectData = { ...findData, children: newData };           
           setInjectedData(injectData);
         } else {
           const findData = dataMapping[record.indexParent];
           const newData = res?.map((data) => ({
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
     [dataMapping, detailParameter, treg]
   );

  const columns = useMemo(() => {
    if (!dataSource) return [];

    // 1) Static "region" / "parameter" / etc.
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
                return text;
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
      console.log(dataMapping);
      
    },
    [dataMapping, expandedRowKey, fetchWitelData]
  );

  return (
    <div>
      {(loading && <Spin fullscreen tip="Sedang Memuat Data..." />)}

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
          expandIcon: () => <div></div>,
        }}
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
                  key={child.key || child.dataIndex} // Ensure unique keys
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  align={child.align}
                  onHeaderCell={child.onHeaderCell}
                  fixed={child.fixed}
                  onCell={(record, index) => {
                    const isLastTwo =
                      record.parameter.toLowerCase().includes("service") ||
                      record.parameter.toLowerCase().includes("weighted");
                    return {
                      className: isLastTwo ? "!bg-blue-pacific !p-3" : "!p-3",
                    };
                  }}
                  render={(text, record, index) => {
                    const isLastTwo =
                      record.parameter.toLowerCase().includes("service") ||
                      record.parameter.toLowerCase().includes("weighted");
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
              key={column.key || column.dataIndex}
              title={column.title}
              dataIndex={column.dataIndex}
              width={column.width}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
              fixed={column.fixed}
              align={column.align}
              onCell={(record, index) => {
                const isLastTwo =
                  record.parameter.toLowerCase().includes("service") ||
                  record.parameter.toLowerCase().includes("weighted");
                return {
                  className: isLastTwo ? "!bg-blue-pacific !p-3" : "!p-3",
                };
              }}
              render={(text, record, index) => {
                const isLastTwo =
                  record.parameter.toLowerCase().includes("service") ||
                  record.parameter.toLowerCase().includes("weighted");
                if (column.dataIndex === "parameter" && !isLastTwo) {
                  return (
                    <div
                      onClick={() => handleExpandCollaps(record)}
                    >
                       <Image
                        className={`${
                          record.main_parent || record.parent
                            ? "block cursor-pointer"
                            : "hidden"
                        } `}
                        width={10}
                        src={arrowDropdown}
                        preview={false}
                      />
                     <span 
                      className="ml-2"
                      >{text}
                     </span>
                    </div>
                    ); 
                }
                if (column.dataIndex === "no" && !isLastTwo) {
                  return <span>{index + 1}</span>;
                }
                if (isLastTwo) {
                  return (
                    <span className={`${text ? "font-bold" : ""}`}>
                      {text}
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
