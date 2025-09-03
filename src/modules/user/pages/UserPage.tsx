import { Button } from "antd";
import TableUser from "../components/TableUser";

const UserPage = () => {
  return (
    <div className="bg-white border border-[#DBDBDB] rounded-xl p-4 m-6 ">
      <div className="flex justify-end">
        <Button className="mb-6 p-4 border-2 shadow-2xl">
          <span className="font-semibold">Tambah User</span>
        </Button>
      </div>
      <TableUser />
    </div>
  );
};

export default UserPage;
