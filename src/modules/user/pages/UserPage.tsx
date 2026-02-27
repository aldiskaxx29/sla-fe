import { Button } from "antd";
import TableUser from "../components/TableUser";
import ModalAddUser from "../components/ModalAddUser";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserPage = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user_data"));
    if (!userData || userData.level_user !== 1) {
      navigate("/"); // redirect to home
    }
  }, [navigate]);

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6 ">
      <div className="flex flex-row justify-between">
        <span className="font-semibold text-lg">Data User</span>
        <div className="flex justify-end">
          <Button
            className="mb-6 p-4 border-2 shadow-2xl"
            onClick={() => setOpen(true)}
          >
            <span className="font-semibold">Tambah User</span>
          </Button>
        </div>
      </div>
      <TableUser />
      <ModalAddUser open={open} onCancel={() => setOpen(false)} />
    </div>
  );
};

export default UserPage;
