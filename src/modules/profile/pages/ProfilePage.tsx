import { useCreateUserMutation } from "@/modules/user/rtk/user.rtk";
import { Button, Form, Image, Input } from "antd";
import { useEffect } from "react";

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [createUser] = useCreateUserMutation();
  const userData = localStorage.getItem("user_data");
  const handleOk = async () => {
    const id = userData ? JSON.parse(userData).id : null;
    const oldData = userData ? JSON.parse(userData) : {};

    try {
      const values = await form.validateFields();
      await createUser({ body: { id, ...values } }).unwrap();

      // ✅ Merge old data so id_telegram (or others) aren’t lost
      const updatedData = { ...oldData, id, ...values };
      localStorage.setItem("user_data", JSON.stringify(updatedData));

      // window.location.reload();
    } catch (error) {
      console.log("Validate Failed:", error);
    }
  };
  useEffect(() => {
    if (userData) {
      const parsedData = JSON?.parse(userData);
      form.setFieldsValue(parsedData);
    }
  }, [form, userData]);
  return (
    <div className="grid grid-cols-3 p-6">
      <p className="text-2xl font-bold w-full text-center my-6 col-span-1">
        Profile
      </p>
      <p className="text-xl font-bold w-full my-6 col-span-2"></p>
      <div className="flex flex-col items-center">
        <Image
          width={250}
          src="https://static.vecteezy.com/system/resources/previews/009/292/244/large_2x/default-avatar-icon-of-social-media-user-vector.jpg"
        />
      </div>
      <div className="col-span-2 text-lg">
        <Form form={form} layout="vertical">
          <Form.Item name="nik" label="NIK">
            <Input placeholder="Masukkan NIK" className="h-12" />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input placeholder="Masukkan Name" className="h-12" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Masukkan Email" className="h-12" />
          </Form.Item>
          <Form.Item name="level_user" label="Level User">
            <Input placeholder="Masukkan Level User" className="h-12" />
          </Form.Item>
          <Form.Item name="treg" label="Region">
            <Input placeholder="Masukkan Region" className="h-12" />
          </Form.Item>
          <Form.Item name="id_telegram" label="ID Telegram">
            <div>
              <Input placeholder="Masukkan ID Telegram" className="h-12" />
              {userData && (
                <a
                  href={`https://t.me/${JSON.parse(userData).id_telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://t.me/{JSON.parse(userData).id_telegram}
                </a>
              )}
            </div>
          </Form.Item>

          <Button type="primary" onClick={handleOk}>
            Submit
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePage;
