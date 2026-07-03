import { Button, Form, Image, Input, Modal } from "antd";
import {
  getPostLoginRedirectPath,
  isUserAccessPending,
  useLogin_2faMutation,
  useResendOtpEmailMutation,
  useResetTokenMutation,
  useVerifyOtpEmailMutation,
} from "../../rtk/auth.rtk";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authSetAuthenticatedUser } from "../../redux/auth.slice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface LoginData {
  user_id: string | number;
  otp_expires_in?: number;
  requires_2fa?: boolean; // true = returning user, mulai dari step AUTHENTICATOR
}

interface ModalTwoFactProps {
  open: boolean;
  loginData: LoginData | null;
  onCancel: () => void;
}

/**
 * Step flow:
 * 1. EMAIL_OTP    → Verify OTP dari email (always first step setelah login)
 * 2. SCAN_QR      → Jika requires_2fa_setup=true, tampilkan QR untuk scan
 * 3. AUTHENTICATOR → Input kode dari Authenticator app (login/2fa)
 * 4. EMAIL_RESET  → Reset 2FA: minta OTP email dulu, lalu scan QR baru
 */
type StepType = "EMAIL_OTP" | "SCAN_QR" | "AUTHENTICATOR" | "EMAIL_RESET";

const ModalTwoFact = ({ open, loginData, onCancel }: ModalTwoFactProps) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login_2fa, { isLoading: isLoading2fa }] = useLogin_2faMutation();
  const [verifyOtpEmail, { isLoading: isLoadingVerify }] = useVerifyOtpEmailMutation();
  const [resendOtpEmail, { isLoading: isLoadingResend }] = useResendOtpEmailMutation();
  const [resetToken, { isLoading: isLoadingReset }] = useResetTokenMutation();

  const [step, setStep] = useState<StepType>("EMAIL_OTP");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [encryptedUserId, setEncryptedUserId] = useState<string | null>(null);

  const handleLoginSuccess = useCallback(
    (resp) => {
      toast.success(resp.message || "Login berhasil!");
      if (resp.user) {
        dispatch(authSetAuthenticatedUser({ ...resp.user, access_token: resp.token }));
      }

      navigate(isUserAccessPending(resp.user) ? "/confirm" : getPostLoginRedirectPath(), {
        replace: true,
      });
    },
    [dispatch, navigate],
  );

  // Reset state saat modal dibuka
  useEffect(() => {
    if (open) {
      if (loginData?.requires_2fa) {
        // Returning user: sudah punya 2FA, langsung ke step AUTHENTICATOR
        setStep("AUTHENTICATOR");
        setEncryptedUserId(String(loginData.user_id));
      } else {
        // First login: mulai dari verifikasi OTP email
        setStep("EMAIL_OTP");
        setEncryptedUserId(null);
      }
      setQrCodeUrl(null);
      form.resetFields();
    }
  }, [open, loginData, form]);

  const handleSubmit = useCallback(async () => {
    const code = form.getFieldValue("code");
    const userId = loginData?.user_id;

    if (!code) {
      toast.warning("Masukkan kode OTP terlebih dahulu.");
      return;
    }

    try {
      if (step === "EMAIL_OTP") {
        // Step 1: Verifikasi OTP email → POST /login/verify-otp-email
        // Body: { user_id, otp }
        const resp = await verifyOtpEmail({ user_id: userId!, otp: code }).unwrap();

        if (resp?.status && resp?.requires_2fa_setup) {
          // First login: perlu scan QR untuk setup authenticator
          toast.success("OTP Email valid. Silakan scan QR Code berikut.");
          setQrCodeUrl(resp.qr_code_url || null);
          setEncryptedUserId((resp as any).user_id || null);
          setStep("SCAN_QR");
          form.resetFields(["code"]);
        } else if (resp?.status) {
          // Sudah punya authenticator, langsung ke input kode
          toast.success("OTP Email valid. Masukkan kode Authenticator Anda.");
          setEncryptedUserId((resp as any).user_id || null);
          setStep("AUTHENTICATOR");
          form.resetFields(["code"]);
        }
      } else if (step === "SCAN_QR") {
        // Step 2: Setelah scan QR, submit kode authenticator → POST /login/2fa
        const resp = await login_2fa({
          user_id: encryptedUserId || userId!,
          code,
        }).unwrap();

        if (resp?.status && resp?.token) {
          handleLoginSuccess(resp);
        }
      } else if (step === "AUTHENTICATOR") {
        // Step 3: Verifikasi kode Authenticator → POST /login/2fa
        const resp = await login_2fa({
          user_id: encryptedUserId || userId!,
          code,
        }).unwrap();

        if (resp?.status && resp?.token) {
          handleLoginSuccess(resp);
        }
      } else if (step === "EMAIL_RESET") {
        // Verify OTP yang dikirim ke email setelah reset → POST /login/verify-otp-email
        const verifyResp = await verifyOtpEmail({
          user_id: encryptedUserId || userId!,
          otp: code,
        }).unwrap();

        if (verifyResp?.status) {
          toast.success("OTP valid. Silakan scan QR Code baru untuk login.");
          setQrCodeUrl(verifyResp.qr_code_url || null);
          const newUserId = String((verifyResp as any).user_id || encryptedUserId || userId);
          setEncryptedUserId(newUserId);
          setStep("SCAN_QR");
          form.resetFields(["code"]);
        }
      }
    } catch (error: any) {
      const msg =
        error?.data?.message ||
        error?.message ||
        (step === "EMAIL_OTP" || step === "EMAIL_RESET"
          ? "Kode OTP Email salah. Periksa kembali kode Anda."
          : "Kode Authenticator salah. Periksa kembali kode Anda.");
      toast.error(msg);
    }
  }, [form, login_2fa, verifyOtpEmail, step, loginData, encryptedUserId, handleLoginSuccess]);

  const handleResendOtp = async () => {
    if (!loginData?.user_id) return;
    try {
      const resp = await resendOtpEmail({ user_id: loginData.user_id }).unwrap();
      toast.success(resp?.message || "OTP baru telah dikirim ke email Anda.");
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || "Gagal mengirim ulang OTP.";
      toast.error(msg);
    }
  };

  // Klik "Reset Token Authenticator":
  // Hit /reset2fa { user_id } → BE reset token sekaligus kirim OTP ke email
  // Response berisi user_id baru yg harus dipakai untuk verify-otp-email
  const handleResetAuthenticator = async () => {
    const userId = encryptedUserId || loginData?.user_id;
    if (!userId) return;
    try {
      const resp = await resetToken({ user_id: userId }).unwrap();

      // Gunakan user_id dari response reset2fa untuk verify-otp-email berikutnya
      if (resp?.user_id) {
        setEncryptedUserId(String(resp.user_id));
      }

      toast.success(resp?.message || "Token direset. OTP telah dikirim ke email Anda.");
      setStep("EMAIL_RESET");
      form.resetFields(["code"]);
    } catch (error: any) {
      const msg = error?.data?.message || error?.message || "Gagal mereset token. Coba lagi.";
      toast.error(msg);
    }
  };

  const getTitle = () => {
    switch (step) {
      case "EMAIL_OTP":
        return "Verifikasi OTP Email";
      case "EMAIL_RESET":
        return "Reset Authenticator — Verifikasi OTP Email";
      case "SCAN_QR":
        return "Setup Authenticator";
      case "AUTHENTICATOR":
        return "Verifikasi Authenticator";
    }
  };

  const getDescription = () => {
    switch (step) {
      case "EMAIL_OTP":
        return "Masukkan kode OTP yang telah dikirim ke email Anda.";
      case "EMAIL_RESET":
        return "Masukkan kode OTP yang dikirim ke email Anda untuk mereset Authenticator.";
      case "SCAN_QR":
        return "Scan QR Code berikut menggunakan aplikasi Authenticator (Google Authenticator / Authy), lalu masukkan kode yang muncul.";
      case "AUTHENTICATOR":
        return "Masukkan kode 6 digit dari aplikasi Authenticator Anda.";
    }
  };

  const isLoading = isLoading2fa || isLoadingVerify || isLoadingReset;
  const isEmailStep = step === "EMAIL_OTP" || step === "EMAIL_RESET";

  return (
    <Modal
      open={open}
      footer={null}
      centered
      width={420}
      onCancel={onCancel}
      maskClosable={false}
      title={<span className="font-semibold text-gray-800">{getTitle()}</span>}
    >
      <div className="flex flex-col gap-4 items-center py-2">
        {/* Description */}
        <p className="text-gray-500 text-sm text-center">{getDescription()}</p>

        {/* QR Code untuk setup authenticator */}
        {(step === "SCAN_QR") && qrCodeUrl && (
          <div className="flex flex-col items-center gap-2">
            <Image
              src={qrCodeUrl}
              alt="QR Code Authenticator"
              width={180}
              preview={false}
              className="rounded-lg border border-gray-200"
            />
            <p className="text-xs text-gray-400 text-center">
              Scan dengan Google Authenticator atau Authy
            </p>
          </div>
        )}

        {/* Form OTP */}
        <Form form={form} layout="vertical" className="w-full" onFinish={handleSubmit}>
          <Form.Item name="code" className="mb-3">
            <Input.OTP
              length={6}
              size="large"
              style={{ display: "flex", justifyContent: "center" }}
              disabled={isLoading}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full !bg-gradient-to-br from-[#3E99E7] to-[#4666E3]"
            loading={isLoading}
          >
            Konfirmasi
          </Button>

          {/* Resend OTP — hanya tampil di step EMAIL_OTP dan EMAIL_RESET */}
          {isEmailStep && (
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-500">Tidak menerima kode? </span>
              <Button
                type="link"
                size="small"
                className="!p-0 !text-sm font-semibold"
                loading={isLoadingResend}
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Kirim ulang OTP Email
              </Button>
            </div>
          )}

          {/* Reset Authenticator — hanya tampil di step AUTHENTICATOR tanpa QR */}
          {step === "AUTHENTICATOR" && (
            <Button
              danger
              type="text"
              className="w-full mt-3 font-semibold"
              onClick={handleResetAuthenticator}
              disabled={isLoading}
            >
              Reset Token Authenticator
            </Button>
          )}
        </Form>
      </div>
    </Modal>
  );
};

export default ModalTwoFact;
