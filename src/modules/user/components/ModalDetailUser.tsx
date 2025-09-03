import { Modal } from "antd";
import React from "react";

const ModalDetailUser = ({ open, onCancel, data }) => {
  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered>
      <div>
        <p className="text-xl font-bold text-center w-full my-3 mb-6">
          Detail User
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-base font-semibold">NIK</p>
            <p className="">{data.nik}</p>
          </div>
          <div>
            <p className="text-base font-semibold">Email</p>
            <p className="">{data.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 my-6">
          <div>
            <p className="text-base font-semibold">Name</p>
            <p className="">{data.name}</p>
          </div>
          <div>
            <p className="text-base font-semibold">Level User</p>
            <p className="">{data.level_user}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-base font-semibold">Treg</p>
            <p className="">{data.treg}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalDetailUser;
