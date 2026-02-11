import { Button, Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/user.hooks";
import ModalDetailUser from "./ModalDetailUser";
import ModalDeleteUser from "./ModalDeleteUser";

const TableUser = () => {
  const { dataAllUser, getAllUser } = useUser();
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
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
      width: 100,
      render: (text, record) => (
        <div className="flex gap-4">
          <Button type="primary" onClick={() => handleDetailClick(record)}>
            Detail
          </Button>
          <Button
            type="primary"
            className="!bg-red-500 !text-white"
            onClick={() => handleDeleteClick(record)}
          >
            Delete
          </Button>
        </div>
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

  const handleDeleteClick = (record: any) => {
    // Handle the delete button click here
    setDataDetail(record);
    setOpenDelete(true);
  };

  const handleDetailCancel = (isDelete) => {
    setOpenDetail(false);
    setDataDetail({});
    if (isDelete) {
      setOpenDelete(false);
      fetchUser();
    }
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
      <ModalDeleteUser
        open={openDelete}
        data={dataDetail}
        onCancel={() => handleDetailCancel(true)}
      />
    </>
  );
};

export default TableUser;
