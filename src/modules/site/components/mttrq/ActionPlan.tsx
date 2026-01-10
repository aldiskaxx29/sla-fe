import type { FC } from "react";
import { Table } from "antd";

const ActionPlan: FC<{ data?: Array<Record<string, unknown>> }> = ({
  data = [],
}) => {
  const columns = [
    {
      title: "NO",
      key: "no",
      render: (_text, _row, idx) => idx + 1,
      width: 60,
    },
    { title: "REGIONAL", dataIndex: "regional", key: "regional" },
    { title: "NO TICKET", dataIndex: "ticket", key: "ticket" },
    { title: "GROUPING ISSUE", dataIndex: "grouping", key: "grouping" },
    {
      title: "DETAIL PROGRESS",
      dataIndex: "detail_progress",
      key: "detail_progress",
    },
    {
      title: "LATEST UPDATE PROGRESS",
      dataIndex: "latest_update",
      key: "latest_update",
    },
  ];

  return (
    <div className="mt-6">
      <h3 className="text-red-600 font-bold mb-3">ACTION PLAN & PROGRESS</h3>
      <div className="text-sm mb-2">
        Total Ticket Merah di W01 sebanyak <strong>70</strong> Ticket, dengan
        progress sebagai berikut :
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        rowKey={(r) => String(r.ticket || Math.random())}
      />
    </div>
  );
};

export default ActionPlan;
