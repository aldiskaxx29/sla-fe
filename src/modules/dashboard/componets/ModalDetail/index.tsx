// Antd
import { snakeToPascal_Utils } from "@/app/utils/wording.utils";
import { Modal, Table } from "antd";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

const { Column, ColumnGroup } = Table;

interface ModalDetailProps {
  title: string;
  isOpen: boolean;
  dataSource: Record<string, unknown>[];
  handleCancel?: () => void;
}

const ModalDetail: React.FC<ModalDetailProps> = ({
  title,
  isOpen,
  dataSource,
  handleCancel,
}) => {
  const { detailParameter } = useParams();

  const columns = useMemo(() => {
    if (!dataSource) return [];
    // Extract keys dynamically
    const sampleRecord = dataSource && dataSource[0];

    const weeklyKeys = Object.keys(sampleRecord).filter((key) =>
      /^ach_\d+_\d+$/.test(key)
    );
    const monthlyKeys = Object.keys(sampleRecord).filter((key) =>
      /^ach_fm_\d+$/.test(key)
    );

    // Static columns (always shown)
    const baseColumns = [
      { title: "No.", dataIndex: "no", key: "no", fixed: "left" },
      {
        title: "Region",
        dataIndex: "region_tsel",
        key: "region_tsel",
        fixed: "left",
      },
      {
        title: "District",
        dataIndex: "witel",
        key: "witel",
        align: "center",
      },
      {
        title: "Site ID",
        key: "site_id",
        dataIndex: "site_id",
      },
      {
        title: "Sitename",
        dataIndex: "transport_type",
        key: "transport_type",
        align: "center",
      },
    ];

    const dynamicColumns = [{}];
    if (detailParameter?.includes("pl")) {
      dynamicColumns.push({
        title: "Packetloss",
        dataIndex: "packetloss",
        key: "packetloss",
        align: "center",
      });
      dynamicColumns.push({
        title: "Status",
        dataIndex: "packetloss_status",
        key: "packetloss",
        align: "center",
      });
    } else if (detailParameter?.includes("jitter")) {
      dynamicColumns.push({
        title: "Jitter",
        dataIndex: "jitter",
        key: "jitter",
        align: "center",
      });
      dynamicColumns.push({
        title: "Status",
        dataIndex: "jitter_status",
        key: "jitter",
        align: "center",
      });
    } else if (detailParameter?.includes("latency")) {
      dynamicColumns.push({
        title: "Latency",
        dataIndex: "latency",
        key: "latency",
        align: "center",
      });
      dynamicColumns.push({
        title: "Status",
        dataIndex: "latency_status",
        key: "latency",
        align: "center",
      });
    } else if (detailParameter?.includes("mttrq")) {
      dynamicColumns.push({
        title: "Latency",
        dataIndex: "mttrq",
        key: "mttrq",
        align: "center",
      });
      dynamicColumns.push({
        title: "Status",
        dataIndex: "mttrq_status",
        key: "mttrq",
        align: "center",
      });
    }

    return [...baseColumns, ...dynamicColumns];
  }, [dataSource]);
  return (
    <Modal
      title={title}
      open={isOpen}
      footer={null}
      width={1200}
      onCancel={handleCancel}
    >
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
                  align={child.align}
                  onHeaderCell={() => ({
                    className: "!bg-blue-pacific",
                  })}
                  fixed={child.fixed}
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
                        record.parameter?.includes("packetloss") &&
                        !record.parameter?.includes("internet")
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
                className: "!bg-blue-pacific",
              })}
              fixed={column.fixed}
              align={column.align}
              render={(text, record, index) => {
                if (column.dataIndex === "parameter") {
                  return <span>{snakeToPascal_Utils(text)}</span>;
                }
                if (column.dataIndex === "no") {
                  return <span>{index + 1}</span>;
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
    </Modal>
  );
};

export { ModalDetail };
