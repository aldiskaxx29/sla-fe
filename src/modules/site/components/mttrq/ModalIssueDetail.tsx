import type { FC } from "react";
import { Modal, Table } from "antd";

interface ModalIssueDetailProps {
  open: boolean;
  onCancel: () => void;
  data?: any[];
  title?: string;
}

const ModalIssueDetail: FC<ModalIssueDetailProps> = ({
  open,
  onCancel,
  data = [],
  title = "Detail",
}) => {
  const columns = [
    { title: "No", key: "no", render: (_text, _record, idx) => idx + 1 },
    { title: "Ticket No", dataIndex: "ticket_no", key: "ticket_no" },
    { title: "Site Id", dataIndex: "site_id", key: "site_id" },
    { title: "Regional", dataIndex: "region_tsel", key: "region" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Detail", dataIndex: "detail", key: "detail" },
    {
      title: "Latest Update",
      dataIndex: "latest_update",
      key: "latest_update",
    },
  ];

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={900}
      onCancel={onCancel}
      title={title}
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        rowKey={(r) => r.ticket_no || JSON.stringify(r)}
      />
    </Modal>
  );
};

export default ModalIssueDetail;
