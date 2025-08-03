// Antd
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { Image, Spin, Table } from "antd";

// Router
import { useNavigate } from "react-router-dom";

import { useState } from "react";

const { Column, ColumnGroup } = Table;

interface ColumnType {
  key?: string;
  title: string;
  dataIndex?: string;
  width?: string | number; // Added width support
  fixed?: "left" | "right"; // Added fixed support
  children?: ColumnType[];
}

interface TableMSAProps {
  dataSource: Record<string, unknown>[];
  columns: ColumnType[];
}

const TableMSA: React.FC<TableMSAProps> = ({ columns, dataSource }) => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const movePage = async (data) => {
    setLoading(true);
    const parameter = data.parameter.replace("packetloss", "pl");

    setLoading(false);
    navigate(`/back-office/dashboard/msa/${parameter}`);
  };
  return (
    <div>
      {loading && <Spin fullscreen tip="Sedang Memuat Data..." />}
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
                className: "!bg-blue-pacific",
              })}
            >
              {column.children.map((child) => (
                <Column
                  key={child.dataIndex}
                  title={child.title}
                  dataIndex={child.dataIndex}
                  width="fit-content"
                  onHeaderCell={() => ({
                    className: "!bg-blue-pacific text-center",
                  })}
                  fixed={child.fixed}
                  align={child.align}
                  onCell={(record, index) => {
                    const isLastTwo = index >= dataSource.length - 2;
                    if (isLastTwo)
                      return {
                        className: "!bg-blue-pacific !p-3",
                      };
                    // Otherwise, use and merge the existing onCell logic from `child.onCell` (if exists)
                    const baseOnCell =
                      typeof child.onCell === "function"
                        ? child.onCell(record, index)
                        : {};

                    return {
                      ...baseOnCell,
                    };
                  }}
                  render={(text, record, index) => {
                    const isLastTwo = index >= dataSource.length - 2;
                    if (isLastTwo) {
                      return (
                        <span className={`${text ? "font-bold" : ""}`}>
                          {text}
                        </span>
                      );
                    }
                    if (child.dataIndex?.startsWith("ach")) {
                      const isBelowTarget =
                        Number(text) < Number(record.target);
                      if (
                        record.parameter.includes("packetloss") &&
                        !record.parameter.includes("internet")
                      )
                        return (
                          <span
                            className={`${
                              !isBelowTarget
                                ? "text-red"
                                : "text-brand-secondary"
                            }`}
                          >
                            {record.satuan === "%" ? text + "%" : text}
                          </span>
                        );
                      return (
                        <span
                          className={`${
                            isBelowTarget ? "text-red" : "text-brand-secondary"
                          } `}
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
              align={column.align}
              fixed={column.fixed}
              onCell={(record, index) => {
                const isLastTwo = index >= dataSource.length - 2;
                if (isLastTwo)
                  return {
                    className: "!bg-blue-pacific !p-3",
                  };
                // Otherwise, use and merge the existing onCell logic from `child.onCell` (if exists)
                const baseOnCell =
                  typeof column.onCell === "function"
                    ? column.onCell(record, index)
                    : {};

                return {
                  ...baseOnCell,
                };
              }}
              render={(text, record, index) => {
                const isLastTwo = index >= dataSource.length - 2;
                if (column.dataIndex === "parameter" && !isLastTwo) {
                  return (
                    <span
                      className="text-primary-500 underline cursor-pointer"
                      onClick={() => movePage(record)}
                    >
                      {snakeToPascal_Utils(text)}{" "}
                    </span>
                  );
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
                return text;
              }}
            />
          )
        )}
      </Table>
    </div>
  );
};

export { TableMSA };
