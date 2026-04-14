import { Image, Spin, Table, Modal } from "antd";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";

import arrowDropdown from "@/assets/arrow_dropdown.svg";

interface TableParentChildProps {
  data: Record<string, unknown>[];
  loadingMainData: boolean;
  treg: string;
}

interface WeeklyDetailData {
  week: string;
  kpi: string;
  region: string;
  year: number;
}

interface RealisasiResponse {
  data?: {
    before?: Record<string, unknown>[];
    after?: Record<string, unknown>[];
  };
}

let identIndex = 1;

const TableParentChild: React.FC<TableParentChildProps> = ({
  data,
  loadingMainData,
  treg,
}) => {
  const [loading, setLoading] = useState(false);
  const [detailParameter, setDetailParameter] = useState("");
  const [dataSource, setDataSource] = useState<Record<string, unknown>[]>([]);
  const [injectedData, setInjectedData] = useState<Record<string, unknown>>({});
  const [injectedChildData, setInjectedChildData] = useState<Record<string, unknown>>({});
  const { getWitel, getCNP, getDetailsiteNotclear, getWeeklyMonth } = useDashboard();
  const { menuId } = useParams();
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    []
  );
  const [filter] = useState("by total ne");

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState<Record<string, unknown>[] | null>(null);
  const [weeklyDetail, setWeeklyDetail] = useState<WeeklyDetailData | null>(null);

  // Modal Realisasi states
  const [realisasiModalVisible, setRealisasiModalVisible] = useState(false);
  const [realisasiModalLoading, setRealisasiModalLoading] = useState(false);
  const [realisasiModalData, setRealisasiModalData] = useState<RealisasiResponse | null>(null);
  const [realisasiDetail, setRealisasiDetail] = useState<{ month: string; kpi: string; monthNum: number } | null>(null);

  useEffect(() => {
    if (!data) return;
    setDataSource(data);
  }, [data]);

  const formatText = (text) => {
    return text?.replace(/_/g, " ") // Mengganti underscore dengan spasi
      .toLowerCase() // Mengubah semua huruf menjadi kecil terlebih dahulu
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Kapitalisasi setiap kata
  };

  const formatWeekMonth = (text) => {
    // Validasi agar tidak undefined atau null
    if (!text || typeof text !== "string") {
      return "";
    }
  
    const match = text.match(/week_(\d+)_(\d+)/i);
    if (!match) {
      return text.replace(/_/g, " ");
    }
  
    const monthNumber = parseInt(match[1], 10);
    const weekNumber = parseInt(match[2], 10);
  
    const monthName = new Intl.DateTimeFormat("id-ID", {
      month: "long",
    }).format(new Date(2024, monthNumber - 1, 1));
  
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} Week ${weekNumber}`;
  };

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

  // Function to generate realisasi columns based on month
  const generateRealisasiColumns = (monthNum: number, kpi?: string) => {
    const weekCount = monthNum === 2 ? 4 : 5; // Month 2 has 4 weeks, month 3 has 5 weeks
    const isPacketloss =
      kpi?.toLowerCase().includes("packetloss") &&
      kpi?.toLowerCase().includes("ran to core");

    const renderAchievement = (text: unknown, record: Record<string, unknown>): React.ReactNode => {
      if (text === null || text === undefined || text === "") return "-";
      const value = Number(text);
      const target = Number(record.target);
      if (Number.isNaN(value) || Number.isNaN(target)) return text as React.ReactNode;

      const isAboveTarget = value > target;
      // Packetloss: merah jika di atas target. Lainnya: hijau jika di atas target.
      const isGood = isPacketloss ? !isAboveTarget : isAboveTarget;

      return (
        <span className={isGood ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
          {text as React.ReactNode}
        </span>
      );
    };

    const columnsArray: Array<{
      title: string;
      dataIndex?: string;
      key: string;
      render: (text: unknown, record?: Record<string, unknown>) => React.ReactNode;
      width?: number;
    }> = [
      {
        title: "No.",
        key: "no",
        render: (_, __, index) => index + 1,
        width: 50,
      },
      {
        title: "Reg",
        dataIndex: "region_tsel",
        key: "region_tsel",
        render: (text) => (text ?? "-") as React.ReactNode,
      },
      {
        title: "Target",
        dataIndex: "target",
        key: "target",
        render: (text) => (text ?? "-") as React.ReactNode,
      },
    ];

    // Add week columns dynamically
    for (let i = 1; i <= weekCount; i++) {
      columnsArray.push({
        title: `W${i}`,
        dataIndex: `ach_${monthNum}_${i}`,
        key: `ach_${monthNum}_${i}`,
        render: renderAchievement,
      });
    }

    // Add month column
    columnsArray.push({
      title: monthNum === 2 ? "Feb" : "Mar",
      dataIndex: `ach_fm_${monthNum}`,
      key: `ach_fm_${monthNum}`,
      render: renderAchievement,
    });

    return columnsArray;
  };

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
          if (record.parameter === "PACKETLOSS 1-5% RAN TO CORE" || record.parameter === "PACKETLOSS >5% RAN TO CORE") {
            // Hilangkan .00
            return parseFloat(text).toFixed(2).endsWith(".00")
              ? parseInt(text)
              : text;
          }
          return text;
        },
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
            render: (text: unknown, record: unknown) => {
              if (!text) return text;
              return (
                <span
                  className="!text-blue-600 p-1 bg-blue-50 rounded-sm cursor-pointer font-semibold hover:bg-blue-100"
                  onClick={() => fetchRealisasiMonthly("before_rekon", monthNum, record as Record<string, unknown>)}
                  role="button"
                  tabIndex={0}
                >
                  {text as React.ReactNode}
                </span>
              );
            },
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
            render: (text: unknown, record: unknown) => {
              if (!text) return text;
              return (
                <span
                  className="!text-blue-600 p-1 bg-blue-50 rounded-sm cursor-pointer font-semibold hover:bg-blue-100"
                  onClick={() => fetchRealisasiMonthly("after_rekon", monthNum, record as Record<string, unknown>)}
                  role="button"
                  tabIndex={0}
                >
                  {text as React.ReactNode}
                </span>
              );
            },
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

  const fetchWeeklyDetail = useCallback(
    async (weekKey: string, record: Record<string, unknown>) => {
      setModalLoading(true);
      try {
        const weekNum = weekKey.split("_")[2]; // Ekstrak nomor minggu dari "ach_1_3" -> "3"
        const monthNum = weekKey.split("_")[1]; // Ekstrak nomor bulan dari "ach_1_3" -> "1"
        
        const weekParam = `week_${monthNum}_${weekNum}`;
        
        let kpiParam = "";
        let regionParam = "";
        
        const isParent = record.main_parent;
        
        if (isParent) {
          kpiParam = (record.parameter?.toString() || "").toLowerCase();
          regionParam = "";
        } else {
          console.log(record);
          
          kpiParam = (record.mini_parameter?.toString() || "").toLowerCase();
          regionParam = (record.parameter?.toString() || "").toLowerCase();
        }
        
        const yearParam = new Date().getFullYear();

        const response = await getDetailsiteNotclear({
          query: {
            week: weekParam,
            year: yearParam,
            kpi: kpiParam,
            region: regionParam,
            type: menuId,
          },
        }).unwrap();

        const responseData =
          response && typeof response === "object" && "data" in response
            ? (response as { data?: Record<string, unknown>[] }).data
            : response;

        setModalData(Array.isArray(responseData) ? responseData : null);
        setWeeklyDetail({
          week: weekParam,
          kpi: kpiParam,
          region: regionParam,
          year: yearParam,
        });
        setModalVisible(true);
        return true;
      } catch (error) {
        console.log("Error fetching weekly detail:", error);
        return false;
      } finally {
        setModalLoading(false);
      }
    },
    [getDetailsiteNotclear, menuId]
  );

  const fetchRealisasiMonthly = useCallback(
    async (monthKey: string, monthNum: number, record: Record<string, unknown>) => {
      setRealisasiModalLoading(true);
      try {
        let kpiParam = "";
        
        const isParent = record.main_parent;
        
        if (isParent) {
          kpiParam = (record.parameter?.toString() || "").toLowerCase();
        } else {
          kpiParam = (record.mini_parameter?.toString() || "").toLowerCase();
        }
        
        const yearParam = new Date().getFullYear();
        const monthParam = `${monthKey}_${monthNum}`;

        const response = await getWeeklyMonth({
          query: {
            month: monthParam,
            year: yearParam,
            kpi: kpiParam,
            type: menuId,
          },
        }).unwrap();

        setRealisasiModalData(response as RealisasiResponse);
        setRealisasiDetail({
          month: monthKey,
          kpi: kpiParam,
          monthNum: monthNum,
        });
        setRealisasiModalVisible(true);
        return true;
      } catch (error) {
        console.log("Error fetching realisasi monthly:", error);
        return false;
      } finally {
        setRealisasiModalLoading(false);
      }
    },
    [getWeeklyMonth, menuId]
  );

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

  const columnPop = useMemo(() => {
    const isMttrq =
      weeklyDetail?.kpi?.toLowerCase().includes("mttrq");
  
    // Kolom khusus untuk KPI MTTRQ
    if (isMttrq) {
      return [
        {
          title: "No",
          key: "no",
          render: (_: any, __: any, index: number) => index + 1,
          width: 60,
        },
        {
          title: "Month",
          dataIndex: "month",
          key: "month",
          render: (text: string) => text ?? "-",
        },
        {
          title: "No Ticket",
          dataIndex: "ticket_id",
          key: "ticket_id",
          render: (text: string) => text ?? "-",
        },
        {
          title: "Site Id",
          dataIndex: "site_id",
          key: "site_id",
          render: (text: string) => text ?? "-",
        },
        {
          title: "Final Severity",
          dataIndex: "final_severity",
          key: "final_severity",
          render: (text: string) => text ?? "-",
        },
        {
          title: "Witel",
          dataIndex: "witel",
          key: "witel",
          render: (text: string) => text ?? "-",
        },
        {
          title: "Treshold",
          dataIndex: "treshold",
          key: "treshold",
          render: (text: string) => text ?? "-",
        },
        {
          title: "TTR Awal",
          dataIndex: "ttr_customer_jam",
          key: "ttr_customer_jam",
          render: (text: string) => text ?? "-",
        },
        {
          title: "TTR Selisih",
          dataIndex: "ttr_selisih",
          key: "ttr_selisih",
          render: (text: string) => text ?? "-",
        },
        {
          title: "TTR Final",
          dataIndex: "ttr_final",
          key: "ttr_final",
          render: (text: string) => text ?? "-",
        },
        {
          title: "Ket Recon",
          dataIndex: "ket_recon",
          key: "ket_recon",
          render: (text: string) => text ?? "-",
        },
      ];
    }
  
    // Kolom default
    return [
      {
        title: "No.",
        key: "no",
        render: (_: any, __: any, index: number) => index + 1,
        width: 50,
      },
      {
        title: "Week",
        dataIndex: "week",
        key: "week",
        render: (text: string) => text ?? "-",
      },
      {
        title: "Region",
        dataIndex: "region_tsel",
        key: "region_tsel",
        render: (text: string) => text ?? "-",
      },
      {
        title: "Area",
        dataIndex: "area",
        key: "area",
        render: (text: string) => text ?? "-",
      },
      {
        title: "Site ID",
        dataIndex: "site_id",
        key: "site_id",
        render: (text: string) => text ?? "-",
      },
      {
        title: "PL Status",
        dataIndex: "packetloss_status",
        key: "packetloss_status",
        render: (text: string) => text ?? "-",
      },
      {
        title: "DIST PL",
        dataIndex: "distribution_pl",
        key: "distribution_pl",
        render: (text: string) => text ?? "-",
      },
      {
        title: "Value",
        dataIndex: "value",
        key: "value",
        render: (text: number) =>
          text !== null && text !== undefined ? text : "-",
      },
      {
        title: "Group RCA",
        dataIndex: "grouping_rca",
        key: "grouping_rca",
        render: (text: string) => text ?? "-",
      },
      {
        title: "Detail RCA",
        dataIndex: "detail_rca",
        key: "detail_rca",
        render: (text: string) => text ?? "-",
      },
      {
        title: "Update Progres",
        dataIndex: "update_progress_packetloss",
        key: "update_progress_packetloss",
        render: (text: string) => text ?? "-",
      },
      {
        title: "Last Update",
        dataIndex: "last_update_packetloss_cnq",
        key: "last_update_packetloss_cnq",
        render: (text: string) => text ?? "-",
      },
      {
        title: "User Update",
        dataIndex: "user_update_packetloss_cnq",
        key: "user_update_packetloss_cnq",
        render: (text: string) => text ?? "-",
      },
    ];
  }, [weeklyDetail?.kpi]);

  return (
    <div>
      {(loadingMainData || loading || realisasiModalLoading) && (
        <Spin fullscreen tip="Sedang Memuat Data..." />
      )}

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
      {columns.map((col: any) =>
        col.children ? (
            <ColumnGroup
              key={col.key ?? col.title}
              title={col.title}
              onHeaderCell={col.onHeaderCell}
            >
              {col.children.map((child: any) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  onHeaderCell={child.onHeaderCell}
                  onCell={(record) => {
                    const isLastTwo =
                      record.parameter.toLowerCase().includes("service") ||
                      record.parameter.toLowerCase().includes("weighted");
                    const isRealColumn = child?.dataIndex
                      ?.toString()
                      .toLowerCase()
                      .includes("real");
                    const baseOnCell =
                      typeof col.onCell === "function"
                        ? col.onCell()
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
                    // const isBelowTarget = Number(text) <= Number(record.target);
                    const value = Number(text);
                    const target = Number(record.target);

                    if (Number.isNaN(value) || Number.isNaN(target)) {
                      return <span>{text}</span>;
                    }

                    const isJitter = record.mini_parameter
                      ?.toLowerCase()
                      .includes('latency') || 
                      record.mini_parameter
                      ?.toLowerCase()
                      .includes('jitter') ||
                      record.mini_parameter
                      ?.toLowerCase()
                      .includes('mttr');

                    const isBelowTarget = isJitter
                      ? value < target        // 👉 JITTER
                      : value <= target;    

                    if (!text) return text;
                    // if (!record.target && !isLastTwo) {
                    if (
                      (record.target === '' ||
                        record.target === null ||
                        record.target === undefined) &&
                      !isLastTwo
                    ) {
                      return <span>{text}</span>;
                    }
                    if (
                      (child.dataIndex?.startsWith("ach") ||
                        child.dataIndex?.includes("_fm_")) &&
                      child.compare &&
                      !isLastTwo
                    ) {
                      // Check if this is a realisasi column
                      const isRealisasiColumn = /^realisasi_fm_(before|after)_\d+$/.test(child.dataIndex as string);
                      
                      if (isRealisasiColumn && text) {
                        const monthNum = (child.dataIndex as string).match(/\d+$/)?.[0];
                        const isBeforeColumn = (child.dataIndex as string).includes("before");
                        const monthKey = isBeforeColumn ? "before_rekon" : "after_rekon";
                        
                        // Check if packetloss parameter
                        if (
                          record.parameter
                            ?.toLowerCase()
                            .includes("packetloss 1-5% ran to core") ||
                          record.parameter
                            ?.toLowerCase()
                            .includes("packetloss >5% ran to core") ||
                          record.mini_parameter
                            ?.toLowerCase()
                            .includes("packetloss 1-5% ran to core") ||
                          record.mini_parameter
                            ?.toLowerCase()
                            .includes("packetloss >5% ran to core") ||
                          record.mini_parameter
                            ?.toLowerCase()
                            .includes("packetloss ran to core")
                        ) {
                          return (
                            <span
                              className={`${
                                !isBelowTarget
                                  ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                                  : "!text-green-500 p-1 bg-green-50 rounded-sm"
                              } cursor-pointer`}
                              onClick={() => {
                                if (monthNum) {
                                  fetchRealisasiMonthly(monthKey, parseInt(monthNum), record);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              {record.satuan === "%" ? text + "%" : text}
                            </span>
                          );
                        }
                        
                        return (
                          <span
                            className={`${
                              isBelowTarget
                                ? "!text-red-500 p-1 bg-red-50 rounded-sm"
                                : "!text-green-500 p-1 bg-green-50 rounded-sm"
                            } cursor-pointer`}
                            onClick={() => {
                              if (monthNum) {
                                fetchRealisasiMonthly(monthKey, parseInt(monthNum), record);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            {record.satuan === "%" ? text + "%" : text}
                          </span>
                        );
                      }

                      // Check if this is a weekly column (ach_1_1, ach_1_2, etc.)
                      const isWeeklyColumn = /^ach_\d+_\d+$/.test(child.dataIndex);

                      if (
                        record.parameter
                          ?.toLowerCase()
                          .includes("packetloss 1-5% ran to core") ||
                        record.parameter
                          ?.toLowerCase()
                          .includes("packetloss >5% ran to core") ||
                        record.mini_parameter
                          ?.toLowerCase()
                          .includes("packetloss 1-5% ran to core") ||
                        record.mini_parameter
                          ?.toLowerCase()
                          .includes("packetloss >5% ran to core") ||
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
                            } ${isWeeklyColumn ? "cursor-pointer" : ""}`}
                            onClick={() => {
                              if (isWeeklyColumn && text) {
                                fetchWeeklyDetail(child.dataIndex, record);
                              }
                            }}
                            role={isWeeklyColumn ? "button" : undefined}
                            tabIndex={isWeeklyColumn ? 0 : undefined}
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
                          } ${isWeeklyColumn ? "cursor-pointer" : ""}`}
                          onClick={() => {
                            if (isWeeklyColumn && text) {
                              fetchWeeklyDetail(child.dataIndex, record);
                            }
                          }}
                          role={isWeeklyColumn ? "button" : undefined}
                          tabIndex={isWeeklyColumn ? 0 : undefined}
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
              key={col.dataIndex}
              title={col.title}
              dataIndex={col.dataIndex}
              width={col.width}
              onHeaderCell={col.onHeaderCell}
              onCell={(record) => {
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
              align={col.align}
              fixed={col.fixed}
              render={(text, record) => {
                const isBelowTarget = Number(text) < Number(record.target);
                if (col.dataIndex == "parameter") {
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
                            text === "WEIGHTED ACHIEVEMENT NATION" ||
                            text === "SERVICE CREDIT NATION"
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

      {/* Modal untuk detail weekly */}
      <Modal
        title={`Detail ${formatWeekMonth(weeklyDetail?.week)} ${formatText(weeklyDetail?.kpi)}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={null}
        loading={modalLoading}
      >
        {modalLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin tip="Mengambil data..." />
          </div>
        ) : modalData ? (
          <div className="max-h-[650px] overflow-y-auto">
            {Array.isArray(modalData) ? (
              <Table
                dataSource={modalData}
                size="small"
                pagination={{ pageSize: 10 }}
                bordered
                scroll={{ x: "max-content" }}
                columns={columnPop}
                rowKey={(_, index) => index as number}
              />
            ) : (
              <div className="p-4">
                <p>{JSON.stringify(modalData, null, 2)}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">Tidak ada data</div>
        )}
      </Modal>

      {/* Modal untuk Realisasi Monthly */}
      <Modal
        title={`Achievement Prediction - ${realisasiDetail?.kpi?.toUpperCase()}`}
        open={realisasiModalVisible}
        onCancel={() => setRealisasiModalVisible(false)}
        width={1200}
        footer={null}
        loading={realisasiModalLoading}
      >
        {realisasiModalLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin tip="Mengambil data..." />
          </div>
        ) : realisasiModalData && typeof realisasiModalData === "object" && realisasiModalData.data ? (
          <div className="max-h-[700px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              {/* Realisasi Before */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-center">Realisasi Before</h3>
                {realisasiModalData.data?.before && Array.isArray(realisasiModalData.data.before) ? (
                  <Table
                    dataSource={realisasiModalData.data.before}
                    size="small"
                    pagination={{ pageSize: 50, hideOnSinglePage: true }}
                    bordered
                    scroll={{ x: "max-content" }}
                    columns={generateRealisasiColumns(realisasiDetail?.monthNum || 2, realisasiDetail?.kpi)}
                    rowKey={(_, index) => index as number}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500">Tidak ada data</div>
                )}
              </div>

              {/* Realisasi After */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-center">Realisasi After</h3>
                {realisasiModalData.data?.after && Array.isArray(realisasiModalData.data.after) ? (
                  <Table
                    dataSource={realisasiModalData.data.after}
                    size="small"
                    pagination={{ pageSize: 50, hideOnSinglePage: true }}
                    bordered
                    scroll={{ x: "max-content" }}
                    columns={generateRealisasiColumns(realisasiDetail?.monthNum || 2, realisasiDetail?.kpi)}
                    rowKey={(_, index) => index as number}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500">Tidak ada data</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">Tidak ada data</div>
        )}
      </Modal>
    </div>
  );
};

export { TableParentChild };
