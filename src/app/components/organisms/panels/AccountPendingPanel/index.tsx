import { LuLoaderCircle, LuLogOut, LuShieldCheck } from "react-icons/lu";

import { Button, InlineAlert } from "@/app/components/atoms";

interface AccountPendingPanelProps {
  checking?: boolean;
  checkFailed?: boolean;
  loggingOut?: boolean;
  onLogout: () => void;
}

export function AccountPendingPanel({
  checking = false,
  checkFailed = false,
  loggingOut = false,
  onLogout,
}: AccountPendingPanelProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
        <LuShieldCheck className="size-8" />
      </div>

      <h1 className="mb-3 text-2xl font-semibold text-gray-800">
        Akun Belum Dikonfirmasi
      </h1>

      <p className="mb-4 text-sm leading-6 text-gray-500">
        Login berhasil, tetapi akun Anda belum dikonfirmasi oleh admin. Silakan
        hubungi admin untuk konfirmasi sebelum menggunakan aplikasi. Setelah
        admin melengkapi data, silakan login kembali.
      </p>

      <InlineAlert tone="warning" className="mb-6 text-center">
        <span className="font-normal">
          Minta admin untuk melengkapi data pada akun Anda.
        </span>
      </InlineAlert>

      {checking && (
        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <LuLoaderCircle className="size-4 animate-spin" />
          Memeriksa status akun...
        </div>
      )}

      {checkFailed && (
        <InlineAlert
          tone="warning"
          title="Gagal memeriksa status akun"
          className="mb-4 text-left"
        >
          Silakan coba login kembali atau hubungi admin.
        </InlineAlert>
      )}

      <Button
        variant="danger"
        block
        loading={loggingOut}
        icon={loggingOut ? undefined : <LuLogOut className="size-4" />}
        onClick={onLogout}
      >
        Keluar
      </Button>
    </div>
  );
}
