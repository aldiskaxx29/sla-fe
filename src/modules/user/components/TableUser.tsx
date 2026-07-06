import { Button, Input, Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../hooks/user.hooks";
import ModalDetailUser from "./ModalDetailUser";
import ModalDeleteUser from "./ModalDeleteUser";
import ModalEditUser from "./ModalEditUser";

const TableUser = () => {
  const { dataAllUser, getAllUser } = useUser();
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [dataDetail, setDataDetail] = useState({});
  const [searchNik, setSearchNik] = useState("");
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
      title: "NIK",
      dataIndex: "nik",
      key: "nik",
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
      render: (value) => {
        return value == 0 ? "All" : value;
      },
    },
    {
      title: "Privilage",
      dataIndex: "level_user",
      key: "level_user",
      onHeaderCell: () => ({
        className: "!bg-blue-pacific !p-3",
      }),
      render: (value) => {
        const levelMap = {
          0: "All",
          1: "Administrator",
          2: "TIF HO",
          3: "TIF Regional",
          4: "Mitra",
          5: "TSEL",
          6: "Guest",
        };
    
        return levelMap[value] || "-";
      },
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
            className="!bg-amber-500 !text-white"
            onClick={() => handleEditClick(record)}
          >
            Edit
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

  const handleEditClick = (record: any) => {
    // Handle the edit button click here
    setDataDetail(record);
    setOpenEdit(true);
  };

  const handleEditCancel = () => {
    setOpenEdit(false);
    setDataDetail({});
    fetchUser();
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

  const filteredData = useMemo(() => {
    const data = dataAllUser?.data ?? [];
    const keyword = searchNik.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((item: any) =>
      String(item?.nik ?? "").toLowerCase().includes(keyword)
    );
  }, [dataAllUser, searchNik]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Input.Search
          allowClear
          placeholder="Cari berdasarkan NIK"
          value={searchNik}
          onChange={(e) => setSearchNik(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
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
      <ModalEditUser
        open={openEdit}
        data={dataDetail}
        onCancel={handleEditCancel}
      />
    </>
  );
};

export default TableUser;
