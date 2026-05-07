// Redux Toolkit
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Mutations
import { toast } from "react-toastify";
import { authLogout } from "@/modules/auth/redux/auth.slice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_BASE_URL || "api.local",
  credentials: "omit",
  prepareHeaders(headers) {
    headers.set("ngrok-skip-browser-warning", "any");
    return headers;
  },
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
  paramsSerializer: (params) => {
    return new URLSearchParams(params).toString().replace(/\+/g, "%20");
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const isMock = import.meta.env.VITE_USE_MOCK === "true";
  if (isMock) {
    const url = typeof args === 'string' ? args : args.url;
    // Delay for realistic UI behavior
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (url === 'login') {
      // Mock: email 'baru' = first login (needs 2FA setup), lainnya = returning user
      return {
        data: {
          status: true,
          requires_otp_email: true,
          message: "Silahkan periksa email Anda untuk menerima kode OTP. (MOCK)",
          user_id: 2158,
          otp_expires_in: 600,
        }
      };
    }
    if (url === 'login/verify-otp-email') {
      const isFirstLogin = true; // mock: always first login to show QR
      if (isFirstLogin) {
        return {
          data: {
            status: true,
            requires_2fa_setup: true,
            qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth%3A%2F%2Ftotp%2FQosmo%3Amockuser%3Fsecret%3DMOCKSECRET%26issuer%3DQosmo",
            user_id: "eyJpdiI6Im1vY2stdXNlci1pZCIsInZhbHVlIjoibW9jay0xMjMifQ==",
          }
        };
      }
      return {
        data: {
          status: true,
          requires_2fa_setup: false,
          user_id: "eyJpdiI6Im1vY2stdXNlci1pZCIsInZhbHVlIjoibW9jay0xMjMifQ==",
        }
      };
    }
    if (url === 'login/resend-otp-email') {
      return {
        data: {
          status: true,
          message: "OTP baru telah dikirim ke email (MOCK)",
          otp_expires_in: 600,
        }
      };
    }
    if (url === 'reset2fa') {
      return {
        data: {
          status: true,
          message: "Reset 2FA berhasil (MOCK)",
        }
      };
    }
    if (url === 'login/2fa') {
      return {
        data: {
          status: true,
          message: "2FA berhasil diaktifkan (MOCK)",
          token: "mock-token-123|abc",
          user: {
            nik: "mockuser",
            name: "Mock User",
            email: "mock@example.com",
            level_user: 1,
            treg: "0",
            id_telegram: "",
            unit: "regional",
            status: 0,
            last_login: "2026-05-07 12:00:00"
          }
        }
      };
    }
    if (url === 'logout') {
      return { data: { status: true } };
    }
  }

  const result = await baseQuery(args, api, extraOptions);

  // Error handling umum
  if (result.error?.status && result.error?.originalStatus >= 400) {
    const { status, data } = result.error;
    const msg =
      (typeof data === "object" && (data as any).message) ||
      `Request failed with status ${status}`;
    toast.error(msg);
  }

  // Jika token invalid atau session expired
  if (result.error?.status === 401 || result.error?.status === 302) {
    localStorage.removeItem("token"); // hapus token biar auto logout
    api.dispatch(authLogout());
  }

  // Jika FETCH_ERROR (misal jaringan mati / gagal fetch)
  if (result.error?.status === "FETCH_ERROR") {
    localStorage.removeItem("token");
    api.dispatch(authLogout());
  }

  return result;
};

export const emptySplitApi = createApi({
  reducerPath: "emptyApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
