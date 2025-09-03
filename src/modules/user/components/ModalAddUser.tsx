import { Button, Form, Input, Modal } from "antd";
import { useCreateUserMutation } from "../rtk/user.rtk";
import { toast } from "react-toastify";

const ModalAddUser = ({ open, onCancel }) => {
  const [createUser] = useCreateUserMutation();
  const [form] = Form.useForm();
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form Values:", values);
        createUser({ body: values }).unwrap();
        toast.success("User created successfully");
        onCancel();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal open={open} onCancel={onCancel} footer={null} centered>
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
              { required: true, message: "Masukkan Email", type: "email" },
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
            name="level_user"
            label="Level User"
            rules={[{ required: true, message: "Masukkan Level User" }]}
          >
            <Input placeholder="Masukkan Level User" />
          </Form.Item>
          <Form.Item
            name="treg"
            label="Treg"
            rules={[{ required: true, message: "Masukkan Treg" }]}
          >
            <Input placeholder="Masukkan Treg" />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                onCancel();
              }}
              style={{ marginRight: 8 }}
            >
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
