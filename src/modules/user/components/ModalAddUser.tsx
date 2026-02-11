import { Button, Form, Input, Modal, Select } from "antd";
import { useCreateUserMutation } from "../rtk/user.rtk";
import { toast } from "react-toastify";
import { useUser } from "../hooks/user.hooks";

const { Option } = Select;

const ModalAddUser = ({ open, onCancel }) => {
  const [createUser] = useCreateUserMutation();
  const { getAllUser } = useUser();

  const [form] = Form.useForm();

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
      console.log("Form Values:", values);
      await createUser(values).unwrap();
      toast.success("User created successfully");
      await fetchUser();
      form.resetFields();
      onCancel();
    } catch (error) {
      console.log("Validate or Create Failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal open={open} onCancel={handleCancel} footer={null} centered>
      <div>
        <p className="text-xl font-bold text-center w-full my-6">Create User</p>
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
            label="Nama Lengkap"
            rules={[{ required: true, message: "Masukkan Nama Lengkap" }]}
          >
            <Input placeholder="Masukkan Nama Lengkap" />
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

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Masukkan Password" }]}
          >
            <Input placeholder="Masukkan Password" />
          </Form.Item>

          <Form.Item
            label="Level User"
            name="level_user"
            rules={[{ required: true, message: "Masukkan Level User" }]}
          >
            <Select placeholder="Pilih Level User">
              <Option value="1">Admin</Option>
              <Option value="2">Rekonsiliasi</Option>
              <Option value="3">Guest</Option>
            </Select>
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

export default ModalAddUser;
