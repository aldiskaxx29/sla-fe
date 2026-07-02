import logoQosmo from "@/assets/logo-qosmo.png";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FormEvent, useState } from "react";
import { useLoginMutation } from "../../rtk/auth.rtk";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IAuthLoginRequest } from "../../types/auth.interface";
import ModalTwoFact from "../ModalTwoFact";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isOpenTwoFact, setIsOpenTwoFact] = useState(false);
  const [loginWarning, setLoginWarning] = useState("");
  const [loginData, setLoginData] = useState<{
    user_id: string | number;
    otp_expires_in?: number;
    requires_2fa?: boolean;
  } | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  const getLoginErrorMessage = (err: unknown) => {
    if (err instanceof Error && err.message) return err.message;
    if (err && typeof err === "object") {
      const error = err as {
        data?: { message?: string };
        error?: string;
        message?: string;
      };

      return error.data?.message || error.message || error.error;
    }

    return undefined;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginWarning("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const values: IAuthLoginRequest = {
      email: (formData.get("email") as string)?.trim(),
      password: (formData.get("password") as string) ?? "",
    };

    if (!values.email || !values.password) {
      const warningMessage = "Silahkan masukan NIK dan Password Anda!";
      setLoginWarning(warningMessage);
      toast.dismiss();
      toast.warning(warningMessage, {
        position: "top-right",
      });
      return;
    }

    try {
      const resp = await login(values).unwrap();

      if (resp?.status === true && resp?.requires_otp_email) {
        // First login: perlu verifikasi OTP email dulu
        toast.dismiss();
        toast.info(resp.message || "Silahkan periksa email Anda untuk menerima kode OTP.", {
          position: "top-right",
          autoClose: 5000,
        });
        setLoginData({
          user_id: resp.user_id!,
          otp_expires_in: resp.otp_expires_in,
        });
        setIsOpenTwoFact(true);
      } else if (resp?.status === true && resp?.requires_2fa) {
        // Returning user: sudah setup 2FA, langsung ke step AUTHENTICATOR
        toast.dismiss();
        toast.info("Masukkan kode dari aplikasi Authenticator Anda.", {
          position: "top-right",
          autoClose: 4000,
        });
        setLoginData({
          user_id: resp.user_id!,
          requires_2fa: true,
        });
        setIsOpenTwoFact(true);
      } else {
        throw new Error(resp?.message || "NIK atau password salah.");
      }
    } catch (err: unknown) {
      const msg =
        getLoginErrorMessage(err) ||
        "NIK atau password salah. Periksa kembali NIK dan password Anda.";

      setLoginWarning(msg);
      toast.dismiss();
      toast.warning(msg, { position: "top-right" });
      setIsOpenTwoFact(false);
    }
  };

  return (
    <>
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img src={logoQosmo} alt="Qosmo Logo" className="h-18 w-auto" />
        </div>
      </div>

      {/* Form Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
          <h2 className="text-xl font-semibold text-gray-800">Web Admin</h2>
        </div>
        <p className="text-gray-500 text-sm ml-4">
          Silahkan masukan akun anda yang terdaftlar
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        {loginWarning && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800">
            {loginWarning}
          </div>
        )}

        <div className="flex flex-col mb-4">
          <label htmlFor="email" className="text-gray-700 font-medium mb-1">
            Nik
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <UserOutlined className="text-xl" />
            </span>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="Masukkan Nik"
              className="h-12 rounded-lg w-full pl-10 pr-3 border border-gray-300 focus:border-blue-500 focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col mb-4">
          <label htmlFor="password" className="text-gray-700 font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LockOutlined className="text-xl" />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan Password"
              className="h-12 rounded-lg w-full pl-10 pr-10 border border-gray-300 focus:border-blue-500 focus:outline-none"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeInvisibleOutlined className="text-xl" />
              ) : (
                <EyeOutlined className="text-xl" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-0">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 border-0 rounded-lg font-medium text-base shadow-md mt-4 text-white bg-gradient-to-br from-[#3E99E7] to-[#4666E3] hover:from-[#4666E3] hover:to-[#3E99E7] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </div>
      </form>

      <ModalTwoFact
        open={isOpenTwoFact}
        loginData={loginData}
        onCancel={() => setIsOpenTwoFact(false)}
      />
    </>
  );
};

export default LoginPage;
