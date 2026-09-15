import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getApiErrorMessage } from "@/app/api/base-url";
import { useLoginMutation, useTwoFactorFlow } from "@/app/hooks";
import { authSetAuthenticatedUser } from "@/app/redux/auth.slice";

import { LoginForm } from "@/app/components/organisms/forms/LoginForm";
import { TwoFactorModal } from "@/app/components/organisms/popup/TwoFactorModal";

import { CONFIRM_PATH } from "@/app/config/auth.config";

import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthPendingLogin,
} from "@/app/types/auth/auth.types";

import {
  getPostLoginRedirectPath,
  isUserAccessPending,
} from "@/app/utils/auth.utils";

const EMPTY_CREDENTIAL_MESSAGE = "Silahkan masukan NIK dan Password Anda!";
const LOGIN_FAILED_MESSAGE =
  "Login gagal. Periksa kembali NIK dan password Anda.";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [warning, setWarning] = useState("");
  const [isTwoFactorOpen, setIsTwoFactorOpen] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<AuthPendingLogin | null>(null);

  const login = useLoginMutation();

  const handleLoginSuccess = useCallback(
    (response: AuthLoginResponse) => {
      toast.success(response.message || "Login berhasil!");

      if (response.user) {
        dispatch(
          authSetAuthenticatedUser({ ...response.user, access_token: response.token }),
        );
      }

      navigate(
        isUserAccessPending(response.user) ? CONFIRM_PATH : getPostLoginRedirectPath(),
        { replace: true },
      );
    },
    [dispatch, navigate],
  );

  const twoFactor = useTwoFactorFlow({
    open: isTwoFactorOpen,
    pendingLogin,
    onSuccess: handleLoginSuccess,
  });

  const showWarning = (message: string) => {
    setWarning(message);
    toast.dismiss();
    toast.warning(message, { position: "top-right" });
  };

  const handleSubmit = async (values: AuthLoginRequest) => {
    setWarning("");

    if (!values.email || !values.password) {
      showWarning(EMPTY_CREDENTIAL_MESSAGE);
      return;
    }

    try {
      const response = await login.mutateAsync(values);

      if (response?.status === true && response.requires_otp_email) {
        toast.dismiss();
        toast.info(
          response.message || "Silahkan periksa email Anda untuk menerima kode OTP.",
          { position: "top-right", autoClose: 5000 },
        );
        setPendingLogin({
          user_id: response.user_id!,
          otp_expires_in: response.otp_expires_in,
        });
        setIsTwoFactorOpen(true);
      } else if (response?.status === true && response.requires_2fa) {
        toast.dismiss();
        toast.info("Masukkan kode dari aplikasi Authenticator Anda.", {
          position: "top-right",
          autoClose: 4000,
        });
        setPendingLogin({ user_id: response.user_id!, requires_2fa: true });
        setIsTwoFactorOpen(true);
      } else {
        throw new Error(response?.message || "NIK atau password salah.");
      }
    } catch (error) {
      showWarning(getApiErrorMessage(error, LOGIN_FAILED_MESSAGE));
      setIsTwoFactorOpen(false);
    }
  };

  return (
    <>
      <LoginForm
        loading={login.isPending}
        warning={warning}
        onSubmit={handleSubmit}
      />

      <TwoFactorModal
        open={isTwoFactorOpen}
        step={twoFactor.step}
        code={twoFactor.code}
        qrCodeUrl={twoFactor.qrCodeUrl}
        submitting={twoFactor.isSubmitting}
        resending={twoFactor.isResending}
        onCodeChange={twoFactor.setCode}
        onSubmit={twoFactor.submit}
        onResendOtp={twoFactor.resendOtp}
        onResetAuthenticator={twoFactor.resetAuthenticator}
        onClose={() => setIsTwoFactorOpen(false)}
      />
    </>
  );
};

export default LoginPage;
