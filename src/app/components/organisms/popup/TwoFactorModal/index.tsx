import type { FormEvent } from "react";

import { Button } from "@/app/components/atoms";

import Modal from "@/app/components/molecules/Modal";
import { OtpInput } from "@/app/components/molecules/OtpInput";

import { OTP_LENGTH } from "@/app/config/auth.config";

import type { TwoFactorStep } from "@/app/types/auth/auth.types";

const STEP_COPY: Record<TwoFactorStep, { title: string; description: string }> = {
  EMAIL_OTP: {
    title: "Verifikasi OTP Email",
    description: "Masukkan kode OTP yang telah dikirim ke email Anda.",
  },
  EMAIL_RESET: {
    title: "Reset Authenticator — Verifikasi OTP Email",
    description:
      "Masukkan kode OTP yang dikirim ke email Anda untuk mereset Authenticator.",
  },
  SCAN_QR: {
    title: "Setup Authenticator",
    description:
      "Scan QR Code berikut menggunakan aplikasi Authenticator (Google Authenticator / Authy), lalu masukkan kode yang muncul.",
  },
  AUTHENTICATOR: {
    title: "Verifikasi Authenticator",
    description: "Masukkan kode 6 digit dari aplikasi Authenticator Anda.",
  },
};

interface TwoFactorModalProps {
  open: boolean;
  step: TwoFactorStep;
  code: string;
  qrCodeUrl: string | null;
  submitting?: boolean;
  resending?: boolean;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onResendOtp: () => void;
  onResetAuthenticator: () => void;
  onClose: () => void;
}

export function TwoFactorModal({
  open,
  step,
  code,
  qrCodeUrl,
  submitting = false,
  resending = false,
  onCodeChange,
  onSubmit,
  onResendOtp,
  onResetAuthenticator,
  onClose,
}: TwoFactorModalProps) {
  const copy = STEP_COPY[step];
  const isEmailStep = step === "EMAIL_OTP" || step === "EMAIL_RESET";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal open={open} onClose={onClose} width={420} maskClosable={false}>
      <div className="flex flex-col gap-4 p-6">
        <h3 className="pr-6 text-base font-semibold text-gray-800">
          {copy.title}
        </h3>

        <p className="text-center text-sm text-gray-500">{copy.description}</p>

        {step === "SCAN_QR" && qrCodeUrl && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={qrCodeUrl}
              alt="QR Code Authenticator"
              width={180}
              className="rounded-lg border border-gray-200"
            />
            <p className="text-center text-xs text-gray-400">
              Scan dengan Google Authenticator atau Authy
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex w-full flex-col">
          <div className="mb-4">
            <OtpInput
              key={step}
              value={code}
              onChange={onCodeChange}
              length={OTP_LENGTH}
              disabled={submitting}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="md"
            block
            loading={submitting}
          >
            Konfirmasi
          </Button>

          {isEmailStep && (
            <div className="mt-3 flex items-center justify-center gap-1 text-sm">
              <span className="text-gray-500">Tidak menerima kode?</span>
              <button
                type="button"
                onClick={onResendOtp}
                disabled={submitting || resending}
                className="cursor-pointer font-semibold text-[#4666E3] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? "Mengirim..." : "Kirim ulang OTP Email"}
              </button>
            </div>
          )}

          {step === "AUTHENTICATOR" && (
            <Button
              variant="danger"
              block
              className="mt-3 font-semibold"
              onClick={onResetAuthenticator}
              disabled={submitting}
            >
              Reset Token Authenticator
            </Button>
          )}
        </form>
      </div>
    </Modal>
  );
}
