import { Image, Skeleton, Table, Modal } from "antd";
import Column from "antd/es/table/Column";
import ColumnGroup from "antd/es/table/ColumnGroup";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "../../hooks/dashboard.hooks";
import { useParams } from "react-router-dom";

import arrowDropdown from "@/assets/arrow_dropdown.svg";

interface TableParentChildProps {
  data: Record<string, unknown>[];
  loadingMainData: boolean;
  treg: string;
  showActualWeeks?: boolean;
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
  showActualWeeks = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingRowKey, setLoadingRowKey] = useState<number | string | null>(
    null,
  );
  const [detailParameter, setDetailParameter] = useState("");
  const [dataSource, setDataSource] = useState<Record<string, unknown>[]>([]);
  const [injectedData, setInjectedData] = useState<Record<string, unknown>>({});
  const [injectedChildData, setInjectedChildData] = useState<
    Record<string, unknown>
  >({});
  const [injectedGrandChildData, setInjectedGrandChildData] = useState<
    Record<string, unknown>
  >({});
  const {
    getWitel,
    getCNP,
    getDetailsiteNotclear,
    getDetailsiteNotclearWeek,
    getWeeklyMonth,
  } = useDashboard();
  const { menuId } = useParams();
  const [expandedRowKey, setExpandedRowKeys] = useState<number[] | string[]>(
    [],
  );
  const [filter] = useState("by total ne");

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalData, setModalData] = useState<Record<string, unknown>[] | null>(
    null,
  );
  const [weeklyDetail, setWeeklyDetail] = useState<WeeklyDetailData | null>(
    null,
  );

  // Modal Realisasi states
  const [realisasiModalVisible, setRealisasiModalVisible] = useState(false);
  const [realisasiModalLoading, setRealisasiModalLoading] = useState(false);
  const [realisasiModalData, setRealisasiModalData] =
    useState<RealisasiResponse | null>(null);
  const [realisasiDetail, setRealisasiDetail] = useState<{
    month: string;
    kpi: string;
    monthNum: number;
  } | null>(null);

  // Site detail modal states (W1-W4 detail click inside Realisasi)
  const [siteDetailModalVisible, setSiteDetailModalVisible] = useState(false);
  const [siteDetailModalLoading, setSiteDetailModalLoading] = useState(false);
  const [siteDetailModalData, setSiteDetailModalData] = useState<any[] | null>(
    null,
  );
  const [siteDetailPagination, setSiteDetailPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [siteDetailParams, setSiteDetailParams] = useState<{
    year: number;
    week: number | string;
    type: string;
    status: string;
    region: string;
  } | null>(null);

  const lastColumnsRef = useRef<any[]>([]);
  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => ({
        __skeleton: true,
        identIndex: `skeleton-${index}`,
      })),
    [],
  );

  useEffect(() => {
    if (!data) return;
    setDataSource(data);
  }, [data]);

  const formatText = (text) => {
    return text
      ?.replace(/_/g, " ") // Mengganti underscore dengan spasi
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

  const skeletonSampleRecord = useMemo(() => {
    if (!loadingMainData) return null;

    const sample: Record<string, unknown> = {
      parameter: "__skeleton__",
      target: "__skeleton__",
      satuan: "__skeleton__",
      weight: "__skeleton__",
    };

    for (let month = 1; month <= 12; month += 1) {
      sample[`ach_fm_${month}`] = "__skeleton__";
      sample[`score_fm_${month}`] = "__skeleton__";
      sample[`realisasi_fm_before_${month}`] = "__skeleton__";
      sample[`realisasi_fm_after_${month}`] = "__skeleton__";

      for (let week = 1; week <= 5; week += 1) {
        sample[`ach_${month}_${week}`] = "__skeleton__";
      }
    }

    return sample;
  }, [loadingMainData]);

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
              childrenMapped = injectedChildData.children.map(
                (grandChild, gcIndex) => {
                  let grandChildrenMapped = [];
                  if (
                    injectedGrandChildData.identIndex ===
                      grandChild.identIndex &&
                    Array.isArray(injectedGrandChildData.children)
                  ) {
                    grandChildrenMapped = injectedGrandChildData.children.map(
                      (ggChild) => ({
                        ...ggChild,
                        index: gcIndex,
                        indexParent: index,
                        mainIndexParent: indexParent,
                      }),
                    );
                  }

                  return {
                    ...grandChild,
                    index: gcIndex,
                    indexParent: index,
                    mainIndexParent: indexParent,
                    children: grandChildrenMapped,
                  };
                },
              );
            }

            return {
              ...childData,
              index,
              indexParent,
              mainIndexParent: indexParent,
              children: childrenMapped,
            };
          },
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

  const hasMeaningfulValue = (value: unknown) =>
    !(value === null || value === undefined || value === "" || value === "-");

  const resolveMonthYearFromRecord = (record: Record<string, unknown>) => {
    const currentYear = new Date().getFullYear();

    const rawYear = record.year;
    const parsedYear = typeof rawYear === "number" ? rawYear : Number(rawYear);
    const year =
      Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : currentYear;

    const rawMonth = record.month ?? record.monthNum;
    const parsedMonth =
      typeof rawMonth === "number" ? rawMonth : Number(rawMonth);
    if (Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
      return { month: parsedMonth, year };
    }

    const monthCandidates = Array.from(
      { length: 12 },
      (_, index) => index + 1,
    ).filter((month) => {
      const relevantKeys = [
        `ach_fm_${month}`,
        `score_fm_${month}`,
        `realisasi_fm_before_${month}`,
        `realisasi_fm_after_${month}`,
        `ach_${month}_1`,
        `ach_${month}_2`,
        `ach_${month}_3`,
        `ach_${month}_4`,
        `ach_${month}_5`,
      ];

      return relevantKeys.some((key) => hasMeaningfulValue(record[key]));
    });

    return {
      month: monthCandidates.at(-1) ?? new Date().getMonth() + 1,
      year,
    };
  };

  // Function to generate realisasi columns based on month
  const generateRealisasiColumns = (
    monthNum: number,
    kpi?: string,
    isAfterTable = false,
  ) => {
    const weekCount = [3, 6, 8, 11].includes(monthNum) ? 5 : 4;
    const isPacketloss =
      kpi?.toLowerCase()?.includes("packetloss") &&
      kpi?.toLowerCase()?.includes("ran to core");

    const columnsArray: Array<{
      title: string;
      dataIndex?: string;
      key: string;
      render: (
        text: unknown,
        record?: any,
        index?: number,
      ) => React.ReactNode;
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
      const actualWeek = getActualWeekNum(monthNum, i);
      const title = showActualWeeks && actualWeek ? `W${actualWeek}` : `W${i}`;

      columnsArray.push({
        title: title,
        dataIndex: `ach_${monthNum}_${i}`,
        key: `ach_${monthNum}_${i}`,
        render: (text: unknown, record?: any) => {
          let cellValue = text;
          if (cellValue === undefined || cellValue === null || cellValue === "") {
            const standardKey = `ach_${monthNum}_${i}`;
            if (record && typeof record === "object") {
              if (record[standardKey] !== undefined) {
                cellValue = record[standardKey];
              } else {
                const pattern = new RegExp(`^ach_${monthNum}_${i}_\\d+$`);
                const foundKey = Object.keys(record).find((k) => pattern.test(k));
                if (foundKey) {
                  cellValue = record[foundKey];
                }
              }
            }
          }

          if (cellValue === null || cellValue === undefined || cellValue === "") {
            return "-";
          }

          const value = Number(cellValue);
          const target = Number(record?.target);

          if (Number.isNaN(value) || Number.isNaN(target)) {
            return (
              <span
                className="cursor-pointer font-semibold text-blue-500 hover:underline"
                onClick={() => fetchSiteDetailWeek(record, monthNum, i, isAfterTable)}
              >
                {cellValue as React.ReactNode}
              </span>
            );
          }

          // Packetloss tetap mengikuti rule existing: hijau jika <= target.
          // KPI lain: hijau jika >= target, termasuk nilai yang sama dengan target.
          const isGood = isPacketloss ? value <= target : value >= target;

          return (
            <span
              className={`${
                isGood ? "text-green-500" : "text-red-500"
              } font-semibold cursor-pointer hover:underline`}
              onClick={() => fetchSiteDetailWeek(record, monthNum, i, isAfterTable)}
            >
              {cellValue as React.ReactNode}
            </span>
          );
        },
      });
    }

    // Add month column
    const monthNames = [
      "", // biar index mulai dari 1
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    columnsArray.push({
      title: monthNames[monthNum],
      dataIndex: `ach_fm_${monthNum}`,
      key: `ach_fm_${monthNum}`,
      render: (text: unknown, record?: any) => {
        if (text === null || text === undefined || text === "") return "-";
        const value = Number(text);
        const target = Number(record?.target);
        if (Number.isNaN(value) || Number.isNaN(target))
          return text as React.ReactNode;

        const isGood = isPacketloss ? value <= target : value >= target;

        return (
          <span
            className={
              isGood ? "text-green-500 font-semibold" : "text-red-500 font-semibold"
            }
          >
            {text as React.ReactNode}
          </span>
        );
      },
    });

    return columnsArray;
  };

  const columns = useMemo(() => {
    if (!data) return [];
    // Extract keys dynamically
    // Extract keys dynamically
    const sampleRecord =
      data.find((item) => item && Object.keys(item).length > 0) ??
      skeletonSampleRecord ??
      null;

    const weeklyKeysRaw = Object.keys(sampleRecord).filter((key) =>
      /^ach_\d+_\d+(?:_\d+)?$/.test(key),
    );

    // Group keys by their month and relative week to prevent duplicate columns
    const weeklyKeysMap = new Map<string, string>();
    weeklyKeysRaw.forEach((key) => {
      const parts = key.split("_");
      const monthAndWeek = `${parts[1]}_${parts[2]}`;
      // Prefer the version with 3 numbers (ach_M_W_Y)
      if (!weeklyKeysMap.has(monthAndWeek) || parts.length === 4) {
        weeklyKeysMap.set(monthAndWeek, key);
      }
    });
    const weeklyKeys = Array.from(weeklyKeysMap.values());

    const monthlyKeys = Object.keys(sampleRecord).filter((key) =>
      /^ach_fm_\d+$/.test(key),
    );

    const activeMonthlyKeys = monthlyKeys.filter((monthKey) => {
      const monthNum = parseInt(monthKey.replace("ach_fm_", ""));
      const relatedWeekKeys = weeklyKeys.filter((weekKey) =>
        weekKey.startsWith(`ach_${monthNum}_`),
      );
      const relevantKeys = [
        `ach_fm_${monthNum}`,
        `score_fm_${monthNum}`,
        `realisasi_fm_before_${monthNum}`,
        `realisasi_fm_after_${monthNum}`,
        ...relatedWeekKeys,
      ];

      return data.some((row) =>
        relevantKeys.some((key) => hasMeaningfulValue(row?.[key])),
      );
    });

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
    // TODO
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
          if (
            record.parameter === "PACKETLOSS 1-5% RAN TO CORE" ||
            record.parameter === "PACKETLOSS >5% RAN TO CORE"
          ) {
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
    const displayMonthlyKeys =
      activeMonthlyKeys.length > 0 ? activeMonthlyKeys : monthlyKeys;

    const groupedColumns = displayMonthlyKeys.map((monthKey) => {
      const monthNum = parseInt(monthKey.replace("ach_fm_", ""));
      const relatedWeeks = weeklyKeys.filter((weekKey) =>
        weekKey.startsWith(`ach_${monthNum}_`),
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
            const parts = weekKey.split("_");
            const mNum = parseInt(parts[1], 10);
            const wNum = parseInt(parts[2], 10);

            // Look for actual week of the year (the 3rd number, index 3).
            // If the current weekKey doesn't have it, we search other records in data to see if there is ach_M_W_XX.
            let actualWeekNumFromKey = parts[3];
            if (!actualWeekNumFromKey && data) {
              const pattern = new RegExp(`^ach_${mNum}_${wNum}_(\\d+)$`);
              for (const row of data) {
                const foundKey = Object.keys(row).find((k) => pattern.test(k));
                if (foundKey) {
                  const match = foundKey.match(pattern);
                  if (match) {
                    actualWeekNumFromKey = match[1];
                    break;
                  }
                }
              }
            }

            // Set column title dynamically based on showActualWeeks state
            const columnTitle = showActualWeeks && actualWeekNumFromKey
              ? `W${actualWeekNumFromKey}`
              : `W${wNum}`;

            return {
              title: columnTitle,
              dataIndex: weekKey,
              align: "center",
              key: weekKey,
              onHeaderCell: () => ({
                className: "!bg-blue-pacific !p-3",
              }),
              onCell: () => ({
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
                  onClick={() =>
                    fetchRealisasiMonthly(
                      "before_rekon",
                      monthNum,
                      record as Record<string, unknown>,
                    )
                  }
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
                  onClick={() =>
                    fetchRealisasiMonthly(
                      "after_rekon",
                      monthNum,
                      record as Record<string, unknown>,
                    )
                  }
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

    const computedColumns = [
      ...baseColumns,
      ...lastMonth,
      ...groupedColumns,
      ...rekonScore,
    ];
    lastColumnsRef.current = computedColumns;
    return computedColumns;
  }, [data, skeletonSampleRecord, showActualWeeks]);

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

        setWeeklyDetail({
          week: weekParam,
          kpi: kpiParam,
          region: regionParam,
          year: yearParam,
        });
        setModalData(null);
        setModalVisible(true);

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
        return true;
      } catch (error) {
        console.log("Error fetching weekly detail:", error);
        return false;
      } finally {
        setModalLoading(false);
      }
    },
    [getDetailsiteNotclear, menuId],
  );

  const fetchRealisasiMonthly = useCallback(
    async (
      monthKey: string,
      monthNum: number,
      record: Record<string, unknown>,
    ) => {
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

        setRealisasiDetail({
          month: monthKey,
          kpi: kpiParam,
          monthNum: monthNum,
        });
        setRealisasiModalData(null);
        setRealisasiModalVisible(true);

        const response = await getWeeklyMonth({
          query: {
            month: monthParam,
            year: yearParam,
            kpi: kpiParam,
            type: menuId,
          },
        }).unwrap();

        setRealisasiModalData(response as RealisasiResponse);
        return true;
      } catch (error) {
        console.log("Error fetching realisasi monthly:", error);
        return false;
      } finally {
        setRealisasiModalLoading(false);
      }
    },
    [getWeeklyMonth, menuId],
  );

  const getActualWeekNum = (monthNum: number, relativeWeekNum: number): string | null => {
    const pattern = new RegExp(`^ach_${monthNum}_${relativeWeekNum}_(\\d+)$`);
    
    // 1. Search in main data
    if (data && Array.isArray(data)) {
      for (const row of data) {
        if (row && typeof row === "object") {
          const foundKey = Object.keys(row).find((k) => pattern.test(k));
          if (foundKey) {
            const match = foundKey.match(pattern);
            if (match) return match[1];
          }
        }
      }
    }
    
    // 2. Search in realisasiModalData
    if (realisasiModalData && realisasiModalData.data) {
      const beforeRows = Array.isArray(realisasiModalData.data.before) ? realisasiModalData.data.before : [];
      const afterRows = Array.isArray(realisasiModalData.data.after) ? realisasiModalData.data.after : [];
      const rows = [...beforeRows, ...afterRows];
      for (const row of rows) {
        if (row && typeof row === "object") {
          const foundKey = Object.keys(row).find((k) => pattern.test(k));
          if (foundKey) {
            const match = foundKey.match(pattern);
            if (match) return match[1];
          }
        }
      }
    }
    
    return null;
  };

  const getApiTypeCode = (kpiName: string): string => {
    if (!kpiName) return "";
    const norm = kpiName.toLowerCase();
    if (norm.includes("1-5%")) return "p15";
    if (norm.includes(">5%")) return "p5";
    if (norm.includes("latency") && norm.includes("internet")) return "latency_internet";
    if (norm.includes("latency")) return "latency";
    if (norm.includes("jitter") && norm.includes("internet")) return "jitter_internet";
    if (norm.includes("jitter")) return "jitter";
    if (norm.includes("packetloss") && norm.includes("internet")) return "packetloss_internet";
    if (norm.includes("packetloss")) return "packetloss";
    if (norm.includes("mttr") && norm.includes("major")) return "mttr_major";
    if (norm.includes("mttr") && norm.includes("minor")) return "mttr_minor";
    if (norm.includes("mttr") && norm.includes("critical")) return "mttr_critical";
    return kpiName;
  };

  const fetchSiteDetailWeek = async (
    record: any,
    monthNum: number,
    relativeWeekNum: number,
    isAfterTable: boolean
  ) => {
    setSiteDetailPagination({ current: 1, pageSize: 10 });
    setSiteDetailModalLoading(true);
    setSiteDetailModalVisible(true);
    setSiteDetailModalData(null);

    const actualWeek = getActualWeekNum(monthNum, relativeWeekNum) || relativeWeekNum;
    const yearParam = record?.year || new Date().getFullYear();
    const kpiName = realisasiDetail?.kpi || record?.parameter || record?.mini_parameter || "";
    const typeParam = getApiTypeCode(kpiName);
    const statusParam = isAfterTable ? "after" : "before";
    const regionParam = record?.region_tsel || "";

    setSiteDetailParams({
      year: yearParam,
      week: actualWeek,
      type: typeParam,
      status: statusParam,
      region: regionParam,
    });

    try {
      const response = await getDetailsiteNotclearWeek({
        query: {
          year: yearParam,
          week: actualWeek,
          type: typeParam,
          status: statusParam,
          region: regionParam,
        }
      }).unwrap();

      if (response && typeof response === "object" && "data" in response) {
        setSiteDetailModalData((response as any).data || []);
      } else {
        setSiteDetailModalData([]);
      }
    } catch (error) {
      console.error("Error fetching site details for week:", error);
      setSiteDetailModalData([]);
    } finally {
      setSiteDetailModalLoading(false);
    }
  };

  const fetchWitelData = useCallback(
    async (record) => {
      setLoadingRowKey(record.identIndex);
      setLoading(true);
      try {
        let res;
        const mini_parameter = record.parameter.toLocaleLowerCase();
        const { month, year } = resolveMonthYearFromRecord(record);
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
        } else if (record.parent) {
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
              month,
              year,
            },
          }).unwrap();
        }

        if (record.main_parent) {
          const findData = dataMapping.find(
            (data) =>
              data.coreIndex == record.coreIndex &&
              data.parameter == record.parameter,
          );
          const newData = res.data?.map((data) => ({
            ...data,
            mini_parameter,
            identIndex: data.identIndex || identIndex++,
          }));
          const injectData = { ...findData, children: newData };
          setInjectedData(injectData);
        } else if (record.parent) {
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
        } else {
          const findData = dataMapping[record.mainIndexParent];
          const childData = findData?.children[record.indexParent];
          const grandChildDataInject = childData?.children[record.index];
          const newData = res.data?.map((data) => ({
            ...data,
            mini_parameter: findData.parameter,
            identIndex: data.identIndex || identIndex++,
            is_level_4: true,
          }));
          const injectData = {
            ...grandChildDataInject,
            children: newData,
          };
          setInjectedGrandChildData(injectData);
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      } finally {
        setLoadingRowKey(null);
        setLoading(false);
      }
    },
    [dataMapping, detailParameter, filter, getCNP, getWitel, menuId, treg],
  );

  const handleExpandCollaps = useCallback(
    async (record) => {
      if (record.parameter?.toLowerCase()?.includes("core"))
        setDetailParameter(record.parameter);

      const isMttrq =
        record.mini_parameter?.toLowerCase()?.includes("mttrq") ||
        record.parameter?.toLowerCase()?.includes("mttrq");
      const isLevel3Mttrq =
        !record.main_parent && !record.parent && !record.is_level_4 && isMttrq;

      if (record.parent || record.main_parent || isLevel3Mttrq) {
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
    [dataMapping, expandedRowKey, fetchWitelData],
  );

  const columnPop = useMemo(() => {
    const isMttrq =
      weeklyDetail?.kpi?.toLowerCase()?.includes("mttrq") ?? false;

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

  const monthNameing = [
    "", // biar index mulai dari 1
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const tableData = loadingMainData ? skeletonRows : dataMapping;
  const isSkeletonRow = (record: Record<string, unknown>) =>
    Boolean(
      (record as { __skeleton?: boolean }).__skeleton ||
      loadingRowKey === record.identIndex,
    );
  const renderSkeletonCell = () => (
    <div className="flex items-center w-full py-1.5">
      <Skeleton.Input
        active
        size="small"
        className="w-full"
        style={{ width: "100%", height: 16 }}
      />
    </div>
  );

  return (
    <div>
      <Table
        size="small"
        dataSource={tableData}
        bordered
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        className="rounded-xl "
        rowKey={(record) => record.identIndex}
        onRow={(record) =>
          isSkeletonRow(record) ? { style: { height: 48 } } : {}
        }
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
                    if (isSkeletonRow(record)) {
                      return {};
                    }
                    const isLastTwo =
                      record.parameter?.toLowerCase()?.includes("service") ||
                      record.parameter?.toLowerCase()?.includes("weighted");
                    const isRealColumn = child?.dataIndex
                      ?.toString()
                      .toLowerCase()
                      .includes("real");
                    const baseOnCell =
                      typeof col.onCell === "function" ? col.onCell() : {};
                    if (
                      isLastTwo &&
                      child.dataIndex?.toString().includes("score")
                    )
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
                  render={(rawText, record) => {
                    if (isSkeletonRow(record)) {
                      return renderSkeletonCell();
                    }

                    let text = rawText;
                    if (child.dataIndex && (text === undefined || text === null || text === "")) {
                      const match = (child.dataIndex as string).match(/^ach_(\d+)_(\d+)(?:_\d+)?$/);
                      if (match) {
                        const mNum = match[1];
                        const wNum = match[2];
                        const standardKey = `ach_${mNum}_${wNum}`;
                        if (record[standardKey] !== undefined) {
                          text = record[standardKey];
                        } else {
                          const pattern = new RegExp(`^ach_${mNum}_${wNum}_\\d+$`);
                          const foundKey = Object.keys(record).find((k) => pattern.test(k));
                          if (foundKey) {
                            text = record[foundKey];
                          }
                        }
                      }
                    }

                    const isLastTwo =
                      record.parameter?.toLowerCase()?.includes("service") ||
                      record.parameter?.toLowerCase()?.includes("weighted");
                    // const isBelowTarget = Number(text) <= Number(record.target);
                    const value = Number(text);
                    const target = Number(record.target);

                    if (Number.isNaN(value) || Number.isNaN(target)) {
                      return <span>{text}</span>;
                    }

                    const isJitter =
                      record.mini_parameter
                        ?.toLowerCase()
                        ?.includes("latency") ||
                      record.mini_parameter
                        ?.toLowerCase()
                        ?.includes("jitter") ||
                      record.mini_parameter?.toLowerCase()?.includes("mttr");

                    const isBelowTarget = isJitter
                      ? value < target // 👉 JITTER
                      : value <= target;

                    if (!text) return text;
                    // if (!record.target && !isLastTwo) {
                    if (
                      (record.target === "" ||
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
                      const isRealisasiColumn =
                        /^realisasi_fm_(before|after)_\d+$/.test(
                          child.dataIndex as string,
                        );

                      if (isRealisasiColumn && text) {
                        const monthNum = (child.dataIndex as string).match(
                          /\d+$/,
                        )?.[0];
                        const isBeforeColumn = (
                          child.dataIndex as string
                        ).includes("before");
                        const monthKey = isBeforeColumn
                          ? "before_rekon"
                          : "after_rekon";

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
                                  fetchRealisasiMonthly(
                                    monthKey,
                                    parseInt(monthNum),
                                    record,
                                  );
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
                                fetchRealisasiMonthly(
                                  monthKey,
                                  parseInt(monthNum),
                                  record,
                                );
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
                      const isWeeklyColumn = /^ach_\d+_\d+(?:_\d+)?$/.test(
                        child.dataIndex,
                      );

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
                            ? (text ?? "" + "%")
                            : (text ?? "")}
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
                if (isSkeletonRow(record)) {
                  return {};
                }
                const isLastTwo =
                  record.parameter?.toLowerCase()?.includes("service") ||
                  record.parameter?.toLowerCase()?.includes("weighted");
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
                if (isSkeletonRow(record)) {
                  return renderSkeletonCell();
                }

                const isBelowTarget = Number(text) < Number(record.target);
                if (col.dataIndex == "parameter") {
                  const isExpanded = expandedRowKey.includes(record.identIndex);
                  const isLevel3MttrqRow =
                    !record.main_parent &&
                    !record.parent &&
                    !record.is_level_4 &&
                    Boolean(
                      record.mini_parameter?.toLowerCase()?.includes("mttrq") ||
                      record.parameter?.toLowerCase()?.includes("mttrq"),
                    );
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
                              : record.is_level_4
                                ? "ml-8 !text-xs"
                                : "ml-4 !text-xs"
                        }`}
                      >
                        <Image
                          className={`${
                            record.main_parent ||
                            record.parent ||
                            isLevel3MttrqRow
                              ? "block"
                              : "hidden"
                          } transform transition-transform duration-150 ${
                            isExpanded ? "rotate-90" : "rotate-0"
                          }`}
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
                  record.parameter?.toLowerCase()?.includes("service") &&
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
                  record.parameter?.toLowerCase()?.includes("weighted") &&
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
          ),
        )}
      </Table>

      {/* Modal untuk detail weekly */}
      <Modal
        title={`Detail ${formatWeekMonth(weeklyDetail?.week)} ${formatText(weeklyDetail?.kpi)}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={null}
      >
        {modalLoading ? (
          <div className="max-h-[650px] overflow-y-auto">
            <Table
              dataSource={skeletonRows}
              size="small"
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              bordered
              scroll={{ x: "max-content" }}
              columns={columnPop.map((column: any) => ({
                ...column,
                render: () => renderSkeletonCell(),
              }))}
              rowKey={(_, index) => index as number}
            />
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
        title={`Achievement - ${realisasiDetail?.kpi?.toUpperCase()}`}
        open={realisasiModalVisible}
        onCancel={() => setRealisasiModalVisible(false)}
        width={1200}
        footer={null}
      >
        {realisasiModalLoading ? (
          <div className="max-h-[700px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-4 text-center">
                  Realisasi Before
                </h3>
                <Table
                  dataSource={skeletonRows}
                  size="small"
                  pagination={{ pageSize: 50, hideOnSinglePage: true }}
                  bordered
                  scroll={{ x: "max-content" }}
                  columns={generateRealisasiColumns(
                    realisasiDetail?.monthNum || 2,
                    realisasiDetail?.kpi,
                    false,
                  ).map((column: any) => ({
                    ...column,
                    render: () => renderSkeletonCell(),
                  }))}
                  rowKey={(_, index) => index as number}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4 text-center">
                  Realisasi After
                </h3>
                <Table
                  dataSource={skeletonRows}
                  size="small"
                  pagination={{ pageSize: 50, hideOnSinglePage: true }}
                  bordered
                  scroll={{ x: "max-content" }}
                  columns={generateRealisasiColumns(
                    realisasiDetail?.monthNum || 2,
                    realisasiDetail?.kpi,
                    true,
                  ).map((column: any) => ({
                    ...column,
                    render: () => renderSkeletonCell(),
                  }))}
                  rowKey={(_, index) => index as number}
                />
              </div>
            </div>
          </div>
        ) : realisasiModalData &&
          typeof realisasiModalData === "object" &&
          realisasiModalData.data ? (
          <div className="max-h-[700px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              {/* Realisasi Before */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-center">
                  Realisasi Before
                </h3>
                {realisasiModalData.data?.before &&
                Array.isArray(realisasiModalData.data.before) ? (
                  <Table
                    dataSource={realisasiModalData.data.before}
                    size="small"
                    pagination={{ pageSize: 50, hideOnSinglePage: true }}
                    bordered
                    scroll={{ x: "max-content" }}
                    columns={generateRealisasiColumns(
                      realisasiDetail?.monthNum || 2,
                      realisasiDetail?.kpi,
                      false,
                    )}
                    rowKey={(_, index) => index as number}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Tidak ada data
                  </div>
                )}
              </div>

              {/* Realisasi After */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-center">
                  Realisasi After
                </h3>
                {realisasiModalData.data?.after &&
                Array.isArray(realisasiModalData.data.after) ? (
                  <Table
                    dataSource={realisasiModalData.data.after}
                    size="small"
                    pagination={{ pageSize: 50, hideOnSinglePage: true }}
                    bordered
                    scroll={{ x: "max-content" }}
                    columns={generateRealisasiColumns(
                      realisasiDetail?.monthNum || 2,
                      realisasiDetail?.kpi,
                      true,
                    )}
                    rowKey={(_, index) => index as number}
                  />
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Tidak ada data
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">Tidak ada data</div>
        )}
      </Modal>

      {/* Modal untuk Detail Site Not Clear per Minggu */}
      <Modal
        title={`Detail Site Not Clear - Week ${siteDetailParams?.week} (${siteDetailParams?.status?.toUpperCase()})`}
        open={siteDetailModalVisible}
        onCancel={() => setSiteDetailModalVisible(false)}
        width={1200}
        centered
        footer={null}
        styles={{
          body: {
            maxHeight: "75vh",
            overflowY: "auto",
          },
        }}
      >
        <Table
          dataSource={siteDetailModalData || []}
          loading={siteDetailModalLoading}
          size="small"
          pagination={{
            current: siteDetailPagination.current,
            pageSize: siteDetailPagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) =>
              setSiteDetailPagination({ current: page, pageSize }),
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} data`,
          }}
          bordered
          scroll={{ x: "max-content", y: 400 }}
          columns={[
            {
              title: "No.",
              key: "no",
              render: (_, __, index) =>
                (siteDetailPagination.current - 1) * siteDetailPagination.pageSize + index + 1,
              width: 60,
              align: "center",
            },
            {
              title: "Site ID",
              dataIndex: "site_id",
              key: "site_id",
            },
            {
              title: "Region",
              dataIndex: "region",
              key: "region",
            },
            {
              title: "Area",
              dataIndex: "area",
              key: "area",
            },
            {
              title: "Year",
              dataIndex: "year",
              key: "year",
            },
            {
              title: "Week",
              dataIndex: "week",
              key: "week",
            },
            {
              title: "Value",
              dataIndex: "value",
              key: "value",
              render: (val) => typeof val === "number" ? val.toFixed(4) : val,
            },
            {
              title: "Group RCA",
              dataIndex: "group_rca",
              key: "group_rca",
            },
            {
              title: "Detail RCA",
              dataIndex: "detail_rca",
              key: "detail_rca",
              width: 300,
              render: (text) => (
                <div className="whitespace-pre-line text-xs max-w-xs">{text}</div>
              ),
            },
            {
              title: "Update Progress",
              dataIndex: "update_progress",
              key: "update_progress",
              render: (val) => val ?? "-",
            },
            {
              title: "User Update",
              dataIndex: "user_update",
              key: "user_update",
              render: (val) => val ?? "-",
            },
            {
              title: "Last Update",
              dataIndex: "last_update",
              key: "last_update",
              render: (val) => val ?? "-",
            },
          ]}
          rowKey={(record) => `${record.site_id}-${record.week}-${record.year}`}
        />
      </Modal>
    </div>
  );
};

export { TableParentChild };
