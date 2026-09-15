import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getApiErrorMessage } from "@/app/api/base-url";
import {
  useLogin2faMutation,
  useResendOtpEmailMutation,
  useResetTwoFactorMutation,
  useVerifyOtpEmailMutation,
} from "@/app/hooks/query/auth";

import type {
  AuthLoginResponse,
  AuthPendingLogin,
  AuthUserId,
  TwoFactorStep,
} from "@/app/types/auth/auth.types";

const ERROR_MESSAGE = {
  verifyOtpEmail: "Kode OTP Email tidak valid.",
  login2fa: "Kode Authenticator tidak valid.",
  resendOtpEmail: "Gagal mengirim ulang OTP.",
  resetToken: "Gagal mereset token 2FA.",
};

interface UseTwoFactorFlowOptions {
  open: boolean;
  pendingLogin: AuthPendingLogin | null;
  onSuccess: (response: AuthLoginResponse) => void;
}

export const useTwoFactorFlow = ({
  open,
  pendingLogin,
  onSuccess,
}: UseTwoFactorFlowOptions) => {
  const [step, setStep] = useState<TwoFactorStep>("EMAIL_OTP");
  const [code, setCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [encryptedUserId, setEncryptedUserId] = useState<AuthUserId | null>(
    null,
  );

  const verifyOtpEmail = useVerifyOtpEmailMutation();
  const login2fa = useLogin2faMutation();
  const resendOtpEmail = useResendOtpEmailMutation();
  const resetToken = useResetTwoFactorMutation();

  useEffect(() => {
    if (!open) return;

    if (pendingLogin?.requires_2fa) {
      setStep("AUTHENTICATOR");
      setEncryptedUserId(String(pendingLogin.user_id));
    } else {
      setStep("EMAIL_OTP");
      setEncryptedUserId(null);
    }

    setQrCodeUrl(null);
    setCode("");
  }, [open, pendingLogin]);

  const submitAuthenticatorCode = useCallback(
    async (userId: AuthUserId) => {
      try {
        const response = await login2fa.mutateAsync({ user_id: userId, code });
        if (response?.status && response?.token) onSuccess(response);
      } catch (error) {
        toast.error(getApiErrorMessage(error, ERROR_MESSAGE.login2fa));
      }
    },
    [code, login2fa, onSuccess],
  );

  const submit = useCallback(async () => {
    const userId = pendingLogin?.user_id;

    if (!code) {
      toast.warning("Masukkan kode OTP terlebih dahulu.");
      return;
    }

    if (step === "SCAN_QR" || step === "AUTHENTICATOR") {
      await submitAuthenticatorCode(encryptedUserId || userId!);
      return;
    }

    try {
      if (step === "EMAIL_OTP") {
        const response = await verifyOtpEmail.mutateAsync({
          user_id: userId!,
          otp: code,
        });

        if (response?.status && response?.requires_2fa_setup) {
          toast.success("OTP Email valid. Silakan scan QR Code berikut.");
          setQrCodeUrl(response.qr_code_url || null);
          setEncryptedUserId(response.user_id || null);
          setStep("SCAN_QR");
          setCode("");
        } else if (response?.status) {
          toast.success("OTP Email valid. Masukkan kode Authenticator Anda.");
          setEncryptedUserId(response.user_id || null);
          setStep("AUTHENTICATOR");
          setCode("");
        }
        return;
      }

      const response = await verifyOtpEmail.mutateAsync({
        user_id: encryptedUserId || userId!,
        otp: code,
      });

      if (response?.status) {
        toast.success("OTP valid. Silakan scan QR Code baru untuk login.");
        setQrCodeUrl(response.qr_code_url || null);
        setEncryptedUserId(
          String(response.user_id || encryptedUserId || userId),
        );
        setStep("SCAN_QR");
        setCode("");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, ERROR_MESSAGE.verifyOtpEmail));
    }
  }, [
    code,
    encryptedUserId,
    pendingLogin,
    step,
    submitAuthenticatorCode,
    verifyOtpEmail,
  ]);

  const resendOtp = useCallback(async () => {
    if (!pendingLogin?.user_id) return;

    try {
      const response = await resendOtpEmail.mutateAsync({
        user_id: pendingLogin.user_id,
      });
      toast.success(response?.message || "OTP baru telah dikirim ke email Anda.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, ERROR_MESSAGE.resendOtpEmail));
    }
  }, [pendingLogin, resendOtpEmail]);

  const resetAuthenticator = useCallback(async () => {
    const userId = encryptedUserId || pendingLogin?.user_id;
    if (!userId) return;

    try {
      const response = await resetToken.mutateAsync({ user_id: userId });

      if (response?.user_id) setEncryptedUserId(String(response.user_id));

      toast.success(
        response?.message || "Token direset. OTP telah dikirim ke email Anda.",
      );
      setStep("EMAIL_RESET");
      setCode("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, ERROR_MESSAGE.resetToken));
    }
  }, [encryptedUserId, pendingLogin, resetToken]);

  return {
    step,
    code,
    setCode,
    qrCodeUrl,
    submit,
    resendOtp,
    resetAuthenticator,
    isSubmitting:
      login2fa.isPending || verifyOtpEmail.isPending || resetToken.isPending,
    isResending: resendOtpEmail.isPending,
  };
};
