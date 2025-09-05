import { Button, Modal } from "antd";
import { useDeleteUserMutation } from "../rtk/user.rtk";
import { toast } from "react-toastify";

const ModalDeleteUser = ({ open, onCancel, data }) => {
  const [DeleteUser] = useDeleteUserMutation();
  const handleOk = async () => {
    try {
      await DeleteUser({ id: data.id }).unwrap();
      onCancel();
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };
  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered>
      <div>
        <p className="text-xl font-bold text-center w-full my-3 mb-6">
          Delete User
        </p>
        <p className="font-semibold">Apakah Anda Yakin akan Menghapus User</p>

        <div className="grid grid-cols-2 gap-4 my-6">
          <div>
            <p className="text-base font-semibold">NIK</p>
            <p className="">{data.nik}</p>
          </div>
          <div>
            <p className="text-base font-semibold">Name</p>
            <p className="">{data.name}</p>
          </div>
          <div>
            <p className="text-base font-semibold">Email</p>
            <p className="">{data.email}</p>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button className="!bg-red-500 !text-white" onClick={handleOk}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalDeleteUser;
