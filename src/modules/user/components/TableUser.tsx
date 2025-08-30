import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { useEffect } from "react";
import { useUser } from "../hooks/user.hooks";

const TableUser = () => {
  const { dataAllUser, getAllUser } = useUser();
  const columns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
    {
      title: "Treg",
      dataIndex: "treg",
      key: "treg",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
  ];

  const fetchUser = async () => {
    try {
      await getAllUser({}).unwrap();
    } catch (error) {
      //
    }
  };

  useEffect(() => {
    // Fetch data here and set it to state if needed
    fetchUser();
  }, [fetchUser]);
  return (
    <Table
      columns={columns}
      dataSource={dataAllUser}
      bordered
      className="rounded-xl"
    ></Table>
  );
};

export default TableUser;
