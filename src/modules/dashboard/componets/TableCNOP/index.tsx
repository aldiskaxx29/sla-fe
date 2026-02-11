import { useMemo, useState } from "react";
import { Image, Spin, Table } from "antd";
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";

import { useNavigate } from "react-router-dom";

import arrowTopRight from "@/assets/arrow-up-right.svg";

const { Column, ColumnGroup } = Table;

const getCellStyles = (data) => {
  const extractNumber = (str) => {
    if (!str) return NaN;
    const match = str.toString().match(/^\d+/);
    return match ? Number(match[0]) : NaN;
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

    if (data.parameter?.toLowerCase().includes("pl")) {
      style = !isBelowTargetPL ? "bg-red-100 !p-3" : "!p-3";
    } else {
      style = isBelowTarget ? "bg-red-100 !p-3" : "!p-3";
    }

    cellStyles[key] = {
      className: style,
    };
  });

  return cellStyles;
};

// Function to categorize data
const categorizeData = (data) => {
  const sampleRecord = data[1];

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
    { title: "No", dataIndex: "no", key: "no", fixed: "left", width: 40 },
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
      fixed: "left",
      align: "center",
    },
    {
      title: "Level SLA",
      dataIndex: "level_sla",
      key: "level_sla",
      fixed: "left",
    },
  ];

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
            key: weekKey,
            onCell: getOnCell(weekKey),
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

  return [...baseColumns, ...groupedColumns];
};

const TableCNOP = ({ data }) => {
  const [loading, setLoading] = useState(false);

  const dataWithIndex = useMemo(() => {
    const coreToInternet = [
      {
        parameter: `CORE TO INTERNET`,
        bold: true,
      },
    ];
    const ranToCore = [{ parameter: `RAN TO CORE`, bold: true }];
    data.map((group, index) => {
      if (group.parameter?.includes("Internet")) {
        coreToInternet.push({ no: index + 1, ...group });
      } else {
        ranToCore.push({ no: index + 1, ...group });
      }
      return {
        coreToInternet,
        ranToCore,
      };
    });
    return [...ranToCore, ...coreToInternet];
  }, [data]);

  const categorizedData = useMemo(() => {
    return categorizeData(dataWithIndex);
  }, [dataWithIndex]);

  const navigate = useNavigate();

  const movePage = async (data) => {
    setLoading(true);
    const parameter = data.parameter.toLowerCase().replace("packetloss", "pl");

    setLoading(false);
    navigate(`/dashboard/cnop/${parameter}`);
  };

  return (
    <>
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
      <Table
        dataSource={dataWithIndex}
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
        className="rounded-xl "
      >
        {categorizedData.map((column) =>
          column.children ? (
            <ColumnGroup
              key={column.key ?? column.title}
              title={column.title}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  onHeaderCell={() => ({
                    className: "!bg-blue-pacific",
                  })}
                  align={child.align}
                  onCell={child.onCell}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  render={(text, record) => {
                    if (child.dataIndex?.startsWith("ach")) {
                      const extractNumber = (str) => {
                        if (!str) return NaN;
                        const match = str.toString().match(/^\d+/);
                        return match ? Number(match[0]) : NaN;
                      };
                      const isBelowTarget =
                        extractNumber(text) < extractNumber(record.target);
                      const isBelowTargetPl =
                        extractNumber(text) <= extractNumber(record.target);
                      if (record.parameter?.includes("PL"))
                        return (
                          <span
                            className={`${
                              !isBelowTargetPl
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
                            isBelowTarget
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
              width={column.width}
              key={column.dataIndex}
              title={column.title}
              align={column.align}
              dataIndex={column.dataIndex}
              onHeaderCell={() => ({
                className: "!bg-blue-pacific",
              })}
              render={(text, record, index) => {
                if (column.dataIndex?.startsWith("ach")) {
                  const extractNumber = (str) => {
                    if (!str) return NaN;
                    const match = str.toString().match(/^\d+/);
                    return match ? Number(match[0]) : NaN;
                  };
                  const isBelowTarget =
                    extractNumber(text) < extractNumber(record.target);
                  const isBelowTargetPL =
                    extractNumber(text) <= extractNumber(record.target);
                  if (record.parameter?.includes("PL"))
                    return (
                      <span
                        className={`${
                          !isBelowTargetPL
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
                        isBelowTarget ? "text-red-500" : "text-brand-secondary"
                      }`}
                    >
                      {text}
                    </span>
                  );
                } else if (column.dataIndex?.includes("parameter")) {
                  return (
                    <span
                      className={`${
                        record.bold
                          ? "!font-medium"
                          : "text-primary-500 underline cursor-pointer"
                      }`}
                      onClick={() => movePage(record)}
                    >
                      {record.bold ? text : snakeToPascal_Utils(text)}
                      {!record.bold && (
                        <Image
                          src={arrowTopRight}
                          alt="icon"
                          width={16}
                          preview={false}
                        />
                      )}
                    </span>
                  );
                }
                return text;
              }}
            />
          )
        )}
      </Table>
    </>
  );
};

export default TableCNOP;
