import { Button } from "antd";
import TableUser from "../components/TableUser";
import ModalAddUser from "../components/ModalAddUser";
import { useState } from "react";

const UserPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6 ">
      <div className="flex justify-end">
        <Button
          className="mb-6 p-4 border-2 shadow-2xl"
          onClick={() => setOpen(true)}
        >
          <span className="font-semibold">Tambah User</span>
        </Button>
      </div>
      <TableUser />
      <ModalAddUser open={open} onCancel={() => setOpen(false)} />
    </div>
  );
};

export default UserPage;
