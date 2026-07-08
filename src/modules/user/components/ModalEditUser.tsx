import { Button, Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import { useCreateUserMutation } from "../rtk/user.rtk";
import { toast } from "react-toastify";
import { useUser } from "../hooks/user.hooks";
import { USER_LEVEL_OPTIONS } from "../constants";

const { Option } = Select;

const ModalEditUser = ({ open, data, onCancel }) => {
  const [createUser] = useCreateUserMutation();
  const { getAllUser } = useUser();

  const [form] = Form.useForm();

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        nik: data.nik,
        name: data.name,
        email: data.email,
        level_user: data.level_user != null ? String(data.level_user) : undefined,
        treg: data.treg != null ? String(data.treg) : undefined,
      });
    }
  }, [open, data, form]);

  const fetchUser = async () => {
    try {
      await getAllUser({}).unwrap();
    } catch (error) {
      //
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await createUser({ ...values, password: values.password ?? "", id: data?.id }).unwrap();
      toast.success("User updated successfully");
      await fetchUser();
      form.resetFields();
      onCancel();
    } catch (error) {
      console.log("Validate or Update Failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal open={open} onCancel={handleCancel} footer={null} centered>
      <div>
        <p className="text-xl font-bold text-center w-full my-6">Edit User</p>
        <Form form={form} layout="vertical">
          <Form.Item
            name="nik"
            label="NIK"
            rules={[{ required: true, message: "Masukkan NIK" }]}
          >
            <Input placeholder="Masukkan NIK" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: "Masukkan Nama" }]}
          >
            <Input placeholder="Masukkan Nama" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Masukkan Email" },
              { type: "email", message: "Format email tidak valid" },
            ]}
          >
            <Input placeholder="Masukkan Email" />
          </Form.Item>

          <Form.Item name="password" label="Password">
            <Input.Password placeholder="Kosongkan jika tidak diubah" />
          </Form.Item>

          <Form.Item
            label="Level User"
            name="level_user"
            rules={[{ required: true, message: "Masukkan Level User" }]}
          >
            <Select placeholder="Pilih Level User" options={USER_LEVEL_OPTIONS} />
          </Form.Item>

          <Form.Item
            label="Treg"
            name="treg"
            rules={[{ required: true, message: "Masukkan Treg" }]}
          >
            <Select placeholder="Pilih Treg">
              <Option value="0">All</Option>
              <Option value="1">Treg 1</Option>
              <Option value="2">Treg 2</Option>
              <Option value="3">Treg 3</Option>
              <Option value="4">Treg 4</Option>
              <Option value="5">Treg 5</Option>
              <Option value="6">Treg 6</Option>
              <Option value="7">Treg 7</Option>
            </Select>
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleOk}>
              Save
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalEditUser;
