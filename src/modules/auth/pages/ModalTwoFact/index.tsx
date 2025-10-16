import { Button, Form, Image, Input, Modal } from "antd";
import { useLogin_2faMutation } from "../../rtk/auth.rtk";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

const ModalTwoFact = ({ open, parameter, onCancel }) => {
  const [form] = Form.useForm();
  const [login_2fa] = useLogin_2faMutation();

  const handleOk = useCallback(async () => {
    try {
      await login_2fa(form.getFieldsValue()).unwrap();
      toast.success("Login Berhasil");
      window.location.reload();
    } catch (error) {
      toast.error("Login Gagal, Periksa Kode OTP Anda");
    }
  }, [form, login_2fa, parameter]);
  useEffect(() => {
    form.setFieldValue("user_id", parameter?.user_id);
  }, [form, parameter]);
  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={400}
      onCancel={onCancel}
      maskClosable={false}
    >
      <div className="flex flex-col gap-6 items-center justify-center">
        <p className="font-semibold">
          {parameter?.qr_code_url
            ? "Scan QR Code Dengan Authenticator untuk mendapatkan PIN OTP"
            : "Masukkan Kode OTP dari Authenticator"}
        </p>
        <Image src={parameter?.qr_code_url} className="w-full mb-6" />
        <Form form={form} layout="vertical" className="w-full ">
          <Form.Item name="user_id" hidden>
            <Input placeholder="Masukkan Site ID" />
          </Form.Item>
          <Form.Item name="code">
            <Input
              type="number"
              className="h-10 "
              placeholder="Masukkan Kode OTP"
            />
          </Form.Item>
          <Button
            type="primary"
            className="w-full !bg-gradient-to-br from-[#3E99E7] to-[#4666E3] hover:from-[#4666E3] hover:to-[#3E99E7] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleOk}
          >
            Confirm
          </Button>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalTwoFact;
