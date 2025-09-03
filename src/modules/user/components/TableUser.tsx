import { Button, Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/user.hooks";
import ModalDetailUser from "./ModalDetailUser";

const TableUser = () => {
  const { dataAllUser, getAllUser } = useUser();
  const [openDetail, setOpenDetail] = useState(false);
  const [dataDetail, setDataDetail] = useState({});
  const columns: ColumnsType<any> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
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
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={() => handleDetailClick(record)}>
          Detail
        </Button>
      ),
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
    },
  ];

  const handleDetailClick = (record: any) => {
    // Handle the detail button click here
    setDataDetail(record);
    setOpenDetail(true);
  };

  const handleDetailCancel = () => {
    setOpenDetail(false);
    setDataDetail({});
  };

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
  }, []);
  return (
    <>
      <Table
        columns={columns}
        dataSource={dataAllUser?.data}
        bordered
        className="rounded-xl"
      ></Table>
      <ModalDetailUser
        open={openDetail}
        data={dataDetail}
        onCancel={handleDetailCancel}
      />
    </>
  );
};

export default TableUser;
