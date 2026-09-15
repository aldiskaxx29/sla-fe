import { useState } from "react";
import type { FormEvent } from "react";
import { LuEye, LuEyeOff, LuLock, LuUser } from "react-icons/lu";

import { Button, InlineAlert } from "@/app/components/atoms";

import { IconInputField } from "@/app/components/molecules/IconInputField";

import type { AuthLoginRequest } from "@/app/types/auth/auth.types";

import logoQosmo from "@/assets/logo-qosmo.png";

interface LoginFormProps {
  loading?: boolean;
  warning?: string;
  onSubmit: (values: AuthLoginRequest) => void;
}

export function LoginForm({ loading = false, warning, onSubmit }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSubmit({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    });
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-center">
        <img src={logoQosmo} alt="Qosmo Logo" className="h-18 w-auto" />
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center">
          <div className="mr-3 h-6 w-1 rounded-full bg-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Web Admin</h2>
        </div>
        <p className="ml-4 text-sm text-gray-500">
          Silahkan masukan akun anda yang terdaftlar
        </p>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        {warning && <InlineAlert tone="warning">{warning}</InlineAlert>}

        <IconInputField
          id="email"
          name="email"
          type="text"
          label="Nik"
          icon={LuUser}
          placeholder="Masukkan Nik"
          required
          disabled={loading}
        />

        <IconInputField
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          icon={LuLock}
          placeholder="Masukkan Password"
          required
          disabled={loading}
          trailing={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
              className="text-gray-400 focus:outline-none"
            >
              {showPassword ? (
                <LuEyeOff className="size-5" />
              ) : (
                <LuEye className="size-5" />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          variant="gradient"
          size="xl"
          block
          disabled={loading}
          className="mt-4"
        >
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </>
  );
}
