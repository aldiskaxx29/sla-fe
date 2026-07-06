import { useEffect, useMemo } from "react";
import { Alert, Button, Spin } from "antd";
import { LogoutOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import {
  getPostLoginRedirectPath,
  isUserAccessPending,
  useLogoutMutation,
} from "../../rtk/auth.rtk";
import type { IAuthAuthenticatedUser } from "../../types/auth.interface";
import { useGetOneUserQuery } from "@/modules/user/rtk/user.rtk";

type StoredUser = {
  id?: string | number;
  user_id?: string | number;
  level?: string | null;
  level_user?: number | null;
  [key: string]: unknown;
};

type UserGetOneResponse = {
  data?: StoredUser;
  user?: StoredUser;
} & StoredUser;

const getStoredUser = (): StoredUser | null => {
  try {
    return JSON.parse(localStorage.getItem("user_data") ?? "null");
  } catch {
    return null;
  }
};

const getResponseUser = (response: unknown): StoredUser | null => {
  if (!response || typeof response !== "object") return null;

  const result = response as UserGetOneResponse;
  return result.data ?? result.user ?? result;
};

const ConfirmPage = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const storedUser = useMemo(() => getStoredUser(), []);
  const userId = storedUser?.id ?? storedUser?.user_id;
  const {
    data: userResponse,
    isFetching: isFetchingUser,
    isError: isFetchUserError,
  } = useGetOneUserQuery({ id: userId }, { skip: !userId });

  useEffect(() => {
    const latestUser = getResponseUser(userResponse);
    if (!latestUser || Object.keys(latestUser).length === 0) return;

    const nextUser = {
      ...storedUser,
      ...latestUser,
    };

    localStorage.setItem("user_data", JSON.stringify(nextUser));

    if (!isUserAccessPending(nextUser as Partial<Pick<IAuthAuthenticatedUser, "level" | "level_user">>)) {
      window.location.href = getPostLoginRedirectPath();
    }
  }, [storedUser, userResponse]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
        <SafetyCertificateOutlined className="text-3xl" />
      </div>

      <h1 className="mb-3 text-2xl font-semibold text-gray-800">
        Akun Belum Dikonfirmasi
      </h1>

      <p className="mb-4 text-sm leading-6 text-gray-500">
        Login berhasil, tetapi akun Anda belum dikonfirmasi oleh admin. Silakan
        hubungi admin untuk konfirmasi sebelum menggunakan aplikasi. Setelah
        admin melengkapi data, silakan login kembali.
      </p>

      <div className="mb-6 rounded-lg border text-center border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Minta admin untuk melengkapi data pada akun Anda.
      </div>

      {isFetchingUser && (
        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Spin size="small" />
          Memeriksa status akun...
        </div>
      )}

      {isFetchUserError && (
        <Alert
          type="warning"
          showIcon
          className="mb-4 text-left"
          message="Gagal memeriksa status akun"
          description="Silakan coba login kembali atau hubungi admin."
        />
      )}

      <Button
        danger
        icon={<LogoutOutlined />}
        loading={isLoading}
        onClick={handleLogout}
        className="w-full"
      >
        Keluar
      </Button>
    </div>
  );
};

export default ConfirmPage;
