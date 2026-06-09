import { Modal, Skeleton, Table } from "antd";
import React, { useMemo } from "react";

const ModalClear = ({ data, open, onCancel, parameter, isLoading = false }) => {
  const dynamicKey = useMemo(() => {
    if (parameter.includes("packetloss")) return "packetloss";
    if (parameter.includes("jitter")) return "jitter";
    if (parameter.includes("latency")) return "latency";
  }, [parameter]);
  const dynamicTitle = useMemo(() => {
    if (parameter.includes("packetloss")) return "Packetloss";
    if (parameter.includes("jitter")) return "Jitter";
    if (parameter.includes("latency")) return "Latency";
  }, [parameter]);
  const columns = [
    {
      title: "No",
      key: "no",
      render: (text, record, index) => index + 1, // auto nomor urut
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Site ID",
      dataIndex: "site_id",
      key: "no",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Regional",
      dataIndex: "region_tsel",
      key: "regional",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Witel",
      dataIndex: "witel",
      key: "regional",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: `${dynamicTitle} Status`,
      key: `${dynamicKey}_status`,
      dataIndex: `${dynamicKey}_status`,
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: `${dynamicTitle}`,
      key: `${dynamicKey}`,
      dataIndex: `${dynamicKey}`,
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
  ];

  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        __skeleton: true,
        key: `skeleton-${index}`,
      })),
    []
  );

  const tableData = isLoading ? skeletonRows : data;
  const isSkeletonRow = (record: Record<string, unknown>) =>
    Boolean((record as { __skeleton?: boolean }).__skeleton);
  const renderSkeletonCell = () => (
    <div className="flex items-center w-full py-1.5">
      <Skeleton.Input active size="small" style={{ width: "100%", height: 16 }} />
    </div>
  );

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width="95vw"
      style={{ maxWidth: 1200 }}
      onCancel={onCancel}
      bodyStyle={{ padding: 16 }}
    >
      <div className="max-h-[78vh] overflow-auto">
        <Table
          columns={columns.map((column) => ({
            ...column,
            render: (text, record, index) =>
              isSkeletonRow(record) ? renderSkeletonCell() : column.render?.(text, record, index) ?? text,
          }))}
          dataSource={tableData}
          bordered
          className="rounded-xl "
          pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
          scroll={{ x: "max-content" }}
          rowKey={(record, index) =>
            (record as Record<string, unknown>)?.key || `row-${index}`
          }
        />
      </div>
    </Modal>
  );
};

export default ModalClear;
