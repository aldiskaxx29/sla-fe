import { useEffect, useMemo } from "react";

import { useAuthUserDetailQuery, useLogoutMutation } from "@/app/hooks";

import { AccountPendingPanel } from "@/app/components/organisms/panels/AccountPendingPanel";

import { LOGIN_PATH } from "@/app/config/auth.config";

import {
  clearAuthData,
  getAuthStoredUser,
  getPostLoginRedirectPath,
  isUserAccessPending,
  saveStoredUser,
} from "@/app/utils/auth.utils";

const AuthConfirmPage = () => {
  const storedUser = useMemo(() => getAuthStoredUser(), []);
  const userId = storedUser?.id ?? storedUser?.user_id;

  const userDetail = useAuthUserDetailQuery(userId);
  const logout = useLogoutMutation();

  useEffect(() => {
    const latestUser = userDetail.data;
    if (!latestUser || Object.keys(latestUser).length === 0) return;

    const nextUser = { ...storedUser, ...latestUser };
    saveStoredUser(nextUser);

    if (!isUserAccessPending(nextUser)) {
      window.location.href = getPostLoginRedirectPath();
    }
  }, [storedUser, userDetail.data]);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // Tetap keluar walau request logout gagal.
    } finally {
      clearAuthData();
      window.location.href = LOGIN_PATH;
    }
  };

  return (
    <AccountPendingPanel
      checking={userDetail.isFetching}
      checkFailed={userDetail.isError}
      loggingOut={logout.isPending}
      onLogout={handleLogout}
    />
  );
};

export default AuthConfirmPage;
