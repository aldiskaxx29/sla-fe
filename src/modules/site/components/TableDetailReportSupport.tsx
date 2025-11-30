import { Table } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TableDetailReportSupport = ({ data, total, name, month }) => {
  const navigate = useNavigate();
  const columns = useMemo(
    () => [
      {
        title: "No",
        key: "no",
        render: (_, __, index) => index + 1,
        onHeaderCell: () => ({
          className: "!p-1 !text-center !bg-neutral-800 !text-white",
        }),
      },
      {
        title: "Issue",
        dataIndex: "Issue",
        key: "Issue",
        onHeaderCell: () => ({
          className: "!p-1 !text-center !bg-neutral-800 !text-white",
        }),
      },
      {
        title: "Jumlah",
        dataIndex: "Jumlah",
        key: "Jumlah",
        onHeaderCell: () => ({
          className: "!p-1 !text-center !bg-neutral-800 !text-white",
        }),
        onCell: (record) => ({
          onClick: () => {
            navigate(
              `/report-support-needed/detail/${name}/${record.Issue}/${month}`
            );
          },
          style: { cursor: "pointer" },
        }),
      },
      {
        title: "Open",
        dataIndex: "Open",
        key: "Open",
        onHeaderCell: () => ({
          className: "!p-1 !text-center !bg-neutral-800 !text-white",
        }),
      },
      {
        title: "OGP",
        dataIndex: "OnProgress",
        key: "OnProgress",
        onHeaderCell: () => ({
          className: "!p-1 !text-center !bg-neutral-800 !text-white",
        }),
      },
      {
        title: "Done",
        dataIndex: "Done",
        key: "Done",
        onHeaderCell: () => ({
          className: "!p-1 !text-center !bg-neutral-800 !text-white",
        }),
      },
    ],
    [name, month]
  );

  return (
    <>
      {data && (
        <Table
          className="mt-4"
          columns={columns}
          dataSource={[...data, total]}
        />
      )}
    </>
  );
};

export { TableDetailReportSupport };
