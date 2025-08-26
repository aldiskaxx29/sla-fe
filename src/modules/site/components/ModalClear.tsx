import { Modal, Table } from "antd";
import React, { useMemo } from "react";

const ModalClear = ({ data, open, onCancel, parameter }) => {
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
  return (
    <Modal open={open} footer={null} centered width={700} onCancel={onCancel}>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        className="rounded-xl "
        pagination={{ pageSize: 1000000, hideOnSinglePage: true }}
      />
    </Modal>
  );
};

export default ModalClear;
