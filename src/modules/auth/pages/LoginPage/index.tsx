import logoQosmo from "@/assets/logo-qosmo.png";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../rtk/auth.rtk";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IAuthLoginRequest } from "../../types/auth.interface";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const values: IAuthLoginRequest = {
      email: (formData.get("email") as string)?.trim(),
      password: (formData.get("password") as string) ?? "",
    };

    if (!values.email || !values.password) {
      toast.dismiss();
      toast.warning("Please input your email and password!", {
        position: "top-right",
      });
      return;
    }

    try {
      const resp = await login(values).unwrap();

      if (!resp.status) throw resp;

      toast.dismiss();
      toast.success("Login successful 🎉", { position: "top-right" });

      navigate("/msa");
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        err?.message ??
        (typeof err === "string" ? err : "Login failed. Please try again.");
      toast.dismiss();
      toast.error(msg, { position: "top-right" });
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
          Silahkan masukan akun anda yang terdaftar
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        <div className="flex flex-col mb-4">
          <label htmlFor="email" className="text-gray-700 font-medium mb-1">
            Email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <UserOutlined className="text-xl" />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Masukkan Email"
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
            {isLoading ? "Logging in..." : "Masuk"}
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
